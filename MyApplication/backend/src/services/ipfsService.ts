import crypto from 'crypto';
import { env } from '../config/env.js';

// In-memory decentralized IPFS mock store: CID -> JSON string payload
const ipfsStorage = new Map<string, any>();

export class IPFSService {
  /**
   * Upload JSON object to IPFS and return CID reference.
   */
  static async uploadJSON(data: Record<string, any>): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    // Generate deterministic IPFS-style SHA-256 CID hash
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
    const cid = `Qm${hash.substring(0, 44)}`;

    ipfsStorage.set(cid, data);
    console.log(`[IPFS] Pinned JSON to CID: ${cid}`);
    
    return cid;
  }

  /**
   * Fetch JSON document from IPFS by CID.
   */
  static async fetchJSON<T = any>(cid: string): Promise<T | null> {
    if (ipfsStorage.has(cid)) {
      return ipfsStorage.get(cid) as T;
    }
    
    console.warn(`[IPFS] CID ${cid} not found in local gateway cache.`);
    return null;
  }
}
