import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // El formato esperado es: "Bearer token"
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password'); // Excluye la contraseña del usuario

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
