'use client';

import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...newReview }),
      });
      if (res.ok) {
        const saved = await res.json();
        setReviews([saved, ...reviews]);
        setNewReview({ author: '', rating: 5, comment: '' });
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  if (loading) {
    return <div className="review-loading">Loading reviews...</div>;
  }

  return (
    <div className="review-section">
      <h3 className="review-title">Customer Reviews ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review!</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div>
                <span className="review-author">{review.author}</span>
                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              <span className="review-stars">{renderStars(review.rating)}</span>
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))
      )}

      <form className="review-form" onSubmit={handleSubmit}>
        <h4 style={{ fontWeight: 600 }}>Write a Review</h4>
        <input
          type="text"
          placeholder="Your Name"
          value={newReview.author}
          onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
          required
        />
        <div>
          <label style={{ marginRight: '10px' }}>Rating: </label>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
          >
            {[1,2,3,4,5].map((r) => (
              <option key={r} value={r}>{r} ★</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Your comment..."
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          required
          rows={3}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}