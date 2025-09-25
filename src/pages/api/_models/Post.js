import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  img: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;