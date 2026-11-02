// Schedules a daily reminder run for jobs taking place tomorrow.

const cron = require('node-cron');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { notifyUser } = require('./notificationService');

const startJobReminderScheduler = () => {
  // This follows the server's local timezone; run the server in the intended
  // business timezone so 6 PM matches the users' local evening.
  cron.schedule('0 18 * * *', async () => {
    try {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      const followingDay = new Date(tomorrowStart);
      followingDay.setDate(followingDay.getDate() + 1);

      const jobs = await Job.find({
        jobDate: { $gte: tomorrowStart, $lt: followingDay },
        status: { $nin: ['cancelled', 'completed'] }
      }).populate('employer', 'name');

      for (const job of jobs) {
        const acceptedApplications = await Application.find({
          job: job._id,
          status: 'accepted'
        }).populate('worker', 'name');

        const data = {
          jobTitle: job.title,
          jobDate: job.jobDate,
          location: job.location.city || job.location.address || 'the agreed location'
        };

        // Remind the employer for every upcoming job, and each accepted worker.
        if (job.employer) void notifyUser(job.employer._id, 'job_reminder', data);
        for (const application of acceptedApplications) {
          if (application.worker) {
            void notifyUser(application.worker._id, 'job_reminder', data);
          }
        }
      }
    } catch (error) {
      console.error('Daily job reminder run failed:', error.message);
    }
  });

  console.log('Daily job reminders scheduled for 6 PM server time');
};

module.exports = { startJobReminderScheduler };
