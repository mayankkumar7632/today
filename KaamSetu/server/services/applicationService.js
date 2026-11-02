const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { notifyUser } = require('./notificationService');
const { sendEmail, emailTemplate } = require('./emailService');

const startOfUtcDay = (value) => {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

class ApplicationError extends Error {
  constructor(message, status = 400, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const applyForJobByWorker = async ({ jobId, workerId, message = '' }) => {
  if (!jobId) throw new ApplicationError('Please provide a job ID.', 400);
  if (!workerId) throw new ApplicationError('Worker authentication is required.', 401);

  const job = await Job.findById(jobId);
  if (!job) throw new ApplicationError('Job not found.', 404);
  if (job.status !== 'open') throw new ApplicationError('This job is no longer accepting applications.', 400);
  if (job.jobDate && startOfUtcDay(job.jobDate) < startOfUtcDay(Date.now())) {
    throw new ApplicationError('This job has expired.', 400);
  }
  if (Number(job.workersAccepted || 0) >= Number(job.workersRequired || 1)) {
    throw new ApplicationError('This job is full.', 400);
  }

  const existingApplication = await Application.findOne({ job: jobId, worker: workerId });
  if (existingApplication) throw new ApplicationError('You have already applied for this job.', 409);

  try {
    const application = await Application.create({
      job: jobId,
      worker: workerId,
      employer: job.employer,
      message
    });

    await application.populate([
      { path: 'job', select: 'title dailyWage location' },
      { path: 'worker', select: 'name email' }
    ]);

    void notifyUser(job.employer, 'worker_applied', {
      workerName: application.worker.name,
      jobTitle: job.title,
      jobDate: job.jobDate,
      title: 'New job application',
      link: '/employer/applications'
    });

    const employer = await User.findById(job.employer);
    const workerName = application.worker.name;
    void sendEmail(
      employer && employer.email,
      'New application on KaamSetu',
      `${workerName} applied for ${job.title}.`,
      emailTemplate('New application received', `<p><strong>${workerName}</strong> applied for <strong>${job.title}</strong>.</p>`)
    ).catch((error) => console.error('Application email failed for employer:', error.message));
    void sendEmail(
      application.worker.email,
      'Application submitted',
      `Your application for ${job.title} was submitted successfully.`,
      emailTemplate('Application submitted', `<p>Your application for <strong>${job.title}</strong> was submitted successfully.</p>`)
    ).catch((error) => console.error('Application confirmation email failed for worker:', error.message));

    return application;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApplicationError('You have already applied for this job.', 409);
    }
    throw error;
  }
};

module.exports = { applyForJobByWorker, ApplicationError };
