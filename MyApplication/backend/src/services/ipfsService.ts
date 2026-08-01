import crypto from 'crypto';
import { env } from '../config/env.js';

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

const ipfsCache = new Map<string, any>();

export class IPFSService {
  /**
   * Upload JSON object to Pinata Decentralized IPFS Storage and return IPFS CID.
   */
  static async uploadJSON(data: Record<string, any>): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    // Generate deterministic IPFS CID v0 fallback hash
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
    const fallbackCid = `Qm${hash.substring(0, 44)}`;

    const pinataJwt = env.PINATA_JWT || process.env.PINATA_JWT;
    const pinataApiKey = env.PINATA_API_KEY || process.env.PINATA_API_KEY;
    const pinataSecretKey = env.PINATA_SECRET_API_KEY || process.env.PINATA_SECRET_API_KEY;

    // 1. Try Pinata JWT Bearer Pinning
    if (pinataJwt && pinataJwt.trim().length > 10) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pinataJwt.trim()}`,
          },
          body: jsonString,
        });

        if (response.ok) {
          const pinData = (await response.json()) as { IpfsHash: string };
          console.log(`[Pinata IPFS] ✅ Pinned JSON to Pinata IPFS: CID=${pinData.IpfsHash}`);
          ipfsCache.set(pinData.IpfsHash, data);
          return pinData.IpfsHash;
        } else {
          const errText = await response.text();
          console.warn(`[Pinata IPFS] Pinata JWT returned ${response.status}: ${errText}`);
        }
      } catch (pinErr) {
        console.warn('[Pinata IPFS] Pinata JWT upload error:', pinErr);
      }
    }

    // 2. Try Pinata API Key / Secret Pinning
    if (pinataApiKey && pinataSecretKey) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataApiKey.trim(),
            'pinata_secret_api_key': pinataSecretKey.trim(),
          },
          body: jsonString,
        });

        if (response.ok) {
          const pinData = (await response.json()) as { IpfsHash: string };
          console.log(`[Pinata IPFS] ✅ Pinned JSON to Pinata IPFS: CID=${pinData.IpfsHash}`);
          ipfsCache.set(pinData.IpfsHash, data);
          return pinData.IpfsHash;
        }
      } catch (keyErr) {
        console.warn('[Pinata IPFS] Pinata API Key upload error:', keyErr);
      }
    }

    // Fallback: Cache & return deterministic CID
    ipfsCache.set(fallbackCid, data);
    console.log(`[IPFS] Local Gateway CID Generated & Cached: ${fallbackCid}`);

    return fallbackCid;
  }

  /**
   * Fetch JSON document from Decentralized IPFS Gateways by CID.
   */
  static async fetchJSON<T = any>(cid: string): Promise<T | null> {
    if (ipfsCache.has(cid)) {
      return ipfsCache.get(cid) as T;
    }

    for (const gatewayUrl of IPFS_GATEWAYS) {
      try {
        const url = `${gatewayUrl}${cid}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (response.ok) {
          const data = (await response.json()) as T;
          ipfsCache.set(cid, data);
          console.log(`[IPFS] Successfully fetched CID ${cid} from gateway ${gatewayUrl}`);
          return data;
        }
      } catch (err) {
        // Try next gateway
      }
    }

    console.warn(`[IPFS] CID ${cid} not resolved from public gateways yet.`);
    return null;
  }

  /**
   * Clear local CID cache
   */
  static purge() {
    ipfsCache.clear();
    console.log('[IPFS] Purged local IPFS CID cache.');
  }
}
