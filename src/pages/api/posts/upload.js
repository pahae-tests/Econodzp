// src/pages/api/posts/upload.js

import dbConnect from '../_lib/connect';
import Post from '../_models/Post';
import User from '../_models/User';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Désactive le bodyParser par défaut de Next.js pour permettre formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: "dr29ynkgj",
  api_key: "218193389729518",
  api_secret: "BQFLWne1B9HgXlOheRuwDRpu5w4",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json({ message: 'Erreur parsing formulaire', error: err.message });

    try {
      const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

      if (!content || !userId) {
        return res.status(400).json({ message: 'Contenu et ID utilisateur requis' });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      let imageUrl = null;

      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;

        // Upload sur Cloudinary
        const result = await cloudinary.v2.uploader.upload(file.filepath, {
          folder: 'posts', // dossier dans Cloudinary
          use_filename: true,
          unique_filename: true,
        });

        imageUrl = result.secure_url;
      }

      // Créer le post dans MongoDB
      const newPost = new Post({
        user: userId,
        content: content.trim(),
        img: imageUrl || null,
      });

      await newPost.save();

      // Mise à jour du tableau de posts de l'utilisateur
      await User.findByIdAndUpdate(userId, {
        $push: {
          posts: {
            title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            img: imageUrl || null,
          },
        },
        $inc: { lvl: 10 },
      });

      res.status(201).json({ success: true, post: newPost, message: 'Post créé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  });
}