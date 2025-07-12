const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
// const auth = require('../middleware/auth'); // Uncomment if you have auth middleware

// Create a question
router.post('/', /*auth,*/ async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    // const userId = req.user.id; // Use with auth middleware
    const userId = req.body.authorId; // TEMP: Remove when using auth
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
router.put('/:id', /*auth,*/ async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { title, description, tags, updatedAt: Date.now() },
      { new: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a question
router.delete('/:id', /*auth,*/ async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/accept', auth, async (req, res) => {
    try {
      const { answerId } = req.body;
      const question = await Question.findById(req.params.id);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      // Only the question owner can accept an answer
      if (question.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      question.acceptedAnswer = answerId;
      await question.save();
      res.json({ message: 'Answer accepted', question });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
