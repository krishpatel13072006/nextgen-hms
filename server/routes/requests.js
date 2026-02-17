import express from 'express';
import Request from '../models/Request.js';
const router = express.Router();

// Get all requests for the Admin Dashboard
router.get('/all', async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    
    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get request statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Request.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayRequests = await Request.countDocuments({
      createdAt: { $gte: todayStart }
    });
    
    res.json({
      statusBreakdown: stats,
      typeBreakdown: typeStats,
      todayTotal: todayRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request', error: error.message });
  }
});

// Create new request (from guest)
router.post('/', async (req, res) => {
  try {
    const { roomNumber, type, item, items, total, specialRequests, priority } = req.body;
    
    const newRequest = new Request({
      roomNumber,
      type,
      item,
      items,
      total: total || 0,
      specialRequests,
      priority: priority || 'Medium'
    });
    
    await newRequest.save();
    
    res.status(201).json({ 
      message: 'Request submitted successfully', 
      request: newRequest 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Update status (e.g., mark a sandwich as "Completed")
router.patch('/:id', async (req, res) => {
  try {
    const { status, assignedTo, notes, priority } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (notes) updateData.notes = notes;
    if (priority) updateData.priority = priority;
    
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }
    
    const updated = await Request.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ message: 'Request updated', request: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
});

// Delete a request
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
});

// Bulk update status
router.patch('/bulk/status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    const updateData = { status };
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }
    
    await Request.updateMany(
      { _id: { $in: ids } },
      updateData
    );
    
    res.json({ message: `${ids.length} requests updated` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating requests', error: error.message });
  }
});

export default router;
