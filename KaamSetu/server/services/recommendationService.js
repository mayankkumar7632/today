// KaamSetu - Recommendation Service
// This file calculates match scores between workers and jobs
// Uses a transparent rule-based system (not machine learning)

// ===========================
// Score Weights Configuration
// ===========================
const WEIGHTS = {
  skillMatch: 35,       // 35% - How well worker skills match job requirements
  distance: 20,         // 20% - How close the worker is to the job
  experience: 15,       // 15% - Experience level match
  wageCompatibility: 15, // 15% - Wage expectations match
  availability: 10,     // 10% - Availability match
  rating: 5             // 5% - Worker's rating
};

// ===========================
// Calculate Skill Match Score
// ===========================
// Returns a score from 0 to 100 based on matching skills

const calculateSkillMatch = (workerSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!workerSkills || workerSkills.length === 0) return 0;

  const matchedSkills = requiredSkills.filter(skill =>
    workerSkills.some(ws => ws.toLowerCase() === skill.toLowerCase())
  );

  return (matchedSkills.length / requiredSkills.length) * 100;
};

// ===========================
// Calculate Distance Score
// ===========================
// Returns a score from 0 to 100 based on distance
// Closer = higher score

const calculateDistanceScore = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return 50;

  // Perfect score within 1 km, decreases with distance
  if (distanceKm <= 1) return 100;
  if (distanceKm <= 5) return 80;
  if (distanceKm <= 10) return 60;
  if (distanceKm <= 20) return 40;
  if (distanceKm <= 50) return 20;
  return 5;
};

// ===========================
// Calculate Experience Score
// ===========================
// Returns a score from 0 to 100

const calculateExperienceScore = (workerExp, requiredExp) => {
  if (!requiredExp || requiredExp === 0) return 100;
  if (!workerExp) return 20;

  if (workerExp >= requiredExp) return 100;
  if (workerExp >= requiredExp * 0.7) return 70;
  if (workerExp >= requiredExp * 0.5) return 50;
  return 20;
};

// ===========================
// Calculate Wage Compatibility Score
// ===========================

const calculateWageScore = (workerWage, jobWage) => {
  if (!workerWage || !jobWage) return 50;

  const diff = Math.abs(workerWage - jobWage);
  const percentDiff = (diff / jobWage) * 100;

  if (percentDiff <= 10) return 100;
  if (percentDiff <= 20) return 80;
  if (percentDiff <= 30) return 60;
  if (percentDiff <= 50) return 40;
  return 20;
};

// ===========================
// Calculate Rating Score
// ===========================

const calculateRatingScore = (rating) => {
  if (!rating || rating === 0) return 50; // No rating = neutral
  return (rating / 5) * 100;
};

// ===========================
// Calculate Total Match Score for a Worker-Job Pair
// ===========================

const calculateMatchScore = (worker, job, distanceKm) => {
  const skillScore = calculateSkillMatch(worker.skills, job.requiredSkills);
  const distanceScore = calculateDistanceScore(distanceKm);
  const experienceScore = calculateExperienceScore(
    worker.yearsOfExperience,
    job.requiredExperience
  );
  const wageScore = calculateWageScore(worker.expectedWage, job.dailyWage);
  const ratingScore = calculateRatingScore(worker.averageRating);

  // Calculate weighted total
  const totalScore =
    (skillScore * WEIGHTS.skillMatch / 100) +
    (distanceScore * WEIGHTS.distance / 100) +
    (experienceScore * WEIGHTS.experience / 100) +
    (wageScore * WEIGHTS.wageCompatibility / 100) +
    (50 * WEIGHTS.availability / 100) + // Availability is simplified for now
    (ratingScore * WEIGHTS.rating / 100);

  // Generate reasons for the score
  const reasons = [];
  if (skillScore >= 70) reasons.push('Skills match');
  if (distanceScore >= 60) reasons.push('Nearby location');
  if (experienceScore >= 70) reasons.push('Experience matches');
  if (wageScore >= 70) reasons.push('Wage compatible');
  if (ratingScore >= 60) reasons.push('Good rating');

  return {
    score: Math.round(totalScore),
    reasons,
    breakdown: {
      skillMatch: Math.round(skillScore),
      distance: Math.round(distanceScore),
      experience: Math.round(experienceScore),
      wageCompatibility: Math.round(wageScore),
      rating: Math.round(ratingScore)
    }
  };
};

module.exports = {
  calculateMatchScore,
  calculateSkillMatch,
  calculateDistanceScore,
  WEIGHTS
};
