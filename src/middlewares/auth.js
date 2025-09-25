import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuth(req, res) {
    const token = req.cookies?.userToken;

    if (!token) {
        return null;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        return {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            img: user.img || "user.jpg",
            lvl: user.lvl || 0,
            email: user.email,
            sex: user.sex,
            birth: user.birth,
            createdAt: user.createdAt,
        };
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
}