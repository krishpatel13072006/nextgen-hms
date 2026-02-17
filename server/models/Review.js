import mongoose from 'mongoose';

/**
 * Review Schema
 * Stores guest reviews and ratings for rooms
 * 
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User who wrote the review
 * @property {mongoose.Schema.Types.ObjectId} room - Reference to the Room being reviewed
 * @property {Number} rating - Rating from 1-5 stars
 * @property {String} comment - The review text content
 * @property {Date} createdAt - Timestamp of when the review was created
 */
const ReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 1000,
    trim: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews - one review per user per room
ReviewSchema.index({ user: 1, room: 1 }, { unique: true });

// Calculate average rating for a room (virtual)
ReviewSchema.statics.calcAverageRating = async function(roomId) {
  const stats = await this.aggregate([
    { $match: { room: roomId } },
    {
      $group: {
        _id: '$room',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Room').findByIdAndUpdate(roomId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].nRating
    });
  } else {
    await mongoose.model('Room').findByIdAndUpdate(roomId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// Calculate average after save
ReviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.room);
});

// Calculate average before remove
ReviewSchema.pre('deleteOne', { document: true, query: false }, function() {
  this.constructor.calcAverageRating(this.room);
});

export default mongoose.model('Review', ReviewSchema);