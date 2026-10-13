// KaamSetu - Application Controller
// This file handles job applications: apply, accept, reject, complete, cancel

const Application = require('../models/Application');
const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const Notification = require('../models/Notification');

// ===========================
// Apply for a Job
// ===========================
// POST /api/applications

const applyForJob = async (req, res) => {
  try {
    const { jobId, message } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job ID.'
      });
    }

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications.'
      });
    }

    // Check if worker already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      worker: req.user.id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      worker: req.user.id,
      employer: job.employer,
      message: message || ''
    });

    await application.populate([
      { path: 'job', select: 'title dailyWage location' },
      { path: 'worker', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for job error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while applying for job.'
    });
  }
};

// ===========================
// Get My Applications (as Worker)
// ===========================
// GET /api/applications/worker

const getWorkerApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { worker: req.user.id };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select: 'title dailyWage location jobDate status requiredSkills'
      })
      .populate('employer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get worker applications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications.'
    });
  }
};

// ===========================
// Get Applications for My Jobs (as Employer)
// ===========================
// GET /api/applications/employer

const getEmployerApplications = async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const filter = { employer: req.user.id };

    if (jobId) {
      filter.job = jobId;
    }

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select: 'title dailyWage location jobDate'
      })
      .populate({
        path: 'worker',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get employer applications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications.'
    });
  }
};

// ===========================
// Accept Application (Employer only)
// ===========================
// PUT /api/applications/:id/accept

const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    // Check if the employer owns this job
    if (application.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage applications for your own jobs.'
      });
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}.`
      });
    }

    // Accept the application
    application.status = 'accepted';
    application.respondedAt = new Date();
    await application.save();

    // Update job's workersAccepted count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { workersAccepted: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });
  } catch (error) {
    console.error('Accept application error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting application.'
    });
  }
};

// ===========================
// Reject Application (Employer only)
// ===========================
// PUT /api/applications/:id/reject

const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage applications for your own jobs.'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}.`
      });
    }

    application.status = 'rejected';
    application.respondedAt = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application rejected',
      data: application
    });
  } catch (error) {
    console.error('Reject application error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting application.'
    });
  }
};

// ===========================
// Mark Job as Completed (Employer only)
// ===========================
// PUT /api/applications/:id/complete

const completeApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only complete applications for your own jobs.'
      });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted applications can be marked as completed.'
      });
    }

    application.status = 'completed';
    application.completedAt = new Date();
    await application.save();

    // Update worker's completed jobs count
    await WorkerProfile.findOneAndUpdate(
      { user: application.worker },
      { $inc: { completedJobs: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Job marked as completed',
      data: application
    });
  } catch (error) {
    console.error('Complete application error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while completing application.'
    });
  }
};

// ===========================
// Cancel Application (Worker only - if still pending)
// ===========================
// PUT /api/applications/:id/cancel

const cancelApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own applications.'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be cancelled.'
      });
    }

    application.status = 'cancelled';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application cancelled',
      data: application
    });
  } catch (error) {
    console.error('Cancel application error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling application.'
    });
  }
};

module.exports = {
  applyForJob,
  getWorkerApplications,
  getEmployerApplications,
  acceptApplication,
  rejectApplication,
  completeApplication,
  cancelApplication
};
