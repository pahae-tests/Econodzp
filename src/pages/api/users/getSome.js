import dbConnect from '../_lib/connect';
import User from '../_models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const users = await User.find().limit(20).sort({ lvl: -1 });

    res.status(200).json({ success: true, users: users || [] });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
}