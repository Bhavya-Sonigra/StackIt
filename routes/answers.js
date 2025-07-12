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
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId }).sort({ createdAt: -1 });
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
    const answer = await Answer.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downvote an answer
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, { $inc: { votes: -1 } }, { new: true });
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
