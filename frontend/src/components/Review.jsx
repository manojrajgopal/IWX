import React from 'react';
import Rating from './Rating';
import { formatDate } from '../utils/dateUtils';
import './Review.css';

const Review = ({ review }) => {
  return (
    <div className="review">
      <div className="review-header">
        <div className="user-info">
          <img src={review.avatar} alt={review.user} />
          <div>
            <h4>{review.user}</h4>
            <Rating rating={review.rating} />
          </div>
        </div>
        <span className="review-date">{formatDate(review.date)}</span>
      </div>
      <p>{review.comment}</p>
    </div>
  );
};

export default Review;
