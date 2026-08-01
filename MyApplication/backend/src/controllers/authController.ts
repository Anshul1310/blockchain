import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';

export const signatureVerifySchema = z.object({
  walletAddress: z.string().min(10, 'Invalid wallet address'),
  signature: z.string().min(10, 'Invalid signature'),
});

export class AuthController {
  /**
   * GET /api/auth/nonce?walletAddress=0x...
   */
  static getNonce(req: Request, res: Response) {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'walletAddress query parameter is required' });
    }

    const nonce = AuthService.generateNonce(walletAddress);
    return res.json({ walletAddress, nonce });
  }

  /**
   * POST /api/auth/verify
   */
  static verifySignature(req: Request, res: Response) {
    const { walletAddress, signature } = req.body;

    const result = AuthService.verifySignature(walletAddress, signature);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    return res.json({
      message: 'Authentication successful',
      token: result.token,
      walletAddress,
    });
  }
}
