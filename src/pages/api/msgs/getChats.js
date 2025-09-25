import dbConnect from '../_lib/connect';
import Message from '../_models/Msg';
import User from '../_models/User';
import NotSeen from '../_models/NotSeen';

export default async function handler(req, res) {
    await dbConnect();

    const { userId: sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ success: false, message: 'userId manquant' });
    }

    try {
        // 🔹 Récupérer tous les messages où l'utilisateur a participé
        const messages = await Message.find({
            room: { $regex: sessionId } // correspond à "contient sessionId"
        }).sort({ createdAt: -1 });


        // 🔹 Extraire les utilisateurs associés
        const users = await Promise.all(
            messages
                .filter((msg) => msg.room !== '5764889019')
                .map(async (msg) => {
                    const otherUserId = msg.room.replace(sessionId, '');
                    return await User.findById(otherUserId);
                })
        );

        // 🔹 Supprimer les doublons par _id
        const uniqueArray = [...new Map(users.map((u) => [u._id.toString(), u])).values()];

        // 🔹 Récupérer les rooms non vues pour cet utilisateur
        const notSeenRecords = await NotSeen.find({ user: sessionId }).lean();
        const notSeenRooms = new Set(notSeenRecords.map((rec) => rec.room));

        // 🔹 Ajouter "seen" à chaque utilisateur
        const chatsWithSeen = uniqueArray.map((u) => {
            // Trouver le message correspondant à cette conversation pour extraire room
            const msg = messages.find((m) => m.room.includes(u._id.toString()));
            const room = msg ? msg.room : null;

            return {
                ...u.toObject?.() || u, // s'assurer qu'on renvoie un objet simple
                seen: room ? !notSeenRooms.has(room) : true,
            };
        });

        return res.status(200).json({ success: true, chats: chatsWithSeen });
    } catch (err) {
        console.error('Erreur getChats:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}