import dbConnect from '../_lib/connect';
import User from '../_models/User';
import Notification from '../_models/Notification';
import mongoose from 'mongoose';
import pusher from '../_lib/pusher';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Méthode non autorisée'
        });
    }

    try {
        await dbConnect();
        const { followerId, followingId } = req.body;

        // Validation des données
        if (!followerId || !followingId) {
            return res.status(400).json({
                success: false,
                message: 'followerId et followingId sont requis'
            });
        }

        // Vérifier que les IDs sont valides
        if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
            return res.status(400).json({
                success: false,
                message: 'IDs utilisateur invalides'
            });
        }

        // Convertir les IDs en ObjectId
        const followerObjectId = new mongoose.Types.ObjectId(followerId);
        const followingObjectId = new mongoose.Types.ObjectId(followingId);

        // Empêcher un utilisateur de se suivre lui-même
        if (followerId === followingId) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur ne peut pas se suivre lui-même'
            });
        }

        // Vérifier que les deux utilisateurs existent
        const [follower, userToFollow] = await Promise.all([
            User.findById(followerObjectId).select('_id following firstname lastname'),
            User.findById(followingObjectId).select('_id follows firstname lastname')
        ]);

        if (!follower) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur suiveur non trouvé'
            });
        }

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur à suivre non trouvé'
            });
        }

        // Vérifier si l'utilisateur suit déjà cette personne
        const isCurrentlyFollowing = follower.following &&
            follower.following.some(item =>
                item.user && item.user.toString() === followingId.toString()
            );

        let isFollowing;
        let notification = null;
        let notificationType = '';

        if (isCurrentlyFollowing) {
            // Unfollow: Retirer de la liste following du follower et de la liste follows du suivi
            await Promise.all([
                User.findByIdAndUpdate(
                    followerObjectId,
                    { $pull: { following: { user: followingObjectId } } },
                    { new: true }
                ),
                User.findByIdAndUpdate(
                    followingObjectId,
                    { $pull: { follows: { user: followerObjectId } } },
                    { new: true }
                )
            ]);

            isFollowing = false;
            notificationType = 'unfollow';

        } else {
            // Follow: Ajouter à la liste following du follower et à la liste follows du suivi
            await Promise.all([
                User.findByIdAndUpdate(
                    followerObjectId,
                    { $addToSet: { following: { user: followingObjectId } } },
                    { new: true }
                ),
                User.findByIdAndUpdate(
                    followingObjectId,
                    { $addToSet: { follows: { user: followerObjectId } } },
                    { new: true }
                )
            ]);

            isFollowing = true;
            notificationType = 'follow';
        }

        // Créer une notification dans les deux cas
        notification = new Notification({
            type: notificationType,
            user: followerObjectId,
            to: followingObjectId,
            seen: false
        });

        await notification.save();

        await pusher.trigger(`user-${followingObjectId.toString()}`, 'new-notif', {
            user: followingId,
            type: notification.type,
        });

        await User.findByIdAndUpdate(followerId, {
            $inc: { lvl: 10 },
        });

        await User.findByIdAndUpdate(followingId, {
            $inc: { lvl: 10 },
        });

        return res.status(200).json({
            success: true,
            isFollowing,
            notification: {
                _id: notification._id,
                type: notification.type,
                createdAt: notification.createdAt
            },
            message: isFollowing
                ? 'Utilisateur suivi avec succès'
                : 'Utilisateur retiré des abonnements avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de suivi:', error);

        // Gestion des erreurs spécifiques à MongoDB
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Format d\'ID utilisateur invalide'
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Données de validation invalides'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
}