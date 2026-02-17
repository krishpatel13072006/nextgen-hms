import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';

dotenv.config();

// Use 127.0.0.1 for Node.js 18+ compatibility
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxe_hms';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("✅ Connected to MongoDB Compass!");
    console.log(`📁 Database: ${mongoose.connection.name}`);
    
    // Create a test room
    const testRoom = new Room({
      number: "101",
      type: "Deluxe",
      price: 250,
      amenities: ["WiFi", "Smart TV", "Ocean View"],
      description: "Test room - Deluxe with ocean view"
    });

    await testRoom.save();
    console.log("🚀 Test room saved! Check MongoDB Compass now.");
    console.log("   Database: luxe_hms");
    console.log("   Collection: rooms");
    console.log("\n💡 Open MongoDB Compass and refresh to see the data!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Open MongoDB Compass and connect');
    console.log('   3. Check if port 27017 is available');
    process.exit(1);
  });
