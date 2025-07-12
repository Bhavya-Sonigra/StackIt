import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Get all users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ban a user
router.put('/users/:id/ban', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unban a user
router.put('/users/:id/unban', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a question
router.delete('/questions/:id', auth, admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Delete all answers associated with this question
    await Answer.deleteMany({ questionId: req.params.id });
    
    // Delete the question
    await Question.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Question and associated answers deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an answer
router.delete('/answers/:id', auth, admin, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin statistics
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const questions = await Question.countDocuments();
    const users = await User.countDocuments();
    const answers = await Answer.countDocuments();
    
    res.json({ questions, users, answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get flagged content
router.get('/flagged-content', auth, admin, async (req, res) => {
  try {
    // Get questions that have been flagged
    const flaggedQuestions = await Question.find({ 
      flaggedBy: { $exists: true, $ne: [] } 
    })
    .populate('authorId', 'name username')
    .populate('flaggedBy', 'name username')
    .sort({ createdAt: -1 });
    
    const content = flaggedQuestions.map(question => ({
      _id: question._id,
      title: question.title,
      type: 'question',
      author: question.authorId.name || question.authorId.username,
      flaggedBy: question.flaggedBy.length,
      reason: `Flagged by ${question.flaggedBy.length} user(s)`,
      createdAt: question.createdAt
    }));
    
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change user role
router.put('/users/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // If removing admin role, check if this is the last admin
    if (user.isAdmin && role !== 'admin') {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin. At least one admin must remain.' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { isAdmin: role === 'admin' }, 
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send notification to all users
router.post('/notify-all', auth, admin, async (req, res) => {
  try {
    const { message, type = 'announcement' } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get all users
    const users = await User.find({}, '_id');
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user._id,
      type: type,
      message: message.trim(),
      read: false,
      createdAt: new Date()
    }));
    
    // Bulk insert notifications
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.insertMany(notifications);
    
    res.json({ 
      message: 'Notification sent to all users', 
      count: notifications.length 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete content (questions or answers)
router.delete('/content/:type/:id', auth, admin, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'questions') {
      const question = await Question.findById(id);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      
      // Delete all answers associated with this question
      await Answer.deleteMany({ questionId: id });
      
      // Delete the question
      await Question.findByIdAndDelete(id);
    } else if (type === 'answers') {
      const answer = await Answer.findByIdAndDelete(id);
      if (!answer) return res.status(404).json({ error: 'Answer not found' });
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    
    res.json({ message: `${type === 'questions' ? 'Question and associated answers' : 'Answer'} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
