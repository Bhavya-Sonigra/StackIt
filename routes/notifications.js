import express from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    // Only allow users to get their own notifications
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to access these notifications' });
    }
    
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    // Only the notification owner can mark it as read
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this notification' });
    }
    
    const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(updatedNotification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a notification
router.post('/', auth, async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    
    // Only admins or the user themselves can create notifications
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to create notifications for other users' });
    }
    
    const notification = new Notification({ userId, type, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
