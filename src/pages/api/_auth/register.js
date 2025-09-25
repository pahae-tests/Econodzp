import dbConnect from '../_lib/connect';
import User from '../_models/User';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { firstname, lastname, email, password, sex, birth } = req.body;

    // Validation basique (vous pourriez ajouter plus de validations)
    if (!firstname || !lastname || !email || !password || !sex || !birth) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      sex,
      birth,
      img: '', // Valeur par défaut
      bio: '', // Valeur par défaut
      note: '', // Valeur par défaut
      lvl: 0, // Valeur par défaut
      posts: [], // Valeur par défaut
      labels: [], // Valeur par défaut
      follows: [], // Valeur par défaut
      following: [] // Valeur par défaut
    });

    // Sauvegarder l'utilisateur
    await newUser.save();

    const user = await User.findOne({ email });

    const token = jwt.sign({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      img: user.img,
      lvl: user.lvl,
      email: user.email,
      sex: user.sex,
      birth: user.birth,
      createdAt: user.createdAt,
    }, process.env.JWT_SECRET || "1111", {
      expiresIn: "7d",
    });

    const serialized = serialize("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    res.setHeader("Set-Cookie", serialized);

    // Réponse réussie (sans envoyer le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      message: 'Utilisateur créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de l\'inscription',
      error: error.message
    });
  }
}