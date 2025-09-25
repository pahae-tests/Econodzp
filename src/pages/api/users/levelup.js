import User from "../_models/User";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const { userId } = req.query;

        await User.findByIdAndUpdate(userId, {
            $inc: { lvl: 1 },
        });

        res.status(201).json({
            success: true
        });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Error inc lvl',
            error: error.message,
        });
    }
}