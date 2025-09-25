import dbConnect from '../_lib/connect';
import Notification from '../_models/Notification';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    await dbConnect();

    try {
        // 1. Trouver toutes les notifications où l'utilisateur est impliqué
        const notifications = await Notification.find({ to: userId })
            .populate({
                path: 'user',
                select: 'firstname lastname img'
            })
            .sort({ createdAt: -1 })
            .lean();

        // 2. Formater les notifications pour le front-end
        const formattedNotifications = notifications.map(notif => ({
            _id: notif._id.toString(),
            user: {
                _id: notif.user._id.toString(),
                firstname: notif.user.firstname,
                lastname: notif.user.lastname,
                img: notif.user.img || '/user.jpg'
            },
            type: notif.type,
            seen: notif.seen,
            timestamp: formatTimestamp(notif.createdAt)
        }));

        res.status(200).json({
            success: true,
            notifications: formattedNotifications
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
}

// Fonction utilitaire pour formater les timestamps
function formatTimestamp(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 60) {
        if (diffInMinutes < 1) return "à l'instant";
        return `il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `il y a ${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "hier";

    return `il y a ${diffInDays}j`;
}