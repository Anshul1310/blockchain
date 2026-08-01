import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
// In-memory challenge nonces map: walletAddress -> nonce
const nonceStore = new Map();
export class AuthService {
    /**
     * Generate a challenge nonce for a given wallet address.
     */
    static generateNonce(walletAddress) {
        const normalizedAddr = walletAddress.toLowerCase();
        const nonce = `BlindHire-AI Auth Nonce: ${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        // Nonce valid for 5 minutes
        nonceStore.set(normalizedAddr, {
            nonce,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });
        return nonce;
    }
    /**
     * Verify wallet signature against stored challenge nonce.
     */
    static verifySignature(walletAddress, signature) {
        const normalizedAddr = walletAddress.toLowerCase();
        const stored = nonceStore.get(normalizedAddr);
        if (!stored) {
            return { success: false, error: 'Nonce not found or expired. Request a new nonce.' };
        }
        if (Date.now() > stored.expiresAt) {
            nonceStore.delete(normalizedAddr);
            return { success: false, error: 'Challenge nonce expired. Please request a new one.' };
        }
        try {
            // Recover signer address from message and signature using Ethers v6
            const recoveredAddress = ethers.verifyMessage(stored.nonce, signature);
            if (recoveredAddress.toLowerCase() !== normalizedAddr) {
                return { success: false, error: 'Signature verification failed. Signer address mismatch.' };
            }
            // Clear consumed nonce to prevent replay attacks
            nonceStore.delete(normalizedAddr);
            // Issue JWT Token
            const token = jwt.sign({ walletAddress: normalizedAddr }, env.JWT_SECRET, { expiresIn: '24h' });
            return { success: true, token };
        }
        catch (err) {
            console.error('Signature verification error:', err);
            return { success: false, error: 'Invalid signature payload.' };
        }
    }
}
