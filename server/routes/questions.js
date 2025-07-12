import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a question
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const userId = req.user._id;
    const question = new Question({
      title,
      description,
      tags,
      authorId: userId
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { tag, search, sort = 'newest', limit = 20 } = req.query;
    let filter = {};
    
    // Tag filter
    if (tag) {
      filter.tags = tag;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sortOptions = { createdAt: -1 }; // default to newest
    switch (sort) {
      case 'votes':
        sortOptions = { votes: -1, createdAt: -1 };
        break;
      case 'views':
        sortOptions = { views: -1, createdAt: -1 };
        break;
      case 'unanswered':
        filter.acceptedAnswer = null;
        filter.answers = { $size: 0 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    const questions = await Question.find(filter)
      .populate('authorId', 'name username')
      .sort(sortOptions)
      .limit(parseInt(limit));
      
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('authorId', 'name username')
      .populate('answers')
      .populate('acceptedAnswer');
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Only the author can update the question
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this question' });
    }
    
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { title, description, tags, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Only the author or admin can delete the question
    if (question.authorId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }
    
    // Delete all answers associated with this question
    await Answer.deleteMany({ questionId: req.params.id });
    
    // Delete the question
    await Question.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Question and associated answers deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept an answer for a question
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const { answerId } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Only the question owner can accept an answer
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept answers for this question' });
    }
    
    question.acceptedAnswer = answerId;
    await question.save();
    
    // Create notification for answer author
    const answer = await Answer.findById(answerId);
    if (answer && answer.authorId.toString() !== req.user._id.toString()) {
      const Notification = (await import('../models/Notification.js')).default;
      const notification = new Notification({
        userId: answer.authorId,
        type: 'accept',
        message: `${req.user.name || req.user.username} accepted your answer to "${question.title}"`
      });
      await notification.save();
    }
    
    res.json({ message: 'Answer accepted', question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote a question
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const Vote = (await import('../models/Vote.js')).default;
    const questionId = req.params.id;
    const userId = req.user._id;
    
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      userId, 
      targetId: questionId, 
      targetType: 'question' 
    });
    
    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        return res.status(400).json({ error: 'You have already upvoted this question' });
      } else {
        // Change downvote to upvote
        existingVote.voteType = 'upvote';
        await existingVote.save();
        await Question.findByIdAndUpdate(questionId, { $inc: { votes: 2 } }); // +2 because removing downvote and adding upvote
      }
    } else {
      // Create new upvote
      await Vote.create({
        userId,
        targetId: questionId,
        targetType: 'question',
        voteType: 'upvote'
      });
      await Question.findByIdAndUpdate(questionId, { $inc: { votes: 1 } });
    }
    
    const updatedQuestion = await Question.findById(questionId);
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downvote a question
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const Vote = (await import('../models/Vote.js')).default;
    const questionId = req.params.id;
    const userId = req.user._id;
    
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ 
      userId, 
      targetId: questionId, 
      targetType: 'question' 
    });
    
    if (existingVote) {
      if (existingVote.voteType === 'downvote') {
        return res.status(400).json({ error: 'You have already downvoted this question' });
      } else {
        // Change upvote to downvote
        existingVote.voteType = 'downvote';
        await existingVote.save();
        await Question.findByIdAndUpdate(questionId, { $inc: { votes: -2 } }); // -2 because removing upvote and adding downvote
      }
    } else {
      // Create new downvote
      await Vote.create({
        userId,
        targetId: questionId,
        targetType: 'question',
        voteType: 'downvote'
      });
      await Question.findByIdAndUpdate(questionId, { $inc: { votes: -1 } });
    }
    
    const updatedQuestion = await Question.findById(questionId);
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flag a question
router.post('/:id/flag', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Check if user has already flagged this question
    if (question.flaggedBy.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already flagged this question' });
    }
    
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id, 
      { $addToSet: { flaggedBy: req.user._id } }, 
      { new: true }
    );
    
    res.json({ message: 'Question flagged for review', question: updatedQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
