import dbConnect from '../_lib/connect';
import Post from '../_models/Post';
import User from '../_models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Récupérer tous les posts avec les informations des utilisateurs associés
    const posts = await Post.find()
      .populate('user', 'firstname lastname img status lvl')
      .sort({ createdAt: -1 })
      .lean();

    // Formater les posts pour correspondre à votre structure front-end
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      user: {
        _id: post.user._id,
        img: post.user?.img || '/user.jpg',
        firstName: post.user?.firstname || '',
        lastName: post.user?.lastname || '',
        status: post.user?.status || '',
        pointsLevel: post.user?.lvl || 0,
      },
      content: post.content || '',
      img: post.img || '',
      timestamp: formatTimeDifference(post.createdAt)
    }));

    res.status(200).json({
      success: true,
      posts: formattedPosts
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
}

// Fonction utilitaire pour formater le timestamp
function formatTimeDifference(createdAt) {
  const now = new Date();
  const postDate = new Date(createdAt);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return `il y a ${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)}h`;

  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays === 1) return 'il y a 1j';
  return `il y a ${diffInDays}j`;
}