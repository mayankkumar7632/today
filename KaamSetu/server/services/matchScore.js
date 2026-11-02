// KaamSetu - Job Match Score Service
// Rule-based worker-to-job match scoring (not machine learning)

const Application = require('../models/Application');

// Weights for each match factor (percentage points of the total score).
const WEIGHTS = {
  skill: 40,
  location: 25,
  wage: 10,
  availability: 10,
  rating: 10,
  experience: 5
};

const DAY_NAMES = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

// Small alias mapping so related skill names (e.g. "Polishing" ~ "Painting") score 50.
const SKILL_ALIAS_GROUPS = [
  { canonical: 'painting', aliases: ['paint', 'painting', 'polish', 'polishing', 'polished'] },
  { canonical: 'plumbing', aliases: ['plumber', 'plumbing', 'pipe', 'pipefit'] },
  { canonical: 'electrician', aliases: ['electrician', 'electrical', 'electric', 'wiring', 'wire'] },
  {
    canonical: 'construction',
    aliases: [
      'construction', 'constructionworker', 'labor', 'labour', 'helper', 'mason', 'brick',
      'bricklaying', 'carpentry', 'carpenter', 'woodwork', 'woodworking'
    ]
  }
];

const normalizeSkill = (value) => String(value === undefined || value === null ? '' : value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const isSameSkill = (skillA, skillB) => normalizeSkill(skillA) === normalizeSkill(skillB);

const isRelatedSkill = (skillA, skillB) => {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);
  if (!normA || !normB) return false;
  const groupFor = (value) => SKILL_ALIAS_GROUPS.find((group) =>
    group.aliases.some((alias) => normalizeSkill(alias) === value)
  );
  const groupA = groupFor(normA);
  const groupB = groupFor(normB);
  return Boolean(groupA && groupB && groupA.canonical === groupB.canonical);
};

const hasValidCoordinates = (location) => {
  const coords = location && location.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [longitude, latitude] = coords.map(Number);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return false;
  if (longitude === 0 && latitude === 0) return false;
  return true;
};

const toRadians = (degrees) => (Number(degrees) * Math.PI) / 180;

const haversineDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1.map(Number);
  const [lon2, lat2] = coords2.map(Number);
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

// Skill factor: 100 for exact required-skill match, 50 for related skill, 0 for no match.
// Returns null when the data needed for this factor is missing (factor gets skipped).
const calculateSkillScore = (worker, job) => {
  const requiredSkills = (Array.isArray(job && job.requiredSkills) ? job.requiredSkills : [])
    .map(normalizeSkill)
    .filter(Boolean);
  const workerSkills = (Array.isArray(worker && worker.skills) ? worker.skills : [])
    .map(normalizeSkill)
    .filter(Boolean);

  if (!requiredSkills.length || !workerSkills.length) return null;

  let bestMatch = 0;
  for (const requiredSkill of requiredSkills) {
    let skillScore = 0;
    for (const workerSkill of workerSkills) {
      if (isSameSkill(requiredSkill, workerSkill)) {
        skillScore = 100;
        break;
      }
      if (isRelatedSkill(requiredSkill, workerSkill)) {
        skillScore = Math.max(skillScore, 50);
      }
    }
    bestMatch = Math.max(bestMatch, skillScore);
  }
  return bestMatch;
};

// Location factor: 100 same area/city, 60 same district, or Haversine-based score.
// Returns null when location data is missing (factor gets skipped).
const calculateLocationScore = (worker, job) => {
  const workerLocation = worker ? worker.location : null;
  const jobLocation = job ? job.location : null;
  const workerCoords = workerLocation && hasValidCoordinates(workerLocation) ? workerLocation.coordinates : null;
  const jobCoords = jobLocation && hasValidCoordinates(jobLocation) ? jobLocation.coordinates : null;

  if (workerCoords && jobCoords) {
    const distanceKm = haversineDistance(workerCoords, jobCoords);
    if (distanceKm < 5) return 100;
    if (distanceKm < 15) return 70;
    if (distanceKm < 30) return 40;
    return 0;
  }

  const workerCity = workerLocation && workerLocation.city ? String(workerLocation.city).trim().toLowerCase() : null;
  const jobCity = jobLocation && jobLocation.city ? String(jobLocation.city).trim().toLowerCase() : null;
  if (workerCity && jobCity) {
    return workerCity === jobCity ? 100 : 0;
  }
  if (!workerCity || !jobCity) return null; // area info missing -> skip factor
  return 0;
};

// Wage factor: 100 when the job wage covers the worker's expectation, otherwise proportional.
const calculateWageScore = (worker, job) => {
  const workerWage = Number(worker ? worker.expectedWage : 0);
  const jobWage = Number(job ? job.dailyWage : 0);
  if (!Number.isFinite(workerWage) || workerWage <= 0) return null;
  if (!Number.isFinite(jobWage) || jobWage <= 0) return null;
  if (jobWage >= workerWage) return 100;
  return Math.round((jobWage / workerWage) * 100);
};

// Rating factor: employer average rating / 5 * 100, neutral 60 when no reviews yet.
const calculateRatingScore = (job) => {
  const employer = job ? job.employer : null;
  const employerDoc = employer && typeof employer === 'object' && !Array.isArray(employer) ? employer : null;
  const employerRating = employerDoc && Number.isFinite(Number(employerDoc.avgRating))
    ? Number(employerDoc.avgRating)
    : 0;
  const ratingScore = employerRating > 0 ? (employerRating / 5) * 100 : 60;
  return Math.round(ratingScore);
};

// Experience factor: worker's years of experience vs job's required experience, capped at 100.
const calculateExperienceScore = (worker, job) => {
  const years = Number(worker ? worker.yearsOfExperience : 0);
  const required = Number(job ? job.requiredExperience : 0);
  if (!Number.isFinite(years) || years < 0) return null;
  if (!Number.isFinite(required) || required < 0) return null;
  if (required <= 0) return 100;
  return Math.min(100, Math.round((years / required) * 100));
};

const isSameDay = (dateA, dateB) => {
  const dayA = new Date(dateA);
  const dayB = new Date(dateB);
  if (isNaN(dayA.getTime()) || isNaN(dayB.getTime())) return false;
  return dayA.getFullYear() === dayB.getFullYear() &&
    dayA.getMonth() === dayB.getMonth() &&
    dayA.getDate() === dayB.getDate();
};

// Availability factor: worker must be available on the job date and have no
// already-accepted job that day. Returns null when the availability data is missing.
const calculateAvailabilityScore = async (worker, job) => {
  const availability = worker && worker.availability ? String(worker.availability).trim().toLowerCase() : '';
  if (!availability) return null;

  const jobDate = job ? job.jobDate : null;
  const jobDay = jobDate ? new Date(jobDate) : null;
  if (!jobDay || isNaN(jobDay.getTime())) return 0;
  const dayName = DAY_NAMES[jobDay.getDay()];
  const dayAvailable = Boolean(dayName) && availability.includes(dayName);
  if (!dayAvailable) return 0;

  const workerId = worker && worker.user ? worker.user : worker;
  let conflict = false;
  try {
    const acceptedApplications = await Application.find({
      worker: workerId,
      status: 'accepted',
      job: { $ne: job._id }
    }).populate('job', 'jobDate');

    conflict = acceptedApplications.some((application) => {
      const acceptedJob = application.job;
      if (!acceptedJob || !acceptedJob.jobDate) return false;
      return isSameDay(acceptedJob.jobDate, job.jobDate);
    });
  } catch (error) {
    conflict = false;
  }

  return conflict ? 0 : 100;
};

// ===========================
// Calculate Total Match Score for a Worker-Job Pair
// ===========================
// Returns { score: 0-100 (integer), breakdown: { skill, location, wage, availability, rating, experience } }

const calculateMatch = async (worker, job) => {
  const skillScore = calculateSkillScore(worker, job);
  const locationScore = calculateLocationScore(worker, job);
  const wageScore = calculateWageScore(worker, job);
  const ratingScore = calculateRatingScore(job);
  const experienceScore = calculateExperienceScore(worker, job);
  const availabilityScore = await calculateAvailabilityScore(worker, job);

  const factors = [
    { key: 'skill', score: skillScore, weight: WEIGHTS.skill },
    { key: 'location', score: locationScore, weight: WEIGHTS.location },
    { key: 'wage', score: wageScore, weight: WEIGHTS.wage },
    { key: 'availability', score: availabilityScore, weight: WEIGHTS.availability },
    { key: 'rating', score: ratingScore, weight: WEIGHTS.rating },
    { key: 'experience', score: experienceScore, weight: WEIGHTS.experience }
  ];

  const presentFactors = factors.filter((factor) => factor.score !== null && factor.score !== undefined);
  const contributions = {};
  for (const factor of factors) {
    contributions[factor.key] = null;
  }

  let score = 0;
  if (presentFactors.length > 0) {
    const weightSum = presentFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedSum = presentFactors.reduce((sum, factor) => sum + (factor.score * factor.weight) / 100, 0);
    let total = weightedSum / (weightSum / 100);
    const skillValue = factors.find((factor) => factor.key === 'skill') ?.score;
    if (skillValue === 0) total = Math.min(total, 30); // Hard cap when skills do not match at all
    score = Math.round(total);

    for (const factor of presentFactors) {
      const rawContribution = (factor.score * factor.weight) / 100;
      contributions[factor.key] = Math.round((rawContribution / (weightSum / 100)) * 100) / 100;
    }
  }

  const breakdown = {};
  for (const factor of factors) {
    breakdown[factor.key] = factor.score === null || factor.score === undefined ? null : Math.round(factor.score);
  }

  return { score, breakdown, contributions };
};

module.exports = {
  calculateMatch,
  calculateSkillScore,
  calculateLocationScore,
  calculateWageScore,
  calculateRatingScore,
  calculateExperienceScore,
  calculateAvailabilityScore,
  WEIGHTS
};
