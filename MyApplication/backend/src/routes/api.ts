import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { IPFSController } from '../controllers/ipfsController.js';
import { ProjectController } from '../controllers/projectController.js';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BlindHire AI Backend', timestamp: new Date() });
});

// Authentication Routes (Wallet Nonce & Signature JWT)
apiRouter.get('/auth/nonce', AuthController.getNonce);
apiRouter.post('/auth/verify', AuthController.verifySignature);

// IPFS Decentralized Storage Routes
apiRouter.post('/ipfs/upload', IPFSController.uploadJSON);
apiRouter.get('/ipfs/:cid', IPFSController.getJSON);

// Projects & Proposals Routes
apiRouter.get('/projects', ProjectController.getProjects);
apiRouter.post('/projects', ProjectController.createProject);
apiRouter.get('/proposals', ProjectController.getProposals);
apiRouter.get('/projects/:id/proposals', ProjectController.getProjectProposals);
apiRouter.post('/proposals', ProjectController.submitProposal);
apiRouter.post('/proposals/:id/accept', ProjectController.acceptProposal);

// Escrows & Payment Release Routes
apiRouter.get('/escrows', ProjectController.getEscrows);
apiRouter.post('/escrows/:id/deliver', ProjectController.submitEscrowDeliverable);
apiRouter.post('/escrows/:id/release', ProjectController.releaseEscrowPayment);

// Chat & Encrypted Messaging Routes
apiRouter.get('/messages', ProjectController.getMessages);
apiRouter.post('/messages', ProjectController.sendMessage);

// Purge / Reset Route (Wipes all stored data)
apiRouter.post('/reset', ProjectController.resetAllData);
apiRouter.post('/purge', ProjectController.resetAllData);
