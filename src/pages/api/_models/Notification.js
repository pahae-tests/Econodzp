import mongoose from 'mongoose';

const notifSchema = new mongoose.Schema({
  type: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seen: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notifSchema);

export default Notification;