import dbConnect from '../_lib/connect';
import Post from '../_models/Post';
import User from '../_models/User';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    try {
        const { content, img, userId } = req.body;

        // Validation des données
        if (!content || !userId) {
            return res.status(400).json({ message: 'Contenu et ID utilisateur requis' });
        }

        // Vérification que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Création du nouveau post
        const newPost = new Post({
            user: userId,
            content: content.trim(),
            img: img || null  // img contient maintenant l'URL Firebase Storage
        });

        // Sauvegarde du post
        await newPost.save();

        // Mise à jour du tableau de posts de l'utilisateur
        await User.findByIdAndUpdate(userId, {
            $push: {
                posts: {
                    title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                    img: img || null
                }
            },
            $inc: { lvl: 10 }  // Optionnel: augmenter le niveau de l'utilisateur
        });

        // Récupérer le post créé avec les infos de l'utilisateur pour la réponse
        const createdPost = await Post.findById(newPost._id)
            .populate('user', 'firstname lastname img')
            .lean();

        res.status(201).json({
            success: true,
            post: {
                id: createdPost._id.toString(),
                user: {
                    id: createdPost.user._id.toString(),
                    firstName: createdPost.user.firstname,
                    lastName: createdPost.user.lastname,
                    img: createdPost.user.img
                },
                content: createdPost.content,
                img: createdPost.img,
                createdAt: createdPost.createdAt
            },
            message: 'Post créé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du post',
            error: error.message
        });
    }
}