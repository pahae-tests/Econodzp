import dbConnect from '../_lib/connect';
import User from '../_models/User';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { sex } = req.query

    await dbConnect();

    try {
        // Récupérer les utilisateurs féminins avec les informations nécessaires
        const users = await User.find({ sex: sex === 'male' ? 'female' : 'male' })
            .select('firstname lastname img bio age lvl labels')
            .lean();

        // Formater les données pour correspondre au front-end
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            id: user._id.toString(),
            img: user.img || '/user.jpg',
            firstName: user.firstname || 'Unknown',
            lastName: user.lastname || '',
            bio: user.bio || '',
            age: user.age || 25,
            pointsLevel: user.lvl || 0,
            labels: user.labels || []
        }));

        res.status(200).json({
            success: true,
            users: formattedUsers
        });

    } catch (error) {
        console.error('Error fetching female users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
}