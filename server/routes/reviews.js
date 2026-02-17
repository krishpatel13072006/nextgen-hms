import express from 'express';
import Review from '../models/Review.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const router = express.Router();

/**
 * Get all reviews for a specific room
 * 
 * Query Parameters:
 * - roomId: The room ID to get reviews for
 * 
 * Returns:
 * - Array of reviews with user information
 */
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); // Most recent first

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      reviews,
      summary: {
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

/**
 * Create a new review for a room
 * 
 * Body Parameters:
 * - roomId: The room ID to review
 * - rating: Rating from 1-5
 * - comment: Review text
 * 
 * Headers:
 * - Authorization: Bearer token (user must be logged in)
 */
router.post('/', async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;

    // Get user from token (assuming auth middleware adds user to req)
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to leave a review'
      });
    }

    // Validate input
    if (!roomId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room ID, rating, and comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has stayed at this room (optional: require booking)
    const hasStayed = await Booking.findOne({
      user: userId,
      room: roomId,
      status: { $in: ['checked-out', 'confirmed'] }
    });

    // Uncomment the following to require a booking before reviewing:
    // if (!hasStayed) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You must stay at this room before reviewing'
    //   });
    // }

    // Check if user already reviewed this room
    const existingReview = await Review.findOne({
      user: userId,
      room: roomId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this room',
        existingReview
      });
    }

    // Create review
    const review = new Review({
      user: userId,
      room: roomId,
      rating: Math.round(rating), // Ensure it's an integer
      comment: comment.trim()
    });

    await review.save();

    // Populate user info for response
    await review.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully!',
      review
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this room'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

/**
 * Update a review (only by the review author)
 * 
 * Body Parameters:
 * - reviewId: The review ID to update
 * - rating: New rating (optional)
 * - comment: New comment (optional)
 */
router.put('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to update your review'
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = Math.round(rating);
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully!',
      review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

/**
 * Delete a review (only by the review author or admin)
 */
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id || req.body.userId;
    const userRole = req.user?.role || 'user';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to delete your review'
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

/**
 * Get user's reviews (for their profile)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ user: userId })
      .populate({
        path: 'room',
        select: 'number type images'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

export default router;