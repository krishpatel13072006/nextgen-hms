import express from 'express';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { sendBookingConfirmation } from '../services/emailService.js';

const router = express.Router();

// Book a room
router.post('/book-room', async (req, res) => {
  const { roomNumber, customerName, customerEmail, checkIn, checkOut, guests, userId } = req.body;

  try {
    // 1. Find the room and ensure it's still available
    const room = await Room.findOne({ number: roomNumber });

    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: "Room not found." 
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: "Room is no longer available." 
      });
    }

    // 2. Calculate total price
    let totalPrice = room.price;
    if (checkIn && checkOut) {
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      totalPrice = room.price * nights;
    }

    // 3. Create booking record
    const booking = new Booking({
      user: userId,
      room: room._id,
      checkIn: checkIn || new Date(),
      checkOut: checkOut || new Date(Date.now() + 24 * 60 * 60 * 1000),
      guests: guests || 1,
      totalPrice,
      status: 'confirmed',
      specialRequests: `Guest: ${customerName || 'Guest User'}`
    });
    await booking.save();

    // 4. Update room availability
    room.isAvailable = false;
    await room.save();

    // 5. Send confirmation email (async, don't wait)
    if (customerEmail) {
      sendBookingConfirmation(
        booking,
        room,
        customerEmail,
        customerName || 'Guest'
      ).catch(err => console.error('Email sending error:', err.message));
    }

    res.status(200).json({ 
      success: true,
      message: `Success! Room ${roomNumber} has been reserved for ${customerName || 'Guest User'}.`,
      booking: {
        id: booking._id,
        roomNumber: room.number,
        roomType: room.type,
        totalPrice,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during booking.",
      error: error.message 
    });
  }
});

// Reserve room (simple toggle)
router.post('/reserve', async (req, res) => {
  const { roomNumber } = req.body;
  
  try {
    const room = await Room.findOneAndUpdate(
      { number: roomNumber, isAvailable: true },
      { isAvailable: false },
      { new: true }
    );

    if (!room) {
      return res.status(400).json({ 
        success: false,
        message: "Room already booked or not found" 
      });
    }

    res.json({ 
      success: true,
      message: `Success! Room ${roomNumber} is now reserved for you.`,
      room 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Cancel booking / Free up room
router.post('/cancel', async (req, res) => {
  const { roomNumber } = req.body;
  
  try {
    const room = await Room.findOneAndUpdate(
      { number: roomNumber, isAvailable: false },
      { isAvailable: true },
      { new: true }
    );

    if (!room) {
      return res.status(400).json({ 
        success: false,
        message: "Room not found or already available" 
      });
    }

    res.json({ 
      success: true,
      message: `Room ${roomNumber} is now available.`,
      room 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
