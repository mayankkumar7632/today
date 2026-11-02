// Centralized notification copy keeps email and SMS wording consistent.

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'the scheduled date';
};

const truncateSms = (message) => (
  message.length < 160 ? message : `${message.slice(0, 156)}...`
);

const makeTemplate = (subject, emailText, smsText) => ({
  subject,
  emailText,
  smsText: truncateSms(smsText)
});

const templates = {
  worker_applied: (data) => makeTemplate(
    'A worker applied for your job',
    `${data.workerName || 'A worker'} applied for your ${data.jobTitle || 'job'} job on ${formatDate(data.jobDate)}.`,
    `${data.workerName || 'A worker'} applied for your ${data.jobTitle || 'job'} job on ${formatDate(data.jobDate)}`
  ),

  application_accepted: (data) => makeTemplate(
    'Your job application was accepted',
    `Your application for ${data.jobTitle || 'the job'} was accepted. Date: ${formatDate(data.jobDate)}. Wage: Rs ${data.dailyWage ?? 'not specified'}/day. Location: ${data.location || 'not specified'}. Employer phone: ${data.employerPhone || 'not available'}.`,
    `Accepted: ${data.jobTitle || 'job'}, ${formatDate(data.jobDate)}, Rs ${data.dailyWage ?? '?'}/day, ${data.location || 'location not set'}. Employer: ${data.employerPhone || 'not available'}`
  ),

  application_rejected: (data) => makeTemplate(
    'Your job application was not accepted',
    `Your application for ${data.jobTitle || 'the job'} was not accepted. Date: ${formatDate(data.jobDate)}. Wage: Rs ${data.dailyWage ?? 'not specified'}/day. Location: ${data.location || 'not specified'}.`,
    `Not accepted: ${data.jobTitle || 'job'}, ${formatDate(data.jobDate)}, Rs ${data.dailyWage ?? '?'}/day, ${data.location || 'location not set'}`
  ),

  job_reminder: (data) => makeTemplate(
    'Reminder: your job is tomorrow',
    `Reminder: ${data.jobTitle || 'Your job'} is scheduled for tomorrow (${formatDate(data.jobDate)}) at ${data.location || 'the agreed location'}.`,
    `Reminder: ${data.jobTitle || 'Job'} is tomorrow (${formatDate(data.jobDate)}) at ${data.location || 'the agreed location'}`
  ),

  job_completed: (data) => makeTemplate(
    'Job completed',
    `${data.jobTitle || 'Your job'} is complete. Please leave a review for the other participant.`,
    `${data.jobTitle || 'Your job'} is complete. Please leave a review for the other participant.`
  ),

  complaint_filed: (data) => {
    if (data.recipientRole === 'admin') {
      return makeTemplate(
        'A new complaint was filed',
        `A complaint was filed by ${data.reporterName || 'a user'}. Ticket: ${data.ticketNumber}. Reason: ${data.reason || 'not specified'}.`,
        `New complaint ${data.ticketNumber} from ${data.reporterName || 'a user'}: ${data.reason || 'no reason given'}`
      );
    }
    return makeTemplate(
      'Your complaint was received',
      `Your complaint has been filed. Your ticket number is ${data.ticketNumber}. The admin team will review it.`,
      `Complaint filed. Ticket number: ${data.ticketNumber}. Admin will review it.`
    );
  },

  complaint_status_updated: (data) => makeTemplate(
    'Your complaint status was updated',
    `Your complaint ${data.ticketNumber ? `(ticket ${data.ticketNumber}) ` : ''}is now ${data.status || 'updated'}. Admin note: ${data.adminNotes || 'No additional note.'}`,
    `Complaint ${data.ticketNumber || ''} status: ${data.status || 'updated'}. Note: ${data.adminNotes || 'No note'}`
  ),

  new_matching_job: (data) => makeTemplate(
    'A new job matches your profile',
    `${data.jobTitle || 'A new job'} in ${data.location || 'your area'} matches your skills. Wage: Rs ${data.dailyWage ?? 'not specified'}/day. Date: ${formatDate(data.jobDate)}.`,
    `Matching job: ${data.jobTitle || 'New job'} in ${data.location || 'your area'}, Rs ${data.dailyWage ?? '?'}/day, ${formatDate(data.jobDate)}`
  ),

  review_received: (data) => makeTemplate(
    'You received a new review',
    `${data.reviewerName || 'A user'} left you a ${data.rating}/5 review for ${data.jobTitle || 'a completed job'}.`,
    `New ${data.rating}/5 review for ${data.jobTitle || 'your job'} from ${data.reviewerName || 'a user'}`
  ),

  account_suspended: (data) => makeTemplate(
    'Your KaamSetu account was suspended',
    `Your account has been suspended. Reason: ${data.reason || 'No reason provided.'} Please contact the admin team.`,
    `Account suspended. Reason: ${data.reason || 'No reason provided.'}`
  ),

  account_deleted: (data) => makeTemplate(
    'Your KaamSetu account was deleted',
    `Your account has been deleted. Reason: ${data.reason || 'No reason provided.'} Your data will remain available according to the platform record policy.`,
    `Account deleted. Reason: ${data.reason || 'No reason provided.'}`
  ),

  notification_test: () => makeTemplate(
    'KaamSetu notification test',
    'This is a test email from KaamSetu. Your notification settings are working.',
    'KaamSetu test notification: your SMS settings are working.'
  )
};

module.exports = templates;
