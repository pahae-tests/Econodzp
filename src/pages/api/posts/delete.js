import dbConnect from '../_lib/connect';
import Post from '../_models/Post';
import User from '../_models/User';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({ message: 'Post ID and User ID are required' });
    }

    try {
        // Convertir les IDs en ObjectId
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        await dbConnect();

        // 1. Supprimer le post de la collection Posts
        const deletedPost = await Post.findByIdAndDelete(postObjectId);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 2. Supprimer le post du tableau posts de l'utilisateur
        await User.findByIdAndUpdate(userObjectId, {
            $pull: {
                posts: { _id: postObjectId }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
            postId: postId
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
            error: error.message
        });
    }
}
