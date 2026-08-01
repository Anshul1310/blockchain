import express from 'express';
import { createServer } from 'http';
import { env } from './config/env.js';
import { setupSecurityMiddleware } from './middleware/security.js';
import { apiRouter } from './routes/api.js';
import { WebSocketRelayServer } from './websocket/relayServer.js';
import { DatabaseStorage } from './services/dbStorage.js';

const app = express();
const httpServer = createServer(app);

// Initialize Store
DatabaseStorage.init();

// JSON Body Parser
app.use(express.json({ limit: '10mb' }));

// Setup Security Headers, CORS & Rate Limiting
setupSecurityMiddleware(app);

// API Router
app.use('/api', apiRouter);

// Initialize Native WebSocket Encrypted Relay Server
new WebSocketRelayServer(httpServer);

const PORT = parseInt(env.PORT, 10) || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 BlindHire AI Backend Running on Port ${PORT}`);
    console.log(`🔒 Security: Helmet, CORS, Rate-Limiting Enabled`);
    console.log(`🌐 WebSockets: E2E Encrypted Relay Ready at /ws`);
    console.log(`====================================================`);
  });
}

export default app;
