import express from 'express';
import { getAIResponse, getGuestAssistantResponse } from '../services/aiService.js';
import Room from '../models/Room.js';

const router = express.Router();

// General AI Concierge endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }
    
    // Fetch real-time room data to give to the AI
    const rooms = await Room.find();
    const availableRooms = rooms.filter(r => r.isAvailable);
    const totalRooms = rooms.length;
    const bookedRooms = totalRooms - availableRooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;
    
    const roomContext = {
      rooms: rooms.map(r => ({
        number: r.number,
        type: r.type,
        price: r.price,
        currentPrice: r.currentPrice,
        amenities: r.amenities,
        description: r.description,
        isAvailable: r.isAvailable
      })),
      totalRooms,
      availableRooms: availableRooms.length,
      occupancyRate
    };
    
    const aiReply = await getAIResponse(message, roomContext);
    res.json({ 
      success: true, 
      reply: aiReply 
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      success: false, 
      error: "AI Concierge is resting. Try again later.",
      message: error.message 
    });
  }
});

// Guest Assistant endpoint
router.post('/guest', async (req, res) => {
  try {
    const { message, guestId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }
    
    const guestContext = guestId ? { guestId } : {};
    const aiReply = await getGuestAssistantResponse(message, guestContext);
    
    res.json({ 
      success: true, 
      reply: aiReply 
    });
  } catch (error) {
    console.error('Guest AI Error:', error);
    res.status(500).json({ 
      success: false, 
      error: "Guest AI service temporarily unavailable.",
      message: error.message 
    });
  }
});

// Quick suggestions endpoint
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "What rooms are available?",
    "How do I book a room?",
    "What are the check-in/check-out times?",
    "What amenities do you offer?",
    "Is there a restaurant on-site?",
    "Is there parking available?"
  ];
  
  res.json({ 
    success: true, 
    suggestions 
  });
});

export default router;
