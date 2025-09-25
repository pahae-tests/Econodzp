import dbConnect from '../_lib/connect';
import User from '../_models/User';
import Post from '../_models/Post';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    await dbConnect();

    try {
        // 1. Récupérer l'utilisateur
        const user = await User.findById(id)
            .select('firstname lastname img bio sex lvl status labels follows following createdAt')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Récupérer les posts détaillés (optionnel - si vous voulez plus de détails)
        const posts = await Post.find({ user: id })
            .sort({ createdAt: -1 })
            .lean();

        const formattedPosts = posts.map(post => ({
            _id: post._id.toString(),
            content: post.content,
            img: post.img,
            timestamp: formatTimeDifference(post.createdAt),
        }));

        const responseUser = {
            ...user,
            _id: user._id.toString(),
            firstName: user.firstname,
            lastName: user.lastname,
            pointsLevel: user.lvl || 0,
            img: user.img || "/user.jpg",
            posts: formattedPosts,
            follows: user.follows || [],
            following: user.following || [],
            followers: user.follows?.length || 0,
            followingCount: user.following?.length || 0
        };

        res.status(200).json({
            success: true,
            user: responseUser
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
}

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