import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },

  sex: { type: String, required: true },
  birth: { type: String, required: true },
  img: { type: String, default: "/user.jpg" },
  bio: { type: String },
  status: { type: String },
  lvl: { type: Number },
  posts: [{ title: String, img: String }],

  labels: [{ type: String }],
  follows: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  following: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;