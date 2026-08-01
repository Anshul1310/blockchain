import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Bearer token missing.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = { walletAddress: decoded.walletAddress };
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
    }
}
