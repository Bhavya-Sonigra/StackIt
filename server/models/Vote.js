import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // question or answer ID
  targetType: { type: String, enum: ['question', 'answer'], required: true },
  voteType: { type: String, enum: ['upvote', 'downvote'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one vote per user per content
VoteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

const Vote = mongoose.model('Vote', VoteSchema);
export default Vote;
