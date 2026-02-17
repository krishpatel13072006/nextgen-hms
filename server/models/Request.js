import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Food', 'Housekeeping', 'Maintenance', 'Room Service', 'Other'], 
    required: true 
  },
  item: { 
    type: String 
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  total: {
    type: Number,
    default: 0
  },
  specialRequests: {
    type: String
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    default: null
  },
  notes: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ roomNumber: 1 });

export default mongoose.model('Request', requestSchema);
