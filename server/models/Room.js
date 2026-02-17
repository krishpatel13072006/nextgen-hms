import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'], 
    required: true 
  },
  price: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  amenities: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  floor: { type: Number },
  description: { type: String },
  images: [{ type: String }],
  panoramicImage: { type: String }, // 360° panoramic image URL for 3D tour
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', RoomSchema);
