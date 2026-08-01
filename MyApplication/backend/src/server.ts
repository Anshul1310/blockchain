import express from 'express';
import { createServer } from 'http';
import { env } from './config/env.js';
import { setupSecurityMiddleware } from './middleware/security.js';
import { apiRouter } from './routes/api.js';
import { WebSocketRelayServer } from './websocket/relayServer.js';
import { DatabaseStorage } from './services/dbStorage.js';

const app = express();
const httpServer = createServer(app);


DatabaseStorage.init();


app.use(express.json({ limit: '10mb' }));


setupSecurityMiddleware(app);


app.use('/api', apiRouter);


new WebSocketRelayServer(httpServer);

const PORT = parseInt(env.PORT, 10) || 5000;


if (!process.env.VERCEL) {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 BlindHire AI Backend Running on Port ${PORT}`);
    console.log(`🔒 Security: Helmet, CORS, Rate-Limiting Enabled`);
    console.log(`🌐 WebSockets: E2E Encrypted Relay Ready at /ws`);
    console.log(`====================================================`);
  });
}

export default app;
