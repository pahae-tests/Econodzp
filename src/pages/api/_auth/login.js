import dbConnect from '../_lib/connect';
import User from '../_models/User';
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'infos incorrects' });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'infos incorrects' });
    }

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

    console.log('Session started for user:', user._id);
    res.status(200).json({ userID: user._id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}