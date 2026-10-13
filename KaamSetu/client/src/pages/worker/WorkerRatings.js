// KaamSetu - Worker Ratings Page

import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/api';
import StarRating from '../../components/StarRating';

const WorkerRatings = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getMyReviews();
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>My Reviews</h1>
      {reviews.length === 0 ? (
        <div className="empty-state"><p>No reviews yet.</p></div>
      ) : (
        <div className="applications-list">
          {reviews.map(r => (
            <div key={r._id} className="application-card">
              <h3>Review for: {r.reviewee?.name}</h3>
              <StarRating rating={r.ratings?.overall || 0} readonly />
              <p>{r.comment}</p>
              <p><small>Job: {r.job?.title} | {new Date(r.createdAt).toLocaleDateString()}</small></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerRatings;
