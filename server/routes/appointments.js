import express from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const userId = req.query.userId;
    const bookings = await Booking.find({ user: userId })
      .populate('room', 'number type price images')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: error.message 
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is already cancelled' 
      });
    }
    
    if (booking.status === 'checked-out') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel a completed booking' 
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Make room available again
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    }
    
    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
});

// Get all bookings/appointments
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room', 'number type price')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: bookings.length,
      bookings 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: error.message 
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('room', 'number type price amenities');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking',
      error: error.message 
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { userId, roomId, checkIn, checkOut, guests, specialRequests } = req.body;
    
    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    
    if (!room.isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room is not available' 
      });
    }
    
    // Calculate total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;
    
    const booking = new Booking({
      user: userId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      specialRequests,
      totalPrice
    });
    
    await booking.save();
    
    // Mark room as unavailable
    room.isAvailable = false;
    await room.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    booking.status = status;
    await booking.save();
    
    // If checked out or cancelled, make room available again
    if (status === 'checked-out' || status === 'cancelled') {
      await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    }
    
    res.json({ 
      success: true, 
      message: `Booking status updated to ${status}`,
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating booking status',
      error: error.message 
    });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Make room available again
    await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    
    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
});

export default router;
