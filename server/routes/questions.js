import express from 'express';
import Question from '../models/Question.js';
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
    const { tag } = req.query;
    const filter = tag ? { tags: tag } : {};
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('answers');
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
    
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
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
    res.json({ message: 'Answer accepted', question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
