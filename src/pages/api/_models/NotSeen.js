import mongoose from 'mongoose';

const NotSeenSchema = new mongoose.Schema({
  room: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.NotSeen || mongoose.model('NotSeen', NotSeenSchema);