import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, User, Clock, ThumbsUp, ThumbsDown, Edit2, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function RoomReviews({ roomId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reviews/room/${roomId}`);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setSummary(response.data.summary);
        
        // Check if current user has already reviewed
        if (currentUser) {
          const existing = response.data.reviews.find(
            r => r.user?._id === currentUser._id || r.user === currentUser._id
          );
          if (existing) {
            setUserReview(existing);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to leave a review');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          roomId,
          rating: newReview.rating,
          comment: newReview.comment
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.data.success) {
        alert('Review submitted successfully!');
        setShowForm(false);
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      alert('Review deleted');
      fetchReviews();
      setUserReview(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = () => {}) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      {summary && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {summary.averageRating}
              </div>
              <div className="flex justify-center my-1">
                {renderStars(Math.round(summary.averageRating))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {summary.totalReviews} reviews
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.ratingDistribution[star] || 0;
                const percentage = summary.totalReviews > 0 
                  ? (count / summary.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-3">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {currentUser && !userReview && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmitReview}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Write Your Review
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Rating
            </label>
            {renderStars(newReview.rating, true, (rating) => 
              setNewReview({ ...newReview, rating })
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this room..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Your Review</span>
              {renderStars(userReview.rating)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewReview({ rating: userReview.rating, comment: userReview.comment });
                  setShowForm(true);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview._id)}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{userReview.comment}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this room!
          </div>
        ) : (
          reviews
            .filter(r => r._id !== userReview?._id)
            .map((review) => (
              <div 
                key={review._id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {review.user?.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}