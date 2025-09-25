import dbConnect from '../_lib/connect';
import Message from '../_models/Msg';
import NotSeen from '../_models/NotSeen';
import pusher from '../_lib/pusher';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { room, userId, content } = req.body;

    if (!room || !userId || !content) {
        return res.status(400).json({ message: 'Room, user ID, and content are required' });
    }

    await dbConnect();

    try {
        // 🔹 Crée le message
        const newMessage = new Message({
            room,
            user: userId,
            content: content.trim(),
        });

        await newMessage.save();

        // 🔹 Déterminer l'autre utilisateur dans la room
        const otherUserId = room.replace(userId, '');

        // 🔹 Crée une entrée NotSeen pour l'autre utilisateur
        await NotSeen.create({
            room,
            content: content.trim(),
            user: otherUserId,
        });

        // 🔹 Récupère le message avec infos utilisateur
        const messageWithUser = await Message.findById(newMessage._id)
            .populate('user', 'firstname lastname img')
            .lean();

        // 🔹 Envoyer le message en temps réel via Pusher
        await pusher.trigger(`room-${room}`, 'new-message', {
            id: messageWithUser._id.toString(),
            sender: userId,
            content: messageWithUser.content,
            timestamp: formatTimestamp(messageWithUser.createdAt),
            user: messageWithUser.user,
        });

        await User.findByIdAndUpdate(userId, {
            $inc: { lvl: 1 },
        });

        // 🔹 Réponse API
        res.status(201).json({
            success: true,
            message: {
                id: messageWithUser._id.toString(),
                sender: userId,
                content: messageWithUser.content,
                timestamp: formatTimestamp(messageWithUser.createdAt),
                user: messageWithUser.user,
            },
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message,
        });
    }
}

// 🔹 Formater l'heure/Date pour l'affichage
function formatTimestamp(date) {
    const now = new Date();
    const messageDate = new Date(date);

    if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
        return 'Hier';
    }

    return messageDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
}