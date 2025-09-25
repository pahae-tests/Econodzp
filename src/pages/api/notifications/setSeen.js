import dbConnect from '../_lib/connect';
import Notification from '../_models/Notification';

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { notificationId } = req.body;

    if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
    }

    await dbConnect();

    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { $set: { seen: true } },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            notification: {
                _id: updatedNotification._id.toString(),
                seen: updatedNotification.seen
            }
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
}