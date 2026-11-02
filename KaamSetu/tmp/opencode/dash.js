import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { applicationAPI, jobAPI, workerAPI } from "../../services/api";
import MatchBadge from "../../components/MatchBadge";
const isProfileIncomplete = (profileData) => {
  const skills = Array.isArray(profileData?.skills) ? profileData.skills : [];
  const expectedWage = Number(profileData?.expectedWage) || 0;
  const location = profileData?.location;
  const hasArea = Boolean(
    location && location.city || Array.isArray(location?.coordinates) && location.coordinates.length === 2 && location.coordinates.some((c) => Number(c) !== 0)
  );
  return skills.length === 0 || !hasArea || expectedWage <= 0;
};
const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: 0, pending: 0, accepted: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const [appRes, recRes, profileRes] = await Promise.all([
        applicationAPI.getWorkerApplications(),
        jobAPI.getRecommended().catch(() => ({ data: [] })),
        workerAPI.getProfile().catch(() => null)
      ]);
      const apps = appRes.data || [];
      setStats({
        applications: apps.length,
        pending: apps.filter((a) => a.status === "pending").length,
        accepted: apps.filter((a) => a.status === "accepted").length
      });
      setRecommendations((recRes.data || []).slice(0, 3));
      setProfile(profileRes?.data || null);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "loading-container" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), /* @__PURE__ */ React.createElement("p", null, "Loading..."));
  const incomplete = isProfileIncomplete(profile);
  return /* @__PURE__ */ React.createElement("div", { className: "dashboard" }, /* @__PURE__ */ React.createElement("h1", null, "Welcome, ", user.name), /* @__PURE__ */ React.createElement("p", { className: "dashboard-subtitle" }, "Worker Dashboard"), incomplete && /* @__PURE__ */ React.createElement("div", { className: "profile-banner" }, /* @__PURE__ */ React.createElement("span", null, "Complete your profile for better matches"), /* @__PURE__ */ React.createElement(Link, { to: "/worker/profile", className: "btn btn-secondary btn-small" }, "Complete Profile")), /* @__PURE__ */ React.createElement("div", { className: "stats-grid" }, /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("h3", null, stats.applications), /* @__PURE__ */ React.createElement("p", null, "Total Applications")), /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("h3", null, stats.pending), /* @__PURE__ */ React.createElement("p", null, "Pending")), /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("h3", null, stats.accepted), /* @__PURE__ */ React.createElement("p", null, "Accepted"))), /* @__PURE__ */ React.createElement("div", { className: "quick-actions" }, /* @__PURE__ */ React.createElement("h2", null, "Quick Actions"), /* @__PURE__ */ React.createElement("div", { className: "action-buttons" }, /* @__PURE__ */ React.createElement(Link, { to: "/worker/jobs", className: "btn btn-primary" }, "Find Jobs"), /* @__PURE__ */ React.createElement(Link, { to: "/worker/applications", className: "btn btn-secondary" }, "My Applications"), /* @__PURE__ */ React.createElement(Link, { to: "/worker/profile", className: "btn btn-secondary" }, "Edit Profile"))), recommendations.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "section" }, /* @__PURE__ */ React.createElement("h2", null, "Recommended Jobs"), /* @__PURE__ */ React.createElement("div", { className: "jobs-list" }, recommendations.map((job) => /* @__PURE__ */ React.createElement("div", { key: job._id, className: "job-card" }, /* @__PURE__ */ React.createElement("div", { className: "job-card-header" }, /* @__PURE__ */ React.createElement("h3", null, job.title), /* @__PURE__ */ React.createElement(MatchBadge, { score: job.matchScore, breakdown: job.breakdown })), /* @__PURE__ */ React.createElement("p", { className: "job-wage" }, "\u20B9", job.dailyWage, "/day"), typeof job.distance === "number" && /* @__PURE__ */ React.createElement("p", { className: "job-distance" }, job.distance, " km away"))))));
};
export default WorkerDashboard;
