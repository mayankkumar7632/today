// KaamSetu - Job Controller
// This file handles job creation, updating, deletion, and search

const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const Application = require('../models/Application');
const { normalizeGeoLocation } = require('../utils/geoLocation');
const { notifyUser } = require('../services/notificationService');
const { sendEmail, emailTemplate } = require('../services/emailService');
const { geocodeAddress } = require('../services/geocodingService');
const { calculateMatch } = require('../services/matchScore');
const { calculateDistance } = require('../services/locationService');

const resolveLocation = async (incomingLocation) => {
  const location = incomingLocation && typeof incomingLocation === 'object' && !Array.isArray(incomingLocation)
    ? { ...incomingLocation }
    : {};
  const coordinates = location.coordinates;
  const needsCoordinates = !Array.isArray(coordinates) || coordinates.length !== 2 ||
    (Number(coordinates[0]) === 0 && Number(coordinates[1]) === 0);

  if (needsCoordinates && (location.address || location.city)) {
    // GeoJSON stores longitude first, then latitude.
    location.coordinates = await geocodeAddress(location.address, location.city) || [0, 0];
  }
  return normalizeGeoLocation(location);
};

const notifyMatchingWorkers = async (job) => {
  try {
    const city = job.location.city;
    if (!city || !job.requiredSkills.length) return;

    // Escape city text before using it as a case-insensitive area match.
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillPatterns = job.requiredSkills.map((skill) => {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${escapedSkill}$`, 'i');
    });
    const profiles = await WorkerProfile.find({
      skills: { $in: skillPatterns },
      'location.city': new RegExp(`^${escapedCity}$`, 'i')
    }).select('user');

    for (const profile of profiles) {
      void notifyUser(profile.user, 'new_matching_job', {
        jobTitle: job.title,
        jobDate: job.jobDate,
        dailyWage: job.dailyWage,
        location: city,
        title: 'New matching job',
        link: `/worker/jobs/${job._id}`
      });
    }
  } catch (error) {
    console.error('Matching worker notification lookup failed:', error.message);
  }
};

// ===========================
// Create a New Job
// ===========================
// POST /api/jobs

const createJob = async (req, res) => {
  try {
    const {
      title, description, requiredSkills,
      requiredExperience, dailyWage, location,
      jobDate, workingHours, workersRequired
    } = req.body;

    // Validate required fields
    if (!title || !description || !dailyWage || !location || !jobDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, dailyWage, location, and jobDate.'
      });
    }

    const selectedDate = new Date(`${jobDate}T00:00:00.000Z`);
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() < todayUtc) {
      return res.status(400).json({
        success: false,
        message: 'Job date cannot be before today.'
      });
    }

    // Create the job
    const job = await Job.create({
      employer: req.user.id,
      title,
      description,
      requiredSkills: requiredSkills || [],
      requiredExperience: requiredExperience || 0,
      dailyWage,
      location: await resolveLocation(location),
      jobDate,
      workingHours: workingHours || { start: '08:00', end: '18:00' },
      workersRequired: workersRequired || 1
    });

    // Update employer's job count
    await EmployerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { totalJobsPosted: 1 } }
    );

    // Match by at least one required skill and the worker profile's city.
    void notifyMatchingWorkers(job);

    // Populate employer info before sending response
    await job.populate('employer', 'name email');

    // Send confirmation in the background so email problems do not block job posting.
    const formattedJobDate = job.jobDate ? new Date(job.jobDate).toLocaleDateString() : 'Not specified';
    const city = job.location && job.location.city ? job.location.city : 'Not specified';
    const text = `Your job "${job.title}" was posted successfully. Daily wage: ${job.dailyWage}. Date: ${formattedJobDate}. City: ${city}.`;
    const html = emailTemplate('Job posted successfully', `<p>Your job <strong>${job.title}</strong> was posted successfully.</p><p>Daily wage: ${job.dailyWage}<br>Date: ${formattedJobDate}<br>City: ${city}</p>`);
    void sendEmail(job.employer.email || req.user.email, 'KaamSetu job posted', text, html).catch((error) => console.error('Job posting confirmation email failed:', error.message));

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job.'
    });
  }
};

// ===========================
// Get All Open Jobs (Worker view)
// ===========================
// GET /api/jobs

const getAllJobs = async (req, res) => {
  try {
    const { skills, city, minWage, maxWage, status, sort, minMatch } = req.query;

    // Build filter - default to showing open jobs
    const filter = {};
    filter.status = status || 'open';

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filter.requiredSkills = { $in: skillArray };
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (minWage || maxWage) {
      filter.dailyWage = {};
      if (minWage) filter.dailyWage.$gte = Number(minWage);
      if (maxWage) filter.dailyWage.$lte = Number(maxWage);
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'name email phone avgRating')
      .sort({ createdAt: -1 })
      .limit(50);

    // Worker job match scoring: attach matchScore + breakdown, support sorting and filtering.
    const isWorker = Boolean(req.user && req.user.role === 'worker');
    let data = jobs;
    let workerProfile = null;

    if (isWorker) {
      workerProfile = await WorkerProfile.findOne({ user: req.user.id });
      data = [];

      for (const job of jobs) {
        const jobData = job.toObject();
        if (workerProfile) {
          const { score, breakdown, contributions } = await calculateMatch(workerProfile, job);
          jobData.matchScore = score;
          jobData.breakdown = breakdown;
          jobData.contributions = contributions;
          const hasWorkerCoords = workerProfile.location && Array.isArray(workerProfile.location.coordinates) &&
            workerProfile.location.coordinates.length === 2 &&
            workerProfile.location.coordinates.some((c) => Number(c) !== 0);
          const hasJobCoords = Array.isArray(job.location?.coordinates) && job.location.coordinates.length === 2 &&
            job.location.coordinates.some((c) => Number(c) !== 0);
          if (hasWorkerCoords && hasJobCoords) {
            jobData.distance = calculateDistance(
              workerProfile.location.coordinates,
              job.location.coordinates
            );
          }
        }
        data.push(jobData);
      }

      if (sort === 'match') {
        data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      if (workerProfile && minMatch !== undefined && minMatch !== null && minMatch !== '') {
        const minScore = Number(minMatch);
        if (Number.isFinite(minScore)) {
          data = data.filter((jobData) => typeof jobData.matchScore === 'number' && jobData.matchScore >= minScore);
        }
      }
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Get jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs.'
    });
  }
};

// ===========================
// Get Recommended Jobs for Worker
// ===========================
// GET /api/jobs/recommended - worker only

const getRecommendedJobs = async (req, res) => {
  try {
    const workerProfile = await WorkerProfile.findOne({ user: req.user.id });

    const data = [];
    if (workerProfile) {
      const now = new Date();
      const openJobs = await Job.find({ status: 'open', jobDate: { $gte: now } }).populate('employer', 'name email phone avgRating');
      const applications = await Application.find({ worker: req.user.id }).select('job');
      const appliedJobIds = applications.map((application) => application.job);

      const recommendations = [];
      for (const job of openJobs) {
        if (job.workersAccepted >= job.workersRequired) continue;
        if (appliedJobIds.some((appliedJobId) => appliedJobId.toString() === job._id.toString())) continue;

        const jobData = job.toObject();
        const { score, breakdown, contributions } = await calculateMatch(workerProfile, job);
        jobData.matchScore = score;
        jobData.breakdown = breakdown;
        jobData.contributions = contributions;

        const hasWorkerCoords = workerProfile.location && Array.isArray(workerProfile.location.coordinates) &&
          workerProfile.location.coordinates.length === 2 &&
          workerProfile.location.coordinates.some((c) => Number(c) !== 0);
        const hasJobCoords = Array.isArray(job.location?.coordinates) && job.location.coordinates.length === 2 &&
          job.location.coordinates.some((c) => Number(c) !== 0);
        if (hasWorkerCoords && hasJobCoords) {
          jobData.distance = calculateDistance(
            workerProfile.location.coordinates,
            job.location.coordinates
          );
        }

        recommendations.push(jobData);
      }

      recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      data.push(...recommendations.slice(0, 10));
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Get recommended jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job recommendations.'
    });
  }
};

// ===========================
// Get Single Job by ID
// ===========================
// GET /api/jobs/:id

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email phone profilePhoto');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job.'
    });
  }
};

// ===========================
// Update a Job (Owner only)
// ===========================
// PUT /api/jobs/:id

const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Check if the logged-in user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own jobs.'
      });
    }

    const jobUpdates = { ...req.body };
    if (req.body.location !== undefined && req.body.location !== null) {
      jobUpdates.location = await resolveLocation(req.body.location);
    } else if (req.body.location !== undefined) {
      jobUpdates.location = normalizeGeoLocation(req.body.location);
    }

    // Update the job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      jobUpdates,
      { new: true, runValidators: true }
    ).populate('employer', 'name email');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job.'
    });
  }
};

// ===========================
// Delete a Job (Owner only)
// ===========================
// DELETE /api/jobs/:id

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Check ownership
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs.'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Update employer's job count
    await EmployerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { totalJobsPosted: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job.'
    });
  }
};

// ===========================
// Get Employer's Own Jobs
// ===========================
// GET /api/jobs/employer/my-jobs

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get my jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your jobs.'
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getRecommendedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
};
