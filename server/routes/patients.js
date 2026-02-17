import express from 'express';
import Room from '../models/Room.js';
import { calculateDynamicPrice } from '../services/pricingEngine.js';

const router = express.Router();

// Get all rooms with dynamic pricing
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, amenities, available, sort, limit } = req.query;
    
    // Build filter query
    let filter = {};
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (available === 'true') {
      filter.isAvailable = true;
    }
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenityList };
    }
    
    let query = Room.find(filter);
    
    // Sorting
    if (sort) {
      const sortOptions = {
        'price': { price: 1 },
        'price-desc': { price: -1 },
        'type': { type: 1 },
        'number': { number: 1 }
      };
      query = query.sort(sortOptions[sort] || { number: 1 });
    } else {
      query = query.sort({ number: 1 });
    }
    
    // Limit
    if (limit) {
      query = query.limit(Number(limit));
    }
    
    const allRooms = await query.exec();
    const totalRooms = await Room.countDocuments(filter);
    const bookedRooms = allRooms.filter(r => !r.isAvailable).length;
    const occupancyRate = totalRooms > 0 ? bookedRooms / totalRooms : 0;

    const dynamicRooms = allRooms.map(room => {
      const roomObj = room.toObject();
      roomObj.currentPrice = calculateDynamicPrice(room.price, occupancyRate);
      roomObj.occupancyRate = Math.round(occupancyRate * 100);
      return roomObj;
    });

    res.json({ 
      success: true, 
      count: dynamicRooms.length,
      total: totalRooms,
      occupancyRate: Math.round(occupancyRate * 100),
      rooms: dynamicRooms 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching rooms',
      error: error.message 
    });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    
    // Calculate dynamic price
    const allRooms = await Room.find();
    const bookedRooms = allRooms.filter(r => !r.isAvailable).length;
    const occupancyRate = allRooms.length > 0 ? bookedRooms / allRooms.length : 0;
    
    const roomObj = room.toObject();
    roomObj.currentPrice = calculateDynamicPrice(room.price, occupancyRate);
    
    res.json({ success: true, room: roomObj });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching room',
      error: error.message 
    });
  }
});

// Create new room (admin only)
router.post('/', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({ 
      success: true, 
      message: 'Room created successfully',
      room 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating room',
      error: error.message 
    });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Room updated successfully',
      room 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating room',
      error: error.message 
    });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Room deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting room',
      error: error.message 
    });
  }
});

// Toggle room availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    room.isAvailable = !room.isAvailable;
    await room.save();
    res.json({ 
      success: true, 
      message: `Room is now ${room.isAvailable ? 'available' : 'unavailable'}`,
      room 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating availability',
      error: error.message 
    });
  }
});

export default router;
