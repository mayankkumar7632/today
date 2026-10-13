// KaamSetu - Job Controller
// This file handles job creation, updating, deletion, and search

const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');

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

    // Create the job
    const job = await Job.create({
      employer: req.user.id,
      title,
      description,
      requiredSkills: requiredSkills || [],
      requiredExperience: requiredExperience || 0,
      dailyWage,
      location,
      jobDate,
      workingHours: workingHours || { start: '08:00', end: '18:00' },
      workersRequired: workersRequired || 1
    });

    // Update employer's job count
    await EmployerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { totalJobsPosted: 1 } }
    );

    // Populate employer info before sending response
    await job.populate('employer', 'name email');

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
    const { skills, city, minWage, maxWage, status } = req.query;

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
      .populate('employer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
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

    // Update the job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
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
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
};
