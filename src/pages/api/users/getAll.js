import dbConnect from '../_lib/connect';
import User from '../_models/User';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    await dbConnect();

    try {
        // Récupérer tous les utilisateurs avec les champs nécessaires
        const users = await User.find({})
            .select('firstname lastname img bio sex lvl status')
            .lean();

        // Formater les données pour correspondre au front-end
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            img: user.img || '/user.jpg',
            firstName: user.firstname || '',
            lastName: user.lastname || '',
            bio: user.bio || '',
            sex: user.sex || 'male',
            pointsLevel: user.lvl || 0,
            status: user.status || ''
        }));

        console.log(formattedUsers)

        res.status(200).json({
            success: true,
            users: formattedUsers
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
}