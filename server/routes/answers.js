import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create an answer
router.post('/', auth, async (req, res) => {
  try {
    const { questionId, description } = req.body;
    const userId = req.user._id;
    const answer = new Answer({
      questionId,
      authorId: userId,
      description
    });
    await answer.save();
    // Add answer to question's answers array
    await Question.findByIdAndUpdate(questionId, { $push: { answers: answer._id } });
    
    // Create notification for question owner
    const question = await Question.findById(questionId);
    if (question && question.authorId.toString() !== userId.toString()) {
      const Notification = (await import('../models/Notification.js')).default;
      const notification = new Notification({
        userId: question.authorId,
        type: 'answer',
        message: `${req.user.name || req.user.username} answered your question "${question.title}"`
      });
      await notification.save();
    }
    
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('authorId', 'name username')
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an answer
router.put('/:id', auth, async (req, res) => {
  try {
    const { description } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    
    // Only the author can update the answer
    if (answer.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this answer' });
    }
    
    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      { description, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updatedAnswer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    
    // Only the author or admin can delete the answer
    if (answer.authorId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }
    
    await Answer.findByIdAndDelete(req.params.id);
    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.questionId, { $pull: { answers: answer._id } });
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote an answer
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const Vote = (await import('../models/Vote.js')).default;
    const answerId = req.params.id;
    const userId = req.user._id;
    
    // Check if answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      userId, 
      targetId: answerId, 
      targetType: 'answer' 
    });
    
    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        return res.status(400).json({ error: 'You have already upvoted this answer' });
      } else {
        // Change downvote to upvote
        existingVote.voteType = 'upvote';
        await existingVote.save();
        await Answer.findByIdAndUpdate(answerId, { $inc: { votes: 2 } }); // +2 because removing downvote and adding upvote
      }
    } else {
      // Create new upvote
      await Vote.create({
        userId,
        targetId: answerId,
        targetType: 'answer',
        voteType: 'upvote'
      });
      await Answer.findByIdAndUpdate(answerId, { $inc: { votes: 1 } });
    }
    
    // Create notification for answer author
    if (answer.authorId.toString() !== userId.toString()) {
      const Notification = (await import('../models/Notification.js')).default;
      const notification = new Notification({
        userId: answer.authorId,
        type: 'vote',
        message: `${req.user.name || req.user.username} upvoted your answer`
      });
      await notification.save();
    }
    
    const updatedAnswer = await Answer.findById(answerId);
    res.json(updatedAnswer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downvote an answer
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const Vote = (await import('../models/Vote.js')).default;
    const answerId = req.params.id;
    const userId = req.user._id;
    
    // Check if answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      userId, 
      targetId: answerId, 
      targetType: 'answer' 
    });
    
    if (existingVote) {
      if (existingVote.voteType === 'downvote') {
        return res.status(400).json({ error: 'You have already downvoted this answer' });
      } else {
        // Change upvote to downvote
        existingVote.voteType = 'downvote';
        await existingVote.save();
        await Answer.findByIdAndUpdate(answerId, { $inc: { votes: -2 } }); // -2 because removing upvote and adding downvote
      }
    } else {
      // Create new downvote
      await Vote.create({
        userId,
        targetId: answerId,
        targetType: 'answer',
        voteType: 'downvote'
      });
      await Answer.findByIdAndUpdate(answerId, { $inc: { votes: -1 } });
    }
    
    // Create notification for answer author
    if (answer.authorId.toString() !== userId.toString()) {
      const Notification = (await import('../models/Notification.js')).default;
      const notification = new Notification({
        userId: answer.authorId,
        type: 'vote',
        message: `${req.user.name || req.user.username} downvoted your answer`
      });
      await notification.save();
    }
    
    const updatedAnswer = await Answer.findById(answerId);
    res.json(updatedAnswer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
