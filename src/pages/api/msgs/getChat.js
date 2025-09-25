import dbConnect from '../_lib/connect';
import Message from '../_models/Msg';
import User from '../_models/User';

export default async function handler(req, res) {
    await dbConnect();

    const { room, userId } = req.query;

    if (!room || !userId) {
        return res.status(400).json({ success: false, message: 'Room ou userId manquant' });
    }

    try {
        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId).select('_id firstname lastname img status');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        // Récupérer les messages de la salle, triés par date croissante
        const messages = await Message.find({ room })
            .sort({ createdAt: 1 })
            .populate('user', '_id firstname lastname img');

        // Formater les messages pour le frontend
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            sender: msg.user._id.toString(),
            timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        console.log(formattedMessages)

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                img: user.img,
                lastActive: user.status,
            },
            messages: formattedMessages || []
        });
    } catch (err) {
        console.error('Erreur getChat:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}