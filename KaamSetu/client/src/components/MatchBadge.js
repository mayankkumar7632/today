// KaamSetu - Match Badge Component
// Shows the worker-job match percentage with a colour and a hover/tap breakdown.

import React, { useState } from 'react';

const BREAKDOWN_LABELS = [
  { key: 'skill', label: 'Skill' },
  { key: 'location', label: 'Location' },
  { key: 'wage', label: 'Wage' },
  { key: 'availability', label: 'Availability' },
  { key: 'rating', label: 'Rating' },
  { key: 'experience', label: 'Experience' }
];

const getMatchColorClass = (score) => {
  const value = Number(score) || 0;
  if (value >= 75) return 'match-badge-green';
  if (value >= 50) return 'match-badge-orange';
  return 'match-badge-grey';
};

const MatchBadge = ({ score, breakdown = {}, contributions }) => {
  const [open, setOpen] = useState(false);
  const value = Number(score);
  const safeScore = Number.isFinite(value) ? Math.round(value) : 0;
  const colorClass = getMatchColorClass(safeScore);
  const source = (contributions && Object.keys(contributions).length > 0) ? contributions : breakdown;

  const breakdownRows = BREAKDOWN_LABELS
    .map(({ key, label }) => ({
      key,
      label,
      value: source && source[key] !== undefined && source[key] !== null ? source[key] : null
    }))
    .filter((row) => row.value !== null);

  const toggleBreakdown = () => setOpen((current) => !current);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleBreakdown();
    }
  };

  return (
    <div className="match-badge-wrap">
      <span
        className={`match-badge ${colorClass}`}
        onClick={toggleBreakdown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${safeScore}% match`}
      >
        {safeScore}% match
      </span>
      {open && (
        <div className="match-badge-breakdown">
          <div className="match-breakdown-title">{safeScore}% match</div>
          {breakdownRows.length > 0 ? (
            breakdownRows.map((row) => (
              <div key={row.key} className="match-breakdown-row">
                {`${row.label}: ${row.value}%`}
              </div>
            ))
          ) : (
            <div className="match-breakdown-row">
              {`Match: ${safeScore}%`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchBadge;
