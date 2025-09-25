import dbConnect from '../_lib/connect';
import User from '../_models/User';
import formidable from 'formidable';
import cloudinary from 'cloudinary';

export const config = {
  api: { bodyParser: false },
};

// Config Cloudinary
cloudinary.v2.config({
  cloud_name: "dr29ynkgj",
  api_key: "218193389729518",
  api_secret: "BQFLWne1B9HgXlOheRuwDRpu5w4",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const form = formidable({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Erreur parsing formulaire', error: err.message });

    const userId = fields.userId;
    if (!userId) return res.status(400).json({ message: 'User ID requis' });

    await dbConnect();

    try {
      if (!files.image) return res.status(400).json({ message: 'Aucune image fournie' });

      const file = Array.isArray(files.image) ? files.image[0] : files.image;

      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'users',
        use_filename: true,
        unique_filename: true
      });

      // Update MongoDB
      const updatedUser = await User.findByIdAndUpdate(userId, { img: result.secure_url }, { new: true });

      res.status(200).json({ success: true, imageUrl: result.secure_url, user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  });
}