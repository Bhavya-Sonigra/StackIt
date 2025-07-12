const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
// const auth = require('../middleware/auth'); // Uncomment if you have auth middleware

// Get all notifications for a user
router.get('/:userId', /*auth,*/ async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', /*auth,*/ async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a notification
router.post('/', /*auth,*/ async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const notification = new Notification({ userId, type, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
