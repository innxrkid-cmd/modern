import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['workplace', 'benefits', 'management', 'technical', 'other'],
    default: 'other'
  },
  anonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Suggestion = mongoose.models.Suggestion || mongoose.model('Suggestion', suggestionSchema);
export default Suggestion;
