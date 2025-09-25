import dbConnect from '../_lib/connect';
import User from '../_models/User';

export default async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id, ...updateData } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    await dbConnect();

    try {
        // Vérifier que l'utilisateur existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mettre à jour les champs autorisés
        const allowedFields = ['firstname', 'lastname', 'img', 'bio', 'status', 'labels'];
        const update = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                // Gestion spéciale pour les labels
                if (field === 'labels' && Array.isArray(updateData[field])) {
                    update[field] = updateData[field];
                }
                // Gestion spéciale pour follows/following
                else if (field === 'follows' || field === 'following') {
                    if (Array.isArray(updateData[field])) {
                        update[field] = updateData[field].map(id => new mongoose.Types.ObjectId(id));
                    }
                }
                else {
                    update[field] = updateData[field];
                }
            }
        });

        const updatedUser = await User.findByIdAndUpdate(
            id,
            update,
            {
                new: true,
                runValidators: true,
                select: 'firstname lastname img bio sex pointsLevel status labels follows following createdAt'
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found after update' });
        }

        // Formater la réponse
        const responseUser = {
            ...updatedUser.toObject(),
            id: updatedUser._id.toString(),
            firstName: updatedUser.firstname,
            lastName: updatedUser.lastname,
            follows: updatedUser.follows?.map(f => f.toString()) || [],
            following: updatedUser.following?.map(f => f.toString()) || [],
            followers: updatedUser.follows?.length || 0,
            followingCount: updatedUser.following?.length || 0
        };

        res.status(200).json({
            success: true,
            user: responseUser,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user profile',
            error: error.message
        });
    }
}
