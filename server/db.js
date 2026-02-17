import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Use 127.0.0.1 instead of localhost for Node.js 18+ compatibility
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxe_hms';
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    return conn;
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check if MongoDB Compass is connected');
    console.log('   3. Verify the connection string in .env file');
    process.exit(1);
  }
};

export default connectDB;
