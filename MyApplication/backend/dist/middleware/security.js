import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
export function setupSecurityMiddleware(app) {
    app.use(helmet());
    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }));
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests from this IP, please try again later.' },
    });
    app.use('/api', apiLimiter);
}
