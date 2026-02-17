import express from 'express';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Get hotel statistics
router.get('/stats', async (req, res) => {
  try {
    const rooms = await Room.find();
    const bookings = await Booking.find();
    
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => !r.isAvailable).length;
    const availableRooms = totalRooms - occupiedRooms;
    
    // Calculate total revenue from confirmed bookings
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'checked-in')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Revenue from occupied rooms (current)
    const currentRevenue = rooms
      .filter(r => !r.isAvailable)
      .reduce((sum, r) => sum + r.price, 0);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Room type breakdown
    const roomTypes = rooms.reduce((acc, room) => {
      const type = room.type;
      if (!acc[type]) {
        acc[type] = { total: 0, available: 0, revenue: 0 };
      }
      acc[type].total++;
      if (room.isAvailable) acc[type].available++;
      else acc[type].revenue += room.price;
      return acc;
    }, {});

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('room', 'number type price');

    res.json({
      success: true,
      stats: {
        totalRevenue,
        currentRevenue,
        occupancyRate: Math.round(occupancyRate),
        totalRooms,
        availableRooms,
        occupiedRooms,
        totalBookings: bookings.length,
        roomTypes,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: "Analytics failed",
      error: error.message 
    });
  }
});

// Get revenue over time (for charts)
router.get('/revenue', async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'checked-out'] }
    }).sort({ createdAt: 1 });

    // Group by date
    const revenueByDate = bookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, bookings: 0 };
      }
      acc[date].revenue += booking.totalPrice;
      acc[date].bookings++;
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(revenueByDate)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Revenue analytics failed",
      error: error.message 
    });
  }
});

export default router;
