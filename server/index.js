import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database connection
import connectDB from './db.js';

// Import routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import aiRoutes from './routes/ai.js';
import bookingRoutes from './routes/booking.js';
import analyticsRoutes from './routes/analytics.js';
import requestRoutes from './routes/requests.js';
import uploadRoutes from './routes/upload.js';
import reviewRoutes from './routes/reviews.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173", // Local development
    "http://localhost:5174", // Local development alt
    "https://nextgen-hms.vercel.app" // Production frontend
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🏨 NextGen HMS API is running...',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rooms: '/api/patients',
      booking: '/api/booking',
      analytics: '/api/analytics',
      ai: '/api/ai'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NextGen HMS API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server with database connection
const startServer = async () => {
  // Connect to Database first
  await connectDB();
  
  // Then start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server spinning on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log('\n📋 Available Endpoints:');
    console.log('   GET  /api/health');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/patients (rooms)');
    console.log('   POST /api/booking/book-room');
    console.log('   GET  /api/analytics/stats');
    console.log('   POST /api/ai/chat');
  });
};

startServer();

export default app;
