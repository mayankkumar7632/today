// KaamSetu - Star Rating Component

import React, { useState } from 'react';

const StarRating = ({ rating, onRate, readonly = false, size = 24 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
          style={{ fontSize: `${size}px`, cursor: readonly ? 'default' : 'pointer' }}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
};

export default StarRating;
