import React, { useState } from 'react';
import { reviewAPI } from '../services/api';

const TAGS = ['On time', 'Good work', 'Paid fairly', 'Rude', 'No show', 'Unsafe'];

const ReviewForm = ({ jobId, revieweeId = '', onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const toggleTag = tag => setTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]);
  const submit = async event => {
    event.preventDefault();
    if (!rating) return setMessage('Please choose a star rating.');
    try {
      await reviewAPI.create({ jobId, revieweeId: revieweeId || undefined, rating, tags, comment });
      setMessage('Review submitted successfully.');
      if (onSubmitted) onSubmitted();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return <form className="review-form" onSubmit={submit}>
    <h3>Leave a review</h3>
    <div className="star-selector" aria-label="Rating">
      {[1,2,3,4,5].map(star => <button type="button" key={star} className={star <= rating ? 'star selected' : 'star'} onClick={() => setRating(star)}>★</button>)}
    </div>
    <div className="tag-chips">
      {TAGS.map(tag => <button type="button" key={tag} className={tags.includes(tag) ? 'tag-chip selected' : 'tag-chip'} onClick={() => toggleTag(tag)}>{tag}</button>)}
    </div>
    <textarea maxLength={500} value={comment} onChange={event => setComment(event.target.value)} placeholder="Share your experience (optional)" />
    <small>{comment.length}/500</small>
    {message && <p className="review-message">{message}</p>}
    <button className="btn btn-primary" type="submit">Submit review</button>
  </form>;
};

export default ReviewForm;
