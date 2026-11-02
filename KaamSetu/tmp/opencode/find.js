import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobAPI, applicationAPI, locationAPI, workerAPI } from "../../services/api";
import MatchBadge from "../../components/MatchBadge";
const calculateDistance = (from, to) => {
  const toRadians = (value) => value * Math.PI / 180;
  const [longitude1, latitude1] = from;
  const [longitude2, latitude2] = to;
  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);
  const a = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) * Math.sin(longitudeDifference / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};
const FindJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: "", city: "" });
  const [applying, setApplying] = useState(null);
  const [radius, setRadius] = useState("10");
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [minMatch, setMinMatch] = useState(0);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  useEffect(() => {
    loadJobs();
  }, [sortBy, minMatch]);
  const loadJobs = async () => {
    try {
      const params = { ...filters };
      if (sortBy === "match") params.sort = "match";
      if (minMatch) params.minMatch = String(minMatch);
      const [jobsResponse, profileResponse] = await Promise.all([
        jobAPI.getAll(params),
        workerAPI.getProfile().catch(() => null)
      ]);
      const profileData = profileResponse?.data || null;
      const skills = Array.isArray(profileData?.skills) ? profileData.skills : [];
      const expectedWage = Number(profileData?.expectedWage) || 0;
      const location = profileData?.location;
      const hasArea = Boolean(
        location && location.city || Array.isArray(location?.coordinates) && location.coordinates.length === 2 && location.coordinates.some((c) => Number(c) !== 0)
      );
      setProfileIncomplete(skills.length === 0 || !hasArea || expectedWage <= 0);
      const workerCoordinates = profileResponse?.data?.location?.coordinates;
      const hasWorkerCoordinates = Array.isArray(workerCoordinates) && workerCoordinates.length === 2 && workerCoordinates.some((coordinate) => Number(coordinate) !== 0);
      const jobsWithDistance = jobsResponse.data.map((job) => {
        const jobCoordinates = job.location?.coordinates;
        const hasJobCoordinates = Array.isArray(jobCoordinates) && jobCoordinates.length === 2 && jobCoordinates.some((coordinate) => Number(coordinate) !== 0);
        if (!hasWorkerCoordinates || !hasJobCoordinates) return job;
        return {
          ...job,
          distance: calculateDistance(workerCoordinates.map(Number), jobCoordinates.map(Number))
        };
      });
      setJobs(jobsWithDistance);
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    loadJobs();
  };
  const findJobsNearMe = () => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setNearbyError("Location access requires HTTPS or localhost. Please open the site on a secure URL and allow location permission.");
      return;
    }
    setLocationLoading(true);
    setNearbyError("");
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await locationAPI.findNearbyJobs({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          radius
        });
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        setNearbyError(error.message);
      } finally {
        setLoading(false);
        setLocationLoading(false);
      }
    }, (error) => {
      const messages = { 1: "Location permission was denied.", 2: "Your location is currently unavailable.", 3: "Location request timed out." };
      setNearbyError(messages[error.code] || "Could not get your location.");
      setLocationLoading(false);
    }, { enableHighAccuracy: true, timeout: 1e4, maximumAge: 3e5 });
  };
  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await applicationAPI.apply({ jobId });
      alert("Application submitted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(null);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("h1", null, "Find Jobs"), /* @__PURE__ */ React.createElement("form", { className: "search-form", onSubmit: handleSearch }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search by skill (e.g., painting, plumbing)",
      value: filters.skills,
      onChange: (e) => setFilters({ ...filters, skills: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search by city",
      value: filters.city,
      onChange: (e) => setFilters({ ...filters, city: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Search")), /* @__PURE__ */ React.createElement("div", { className: "job-match-controls" }, /* @__PURE__ */ React.createElement("label", null, "Sort by", /* @__PURE__ */ React.createElement("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "match" }, "Best match"), /* @__PURE__ */ React.createElement("option", { value: "recent" }, "Most recent"))), /* @__PURE__ */ React.createElement("label", null, "Minimum match", /* @__PURE__ */ React.createElement("select", { value: String(minMatch), onChange: (e) => setMinMatch(Number(e.target.value)) }, /* @__PURE__ */ React.createElement("option", { value: "0" }, "Any"), /* @__PURE__ */ React.createElement("option", { value: "50" }, "50%"), /* @__PURE__ */ React.createElement("option", { value: "75" }, "75%")))), /* @__PURE__ */ React.createElement("div", { className: "nearby-controls" }, /* @__PURE__ */ React.createElement("label", null, "Nearby radius", /* @__PURE__ */ React.createElement("select", { value: radius, onChange: (e) => setRadius(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "5" }, "5 km"), /* @__PURE__ */ React.createElement("option", { value: "10" }, "10 km"), /* @__PURE__ */ React.createElement("option", { value: "25" }, "25 km"), /* @__PURE__ */ React.createElement("option", { value: "50" }, "50 km"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary location-button", onClick: findJobsNearMe, disabled: locationLoading || loading }, locationLoading ? "Finding nearby jobs..." : "Jobs near me")), nearbyError && /* @__PURE__ */ React.createElement("div", { className: "alert alert-error" }, nearbyError), profileIncomplete && /* @__PURE__ */ React.createElement("div", { className: "profile-banner" }, /* @__PURE__ */ React.createElement("span", null, "Complete your profile for better matches"), /* @__PURE__ */ React.createElement(Link, { to: "/worker/profile", className: "btn btn-secondary btn-small" }, "Complete Profile")), loading ? /* @__PURE__ */ React.createElement("div", { className: "loading-container" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" })) : jobs.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("p", null, "No jobs found. Try different filters.")) : /* @__PURE__ */ React.createElement("div", { className: "jobs-list" }, jobs.map((job) => /* @__PURE__ */ React.createElement("div", { key: job._id, className: "job-card" }, /* @__PURE__ */ React.createElement("div", { className: "job-card-header" }, /* @__PURE__ */ React.createElement("h3", null, job.title), job.matchScore !== void 0 && job.matchScore !== null && /* @__PURE__ */ React.createElement(MatchBadge, { score: job.matchScore, breakdown: job.breakdown }), /* @__PURE__ */ React.createElement("span", { className: "job-status" }, job.status)), /* @__PURE__ */ React.createElement("p", { className: "job-description" }, job.description), /* @__PURE__ */ React.createElement("div", { className: "job-details" }, /* @__PURE__ */ React.createElement("span", { className: "job-wage" }, "\u20B9", job.dailyWage, "/day"), job.location?.city && /* @__PURE__ */ React.createElement("span", { className: "job-location" }, job.location.city), typeof job.distance === "number" && /* @__PURE__ */ React.createElement("span", { className: "job-distance" }, job.distance.toFixed(1), " km away"), /* @__PURE__ */ React.createElement("span", { className: "job-date" }, new Date(job.jobDate).toLocaleDateString())), job.requiredSkills?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "job-skills" }, job.requiredSkills.map((skill, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "skill-tag" }, skill))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary btn-small",
      onClick: () => handleApply(job._id),
      disabled: applying === job._id
    },
    applying === job._id ? "Applying..." : "Apply Now"
  )))));
};
export default FindJobs;
