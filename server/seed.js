import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';

dotenv.config();

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@nextgenhms.com',
    password: 'admin123123',
    role: 'admin'
  },
  {
    name: 'Krish',
    email: 'krish@example.com',
    password: 'user123123',
    role: 'guest'
  },
  {
    name: 'Darshil',
    email: 'darshil@example.com',
    password: 'user123123',
    role: 'guest'
  }
];

// Comprehensive room data - using user's Unsplash hotel images
const rooms = [
  {
    number: '101',
    type: 'Standard',
    price: 120,
    capacity: 2,
    floor: 1,
    amenities: ['High-speed WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning'],
    description: 'A cozy, functional room perfect for business travelers.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-T5pL6ciEn-I?w=2048&q=90'
  },
  {
    number: '102',
    type: 'Standard',
    price: 120,
    capacity: 2,
    floor: 1,
    amenities: ['Garden View', 'WiFi', 'Smart TV', 'Air Conditioning'],
    description: 'Comfortable standard room with a pleasant garden view.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-rlwE8f8anOc?w=2048&q=90'
  },
  {
    number: '201',
    type: 'Deluxe',
    price: 280,
    capacity: 3,
    floor: 2,
    amenities: ['Ocean View', 'King Size Bed', 'Mini-bar', 'Balcony', 'WiFi'],
    description: 'Experience luxury with a stunning view of the coastline.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-gTA4bkiD2Xw?w=2048&q=90'
  },
  {
    number: '202',
    type: 'Deluxe',
    price: 250,
    capacity: 3,
    floor: 2,
    amenities: ['City View', 'King Size Bed', 'Mini-bar', 'WiFi', 'Air Conditioning'],
    description: 'Spacious deluxe room with modern amenities.',
    isAvailable: false,
    panoramicImage: 'https://images.unsplash.com/photo-TAgGZWz6Qg8?w=2048&q=90'
  },
  {
    number: '301',
    type: 'Suite',
    price: 600,
    capacity: 4,
    floor: 3,
    amenities: ['Private Jacuzzi', 'Personal Butler', 'Kitchenette', 'Living Area', 'Ocean View'],
    description: 'Our most exclusive stay, offering total privacy and elite service.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-uFLxQbKj-S8?w=2048&q=90'
  },
  {
    number: '302',
    type: 'Suite',
    price: 550,
    capacity: 4,
    floor: 3,
    amenities: ['Private Pool', 'Personal Butler', 'Kitchenette', 'Living Area'],
    description: 'Luxurious suite with private pool access.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-gTA4bkiD2Xw?w=2048&q=90'
  },
  {
    number: '401',
    type: 'Presidential',
    price: 850,
    capacity: 6,
    floor: 4,
    amenities: ['Private Jacuzzi', 'Personal Butler', 'Full Kitchen', 'Living Room', 'Dining Area', 'Panoramic View'],
    description: 'Ultimate luxury presidential suite with panoramic views.',
    isAvailable: true,
    panoramicImage: 'https://images.unsplash.com/photo-uFLxQbKj-S8?w=2048&q=90'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB (using 127.0.0.1 for Node.js 18+ compatibility)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxe_hms';
    await mongoose.connect(mongoUri);
    console.log('📊 Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.name}`);

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert rooms
    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Create sample bookings for occupied rooms
    const occupiedRoom = createdRooms.find(r => !r.isAvailable);
    if (occupiedRoom) {
      const sampleBooking = new Booking({
        user: createdUsers[1]._id,
        room: occupiedRoom._id,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalPrice: occupiedRoom.price * 3,
        status: 'confirmed',
        guests: 2,
        specialRequests: 'Late check-in requested'
      });
      await sampleBooking.save();
      console.log('✅ Created sample booking');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('   Admin: admin@nextgenhms.com / admin123');
    console.log('   User:  john@example.com / password123');
    console.log('\n🏨 Room Summary:');
    console.log(`   Standard: ${createdRooms.filter(r => r.type === 'Standard').length} rooms`);
    console.log(`   Deluxe:   ${createdRooms.filter(r => r.type === 'Deluxe').length} rooms`);
    console.log(`   Suite:    ${createdRooms.filter(r => r.type === 'Suite').length} rooms`);
    console.log(`   Presidential: ${createdRooms.filter(r => r.type === 'Presidential').length} rooms`);
    console.log(`   Available: ${createdRooms.filter(r => r.isAvailable).length} / ${createdRooms.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
