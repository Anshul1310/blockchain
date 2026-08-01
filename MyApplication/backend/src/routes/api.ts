import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { IPFSController } from '../controllers/ipfsController.js';
import { ProjectController } from '../controllers/projectController.js';

export const apiRouter = Router();


apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BlindHire AI Backend', timestamp: new Date() });
});


apiRouter.get('/auth/nonce', AuthController.getNonce);
apiRouter.post('/auth/verify', AuthController.verifySignature);


apiRouter.post('/ipfs/upload', IPFSController.uploadJSON);
apiRouter.get('/ipfs/:cid', IPFSController.getJSON);


apiRouter.get('/projects', ProjectController.getProjects);
apiRouter.post('/projects', ProjectController.createProject);
apiRouter.get('/proposals', ProjectController.getProposals);
apiRouter.get('/projects/:id/proposals', ProjectController.getProjectProposals);
apiRouter.post('/proposals', ProjectController.submitProposal);
apiRouter.post('/proposals/:id/accept', ProjectController.acceptProposal);


apiRouter.get('/escrows', ProjectController.getEscrows);
apiRouter.post('/escrows/:id/deliver', ProjectController.submitEscrowDeliverable);
apiRouter.post('/escrows/:id/release', ProjectController.releaseEscrowPayment);


apiRouter.get('/messages', ProjectController.getMessages);
apiRouter.post('/messages', ProjectController.sendMessage);


apiRouter.post('/reset', ProjectController.resetAllData);
apiRouter.post('/purge', ProjectController.resetAllData);
apiRouter.post('/clear', ProjectController.resetAllData);
