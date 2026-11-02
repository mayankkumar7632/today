import React, { useState } from "react";
const BREAKDOWN_LABELS = [
  { key: "skill", label: "Skill" },
  { key: "location", label: "Location" },
  { key: "wage", label: "Wage" },
  { key: "availability", label: "Availability" },
  { key: "rating", label: "Rating" },
  { key: "experience", label: "Experience" }
];
const getMatchColorClass = (score) => {
  const value = Number(score) || 0;
  if (value >= 75) return "match-badge-green";
  if (value >= 50) return "match-badge-orange";
  return "match-badge-grey";
};
const MatchBadge = ({ score, breakdown = {} }) => {
  const [open, setOpen] = useState(false);
  const value = Number(score);
  const safeScore = Number.isFinite(value) ? Math.round(value) : 0;
  const colorClass = getMatchColorClass(safeScore);
  const breakdownRows = BREAKDOWN_LABELS.map(({ key, label }) => ({
    key,
    label,
    value: breakdown && breakdown[key] !== void 0 && breakdown[key] !== null ? Math.round(breakdown[key]) : null
  })).filter((row) => row.value !== null);
  const toggleBreakdown = () => setOpen((current) => !current);
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleBreakdown();
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "match-badge-wrap" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `match-badge ${colorClass}`,
      onClick: toggleBreakdown,
      onKeyDown: handleKeyDown,
      role: "button",
      tabIndex: 0,
      "aria-label": `${safeScore}% match`
    },
    safeScore,
    "% match"
  ), open && /* @__PURE__ */ React.createElement("div", { className: "match-badge-breakdown" }, /* @__PURE__ */ React.createElement("div", { className: "match-breakdown-title" }, safeScore, "% match"), breakdownRows.length > 0 ? breakdownRows.map((row) => /* @__PURE__ */ React.createElement("div", { key: row.key, className: "match-breakdown-row" }, `${row.label}: ${row.value}%`)) : /* @__PURE__ */ React.createElement("div", { className: "match-breakdown-row" }, `Match: ${safeScore}%`)));
};
export default MatchBadge;
