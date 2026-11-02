const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const { calculateMatch } = require('./matchScore');
const { applyForJobByWorker, ApplicationError } = require('./applicationService');

const startOfToday = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

const normalize = (text) => String(text || '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\b(please|for|the|job|work|apply|applyto|कर|दो|karo|kar|do|வேலை)\b/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const words = (text) => normalize(text).split(' ').filter((word) => word.length > 1);

const availableJobs = async (workerId) => {
  const applied = await Application.find({ worker: workerId }).select('job');
  const appliedIds = applied.map((item) => item.job);
  return Job.find({
    status: 'open',
    jobDate: { $gte: startOfToday() },
    _id: { $nin: appliedIds },
    $expr: { $lt: [{ $ifNull: ['$workersAccepted', 0] }, { $ifNull: ['$workersRequired', 1] }] }
  }).populate('employer', 'name');
};

const scoreJob = async (job, query, worker) => {
  const searchable = [
    job.title,
    ...(job.requiredSkills || []),
    job.location && job.location.city,
    job.location && job.location.address,
    job.employer && job.employer.name
  ].filter(Boolean).join(' ').toLowerCase();
  const date = job.jobDate ? new Date(job.jobDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const queryWords = words(query).filter((word) => !['first', 'second', 'third', 'show', 'jobs', 'find', 'in'].includes(word));
  let score = queryWords.filter((word) => searchable.includes(word)).length * 3;
  if (job.dailyWage && query.includes(String(job.dailyWage))) score += 3;
  if (date && query.toLowerCase().includes(normalize(date))) score += 3;
  if (job.employer && job.employer.name && normalize(query).includes(normalize(job.employer.name))) score += 5;

  if (worker) {
    try {
      const match = await calculateMatch(worker, job);
      score += Number(match.score || 0) / 100;
    } catch (error) {
      console.error('Assistant job match-score failed:', error.message);
    }
  }
  return score;
};

const formatJob = (job) => `${job.title} in ${job.location && job.location.city ? job.location.city : 'location not specified'}, Rs ${job.dailyWage} per day${job.jobDate ? ` on ${new Date(job.jobDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}${job.employer && job.employer.name ? ` by ${job.employer.name}` : ''}`;

const findMatches = async (text, workerId) => {
  const jobs = await availableJobs(workerId);
  let worker = null;
  if (workerId) worker = await WorkerProfile.findOne({ user: workerId });
  const scored = [];
  for (const job of jobs) {
    scored.push({ job, score: await scoreJob(job, text, worker) });
  }
  return scored.sort((a, b) => b.score - a.score);
};

const command = async (text, state = {}, user) => {
  const input = String(text || '').trim();
  const normalized = input.toLowerCase();
  const workerId = user && (user._id || user.id);
  if (!workerId) return { reply: 'Please log in again.', options: [], state: {}, expectText: false };

  if (/^(yes|yeah|ok|haan|ha|ஆம்)$/.test(normalized.trim()) && state.pendingJobId) {
    if (!mongoose.isValidObjectId(state.pendingJobId)) {
      return { reply: 'That job selection is no longer valid.', options: ['Show jobs'], state: {}, expectText: true };
    }
    try {
      await applyForJobByWorker({ jobId: state.pendingJobId, workerId });
      return { reply: 'Application submitted successfully. Your application is pending.', options: ['Show jobs', 'My applications'], state: {}, expectText: true };
    } catch (error) {
      console.error('Assistant apply confirmation failed:', error.message);
      const status = error instanceof ApplicationError ? error.status : 500;
      const reply = status === 500 ? 'Sorry, I could not submit the application. Please try again.' : error.message;
      return { reply, options: ['Show jobs'], state: {}, expectText: true };
    }
  }

  if (/^(no|cancel|nahi|illa|வேண்டாம்)$/.test(normalized.trim()) || normalized.includes('cancel')) {
    return { reply: 'Cancelled. What else would you like to do?', options: ['Show jobs', 'My applications'], state: {}, expectText: true };
  }

  const choice = /^(the )?(first|1st|1)( one)?$/.test(normalized) ? 0
    : /^(the )?(second|2nd|2)( one)?$/.test(normalized) ? 1
      : /^(the )?(third|3rd|3)( one)?$/.test(normalized) ? 2 : null;
  if (choice !== null && Array.isArray(state.candidateIds) && state.candidateIds[choice]) {
    const existingApplication = await Application.findOne({ worker: workerId, job: state.candidateIds[choice] });
    const job = existingApplication
      ? null
      : await Job.findOne({
        _id: state.candidateIds[choice],
        status: 'open',
        jobDate: { $gte: startOfToday() },
        $expr: { $lt: [{ $ifNull: ['$workersAccepted', 0] }, { $ifNull: ['$workersRequired', 1] }] }
      });
    if (!job) return { reply: 'That job is no longer available.', options: ['Show jobs'], state: {}, expectText: true };
    return { reply: `${formatJob(await job.populate('employer', 'name'))}. Shall I apply?`, options: ['Yes', 'No'], state: { pendingJobId: String(job._id) }, expectText: false };
  }

  if (/apply|i want to apply|apply kar|வேலை.*விண்ண|விண்ணப்ப/.test(normalized)) {
    const matches = await findMatches(normalized, workerId);
    if (!matches.length || matches[0].score === 0) {
      return { reply: 'I could not find a matching available job.', options: ['Show jobs'], state: {}, expectText: true };
    }
    const best = matches[0];
    const runnerUp = matches[1];
    const clearlyBest = best.score > 0 && (!runnerUp || best.score > runnerUp.score + 0.5);
    if (clearlyBest) {
      return { reply: `${formatJob(await best.job.populate('employer', 'name'))}. Shall I apply?`, options: ['Yes', 'No'], state: { pendingJobId: String(best.job._id) }, expectText: false };
    }
    const choices = matches.slice(0, 3);
    return {
      reply: choices.map((item, index) => `${index + 1}. ${formatJob(item.job)}`).join('\n') + '\nWhich one should I apply for? Say first, second or third.',
      options: ['First one', 'Second one', 'Third one'],
      state: { candidateIds: choices.map((item) => String(item.job._id)) },
      expectText: true
    };
  }

  if (/my applications|application status/.test(normalized)) {
    const [pending, accepted, rejected] = await Promise.all([
      Application.countDocuments({ worker: workerId, status: 'pending' }),
      Application.countDocuments({ worker: workerId, status: 'accepted' }),
      Application.countDocuments({ worker: workerId, status: 'rejected' })
    ]);
    return { reply: `Your applications: Pending ${pending}, Accepted ${accepted}, Rejected ${rejected}.`, options: ['Show jobs'], state: {}, expectText: true };
  }

  if (/show jobs|find jobs/.test(normalized)) {
    const matches = await findMatches(normalized, workerId);
    if (!matches.length) return { reply: 'There are no available jobs right now.', options: [], state: {}, expectText: true };
    return {
      reply: 'Here are matching available jobs:\n' + matches.slice(0, 3).map((item, index) => `${index + 1}. ${formatJob(item.job)}`).join('\n'),
      options: ['First one', 'Second one', 'Third one'].slice(0, Math.min(3, matches.length)),
      state: { candidateIds: matches.slice(0, 3).map((item) => String(item.job._id)) },
      expectText: true
    };
  }

  return null;
};

module.exports = { command };
