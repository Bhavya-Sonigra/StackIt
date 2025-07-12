import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
  votes: { type: Number, default: 0 }
});

const Question = mongoose.model('Question', QuestionSchema);
export default Question;
