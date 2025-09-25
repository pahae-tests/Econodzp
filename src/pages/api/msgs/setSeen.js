import dbConnect from '../_lib/connect';
import NotSeen from '../_models/NotSeen';

export default async function handler(req, res) {
  // Autoriser uniquement DELETE
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { sessionId, room } = req.query;

  // Vérification des paramètres
  if (!sessionId || !room) {
    return res.status(400).json({
      success: false,
      message: 'sessionId et room sont requis',
    });
  }

  try {
    // Connexion à la base
    await dbConnect();

    // Suppression des enregistrements
    const result = await NotSeen.deleteMany({
      user: sessionId,
      room: room,
    });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} enregistrements supprimés.`,
    });
  } catch (error) {
    console.error('Erreur clearNotSeen:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
}