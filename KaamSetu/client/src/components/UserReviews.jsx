import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserReviews = ({ userId }) => {
  const { user } = useAuth();
  const [result, setResult] = useState({ averageRating: 0, totalReviews: 0, data: [] });
  const [error, setError] = useState('');

  useEffect(() => { if (userId) reviewAPI.getUserReviews(userId).then(setResult).catch(err => setError(err.message)); }, [userId]);

  const report = async id => {
    const confirmed = window.confirm('Report this review as unfair? It will be checked by an admin.');
    if (!confirmed) return;
    try {
      await reviewAPI.report(id);
      setResult(current => ({ ...current, data: current.data.map(review => review._id === id ? { ...review, reported: true } : review) }));
    } catch (err) { alert(err.message); }
  };

  return <section className="user-reviews">
    <h3>Reviews</h3>
    {error && <p className="error-message">{error}</p>}
    <div className="review-summary"><strong>{result.averageRating || 0}/5</strong><span>★ ({result.totalReviews} reviews)</span></div>
    {result.data.length === 0 && <p>No reviews yet.</p>}
    <div className="review-list">
      {result.data.map(review => <article className="review-card" key={review._id}>
        <div className="review-card-head"><strong>{review.reviewer?.name || 'User'}</strong><span>{review.rating}/5 ★</span></div>
        {review.tags?.length > 0 && <div className="review-tags">{review.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        {review.comment && <p>{review.comment}</p>}
        <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        {user && String(user.id || user._id) === String(userId) && <button className="btn btn-secondary" type="button" disabled={review.reported} onClick={() => report(review._id)}>{review.reported ? 'Reported' : 'Report this review'}</button>}
      </article>)}
    </div>
  </section>;
};

export default UserReviews;
