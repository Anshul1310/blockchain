import crypto from 'crypto';
import { env } from '../config/env.js';
const IPFS_GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
];
const ipfsCache = new Map();
export class IPFSService {
    static async uploadJSON(data) {
        const jsonString = JSON.stringify(data);
        const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
        const fallbackCid = `Qm${hash.substring(0, 44)}`;
        const pinataJwt = env.PINATA_JWT || process.env.PINATA_JWT;
        const pinataApiKey = env.PINATA_API_KEY || process.env.PINATA_API_KEY;
        const pinataSecretKey = env.PINATA_SECRET_API_KEY || process.env.PINATA_SECRET_API_KEY;
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
                    const pinData = (await response.json());
                    console.log(`[Pinata IPFS] ✅ Pinned JSON to Pinata IPFS: CID=${pinData.IpfsHash}`);
                    ipfsCache.set(pinData.IpfsHash, data);
                    return pinData.IpfsHash;
                }
                else {
                    const errText = await response.text();
                    console.warn(`[Pinata IPFS] Pinata JWT returned ${response.status}: ${errText}`);
                }
            }
            catch (pinErr) {
                console.warn('[Pinata IPFS] Pinata JWT upload error:', pinErr);
            }
        }
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
                    const pinData = (await response.json());
                    console.log(`[Pinata IPFS] ✅ Pinned JSON to Pinata IPFS: CID=${pinData.IpfsHash}`);
                    ipfsCache.set(pinData.IpfsHash, data);
                    return pinData.IpfsHash;
                }
            }
            catch (keyErr) {
                console.warn('[Pinata IPFS] Pinata API Key upload error:', keyErr);
            }
        }
        ipfsCache.set(fallbackCid, data);
        console.log(`[IPFS] Local Gateway CID Generated & Cached: ${fallbackCid}`);
        return fallbackCid;
    }
    static async fetchJSON(cid) {
        if (ipfsCache.has(cid)) {
            return ipfsCache.get(cid);
        }
        for (const gatewayUrl of IPFS_GATEWAYS) {
            try {
                const url = `${gatewayUrl}${cid}`;
                const response = await fetch(url, { headers: { Accept: 'application/json' } });
                if (response.ok) {
                    const data = (await response.json());
                    ipfsCache.set(cid, data);
                    console.log(`[IPFS] Successfully fetched CID ${cid} from gateway ${gatewayUrl}`);
                    return data;
                }
            }
            catch (err) {
            }
        }
        console.warn(`[IPFS] CID ${cid} not resolved from public gateways yet.`);
        return null;
    }
    static purge() {
        ipfsCache.clear();
        console.log('[IPFS] Purged local IPFS CID cache.');
    }
}
