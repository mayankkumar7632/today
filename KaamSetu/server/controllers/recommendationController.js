// KaamSetu - Recommendation Controller
// This file handles job and worker recommendations

const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const { calculateMatchScore } = require('../services/recommendationService');
const { calculateDistance } = require('../services/locationService');

// ===========================
// Get Job Recommendations for Worker
// ===========================
// GET /api/recommendations/jobs

const getJobRecommendations = async (req, res) => {
  try {
    // Get worker's profile
    const workerProfile = await WorkerProfile.findOne({ user: req.user.id });

    if (!workerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Please create a worker profile first.'
      });
    }

    // Get all open jobs
    const jobs = await Job.find({ status: 'open' })
      .populate('employer', 'name email phone');

    // Calculate match score for each job
    const recommendations = jobs.map(job => {
      let distance = null;

      // Calculate distance if both locations are available
      if (
        workerProfile.location.coordinates[0] !== 0 &&
        job.location.coordinates[0] !== 0
      ) {
        distance = calculateDistance(
          workerProfile.location.coordinates,
          job.location.coordinates
        );
      }

      const matchResult = calculateMatchScore(workerProfile, job, distance);

      return {
        job: job,
        matchScore: matchResult.score,
        reasons: matchResult.reasons,
        breakdown: matchResult.breakdown,
        distance: distance
      };
    });

    // Sort by highest match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Get job recommendations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job recommendations.'
    });
  }
};

// ===========================
// Get Worker Recommendations for Employer's Job
// ===========================
// GET /api/recommendations/workers/:jobId

const getWorkerRecommendations = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get the job details
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Check if employer owns this job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only get recommendations for your own jobs.'
      });
    }

    // Get all worker profiles
    const workers = await WorkerProfile.find()
      .populate('user', 'name email phone profilePhoto');

    // Calculate match score for each worker
    const recommendations = workers.map(worker => {
      let distance = null;

      if (
        worker.location.coordinates[0] !== 0 &&
        job.location.coordinates[0] !== 0
      ) {
        distance = calculateDistance(
          worker.location.coordinates,
          job.location.coordinates
        );
      }

      const matchResult = calculateMatchScore(worker, job, distance);

      return {
        worker: worker,
        matchScore: matchResult.score,
        reasons: matchResult.reasons,
        breakdown: matchResult.breakdown,
        distance: distance
      };
    });

    // Sort by highest match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Get worker recommendations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching worker recommendations.'
    });
  }
};

module.exports = {
  getJobRecommendations,
  getWorkerRecommendations
};
