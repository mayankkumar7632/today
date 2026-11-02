// KaamSetu - Application Controller
// This file handles job applications: apply, accept, reject, complete, cancel

const Application = require('../models/Application');
const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { notifyUser } = require('../services/notificationService');
const { sendEmail, emailTemplate } = require('../services/emailService');
const { applyForJobByWorker, ApplicationError } = require('../services/applicationService');

// ===========================
// Apply for a Job
// ===========================
// POST /api/applications

const applyForJob = async (req, res) => {
  try {
    const { jobId, message } = req.body;
    const application = await applyForJobByWorker({ jobId, workerId: req.user.id, message });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for job error:', error.message);
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({
        success: false,
        message: error.message
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
      .populate({
        path: 'employer',
        select: 'name email phone status isActive',
        match: { $or: [{ status: 'active' }, { status: { $exists: false } }], isActive: { $ne: false } }
      })
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
        select: 'name email phone status isActive',
        match: { $or: [{ status: 'active' }, { status: { $exists: false } }], isActive: { $ne: false } }
      })
      .sort({ createdAt: -1 });
      
    const activeApplications = applications.filter(application => application.worker);

    res.status(200).json({
      success: true,
      count: activeApplications.length,
      data: activeApplications
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

    let job;
    try {
      job = await Job.findById(application.job);
    } catch (notificationContextError) {
      console.error('Could not load accepted job notification details:', notificationContextError.message);
    }
    void notifyUser(application.worker, 'application_accepted', {
      jobTitle: job && job.title,
      jobDate: job && job.jobDate,
      dailyWage: job && job.dailyWage,
      location: job && (job.location.city || job.location.address),
      employerPhone: req.user.phone,
      title: 'Application accepted',
      link: '/worker/applications'
    });

    const worker = await User.findById(application.worker);
    const employer = await User.findById(application.employer);
    const jobTitle = job ? job.title : 'the job';
    const workerText = `Your application for ${jobTitle} was accepted. Employer: ${employer ? employer.name : 'the employer'}. Phone: ${employer ? employer.phone : 'Not available'}.`;
    const employerText = `${worker ? worker.name : 'The worker'} was accepted for ${jobTitle}. Worker phone: ${worker ? worker.phone : 'Not available'}.`;
    void sendEmail(worker && worker.email, 'Application accepted', workerText,
      emailTemplate('Application accepted', `<p>Your application for <strong>${jobTitle}</strong> was accepted.</p><p>Employer: ${employer ? employer.name : 'the employer'}<br>Phone: ${employer ? employer.phone : 'Not available'}</p>`)).catch((error) => console.error('Application acceptance email failed for worker:', error.message));
    void sendEmail(employer && employer.email, 'Worker accepted', employerText,
      emailTemplate('Worker accepted', `<p><strong>${worker ? worker.name : 'The worker'}</strong> was accepted for <strong>${jobTitle}</strong>.</p><p>Worker phone: ${worker ? worker.phone : 'Not available'}</p>`)).catch((error) => console.error('Application acceptance email failed for employer:', error.message));

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

    let job;
    try {
      job = await Job.findById(application.job);
    } catch (notificationContextError) {
      console.error('Could not load rejected job notification details:', notificationContextError.message);
    }
    void notifyUser(application.worker, 'application_rejected', {
      jobTitle: job && job.title,
      jobDate: job && job.jobDate,
      dailyWage: job && job.dailyWage,
      location: job && (job.location.city || job.location.address),
      title: 'Application update',
      link: '/worker/applications'
    });

    const worker = await User.findById(application.worker);
    const jobTitle = job ? job.title : 'the job';
    const text = `We are sorry, but your application for ${jobTitle} was not accepted. Please keep applying for other jobs on KaamSetu.`;
    void sendEmail(worker && worker.email, 'Application update', text,
      emailTemplate('Application update', `<p>We are sorry, but your application for <strong>${jobTitle}</strong> was not accepted.</p><p>Please keep applying for other jobs on KaamSetu.</p>`)).catch((error) => console.error('Application rejection email failed for worker:', error.message));

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

    // Mark the parent Job completed only after no accepted application remains.
    // Workers can review a job only after the job itself has completed.
    const remainingAcceptedApplications = await Application.countDocuments({
      job: application.job,
      status: 'accepted'
    });
    if (remainingAcceptedApplications === 0) {
      await Job.findByIdAndUpdate(application.job, { status: 'completed' });
    }

    // Update worker's completed jobs count
    await WorkerProfile.findOneAndUpdate(
      { user: application.worker },
      { $inc: { completedJobs: 1 } }
    );

    const [worker, employer, job] = await Promise.all([
      User.findById(application.worker),
      User.findById(application.employer),
      Job.findById(application.job)
    ]);
    const jobTitle = job ? job.title : 'the job';
    const workerText = `${jobTitle} is complete. Please take a moment to leave a rating for the employer.`;
    const employerText = `${jobTitle} is complete. Please take a moment to leave a rating for the worker.`;
    void sendEmail(worker && worker.email, 'Job completed - leave a rating', workerText,
      emailTemplate('Job completed', `<p>${jobTitle} is complete. Please take a moment to leave a rating for your employer.</p>`)).catch((error) => console.error('Job completion email failed for worker:', error.message));
    void notifyUser(application.worker, 'job_completed', {
      title: 'Job completed',
      message: `${jobTitle} is complete. Leave a review for your employer.`,
      link: `/worker/jobs/${application.job}`,
      jobTitle
    });
    void sendEmail(employer && employer.email, 'Job completed - leave a rating', employerText,
      emailTemplate('Job completed', `<p>${jobTitle} is complete. Please take a moment to leave a rating for the worker.</p>`)).catch((error) => console.error('Job completion email failed for employer:', error.message));

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
