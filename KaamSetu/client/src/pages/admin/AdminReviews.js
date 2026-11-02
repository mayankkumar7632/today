import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const AdminReviews = () => {
  const [tab, setTab] = useState('negative');
  const [reviews, setReviews] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [selectedUserReviews, setSelectedUserReviews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (activeTab = tab) => {
    setLoading(true);
    try {
      if (activeTab === 'flagged') setFlagged((await adminAPI.getFlaggedUsers()).data);
      else setReviews((await adminAPI.getModerationReviews({
        negative: activeTab === 'negative' ? 'true' : undefined,
        reported: activeTab === 'reported' ? 'true' : undefined
      })).data);
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]); // Reload when the selected moderation tab changes.

  const changeTab = next => { setTab(next); setSelectedUserReviews(null); };
  const hideReview = async review => {
    const reason = window.prompt('Reason for hiding this review:');
    if (!reason) return;
    await adminAPI.hideReview(review._id, reason);
    load();
  };
  const moderateUser = async (entry, action) => {
    const label = action === 'suspend' ? 'suspend' : 'soft-delete';
    const reason = window.prompt(`Required reason to ${label} ${entry.user.name}:`);
    if (!reason) return;
    action === 'suspend' ? await adminAPI.suspendUser(entry.user._id, reason) : await adminAPI.softDeleteUser(entry.user._id, reason);
    alert(`User ${label === 'suspend' ? 'suspended' : 'deleted'} successfully.`);
    load('flagged');
  };
  const viewReviews = async entry => {
    const response = await adminAPI.getModerationReviews({});
    setSelectedUserReviews({ name: entry.user.name, data: response.data.filter(review => String(review.reviewee?._id || review.reviewee) === String(entry.user._id)) });
  };

  return <div className="page admin-reviews-page">
    <h1>Review Moderation</h1>
    <div className="filter-tabs">
      {[['negative', 'Negative reviews'], ['reported', 'Reported reviews'], ['flagged', 'Flagged users']].map(([key, label]) =>
        <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => changeTab(key)}>{label}</button>)}
    </div>
    {loading ? <div className="spinner" /> : tab === 'flagged' ? <div>
      {selectedUserReviews && <div className="selected-user-reviews"><h3>{selectedUserReviews.name}'s reviews</h3>{selectedUserReviews.data.map(review => <p key={review._id}>★ {review.rating} — {review.comment || 'No comment'}</p>)}</div>}
      {flagged.map(entry => <article className="flagged-user-card" key={entry.user._id}>
        <h3>{entry.user.name}</h3><p>Average: {entry.averageRating}/5 · Reviews: {entry.reviewCount} · Negative: {entry.negativeCount}</p>
        <div className="action-row"><button className="btn btn-secondary" onClick={() => viewReviews(entry)}>View reviews</button><button className="btn btn-warning" onClick={() => moderateUser(entry, 'suspend')}>Suspend</button><button className="btn btn-danger" onClick={() => moderateUser(entry, 'delete')}>Delete</button></div>
      </article>)}
      {!flagged.length && <p>No users meet the automatic review flags.</p>}
    </div> : reviews.map(review => <article className="review-card admin-review-row" key={review._id}>
      <p><strong>{review.reviewer?.name}</strong> reviewed <strong>{review.reviewee?.name}</strong> — {review.rating}/5</p>
      <p>{review.comment || 'No comment'}</p><small>{review.reported ? 'Reported' : ''}</small>
      {!review.adminHidden && <button className="btn btn-danger" onClick={() => hideReview(review)}>Hide</button>}
    </article>)}
  </div>;
};

export default AdminReviews;
