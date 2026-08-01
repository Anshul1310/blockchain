import { api } from './api';

export interface IPFSResponse {
  success: boolean;
  cid: string;
}

const PUBLIC_IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

export class IPFSClient {
  /**
   * Upload structured JSON payload (Profile, Project, Proposal, Deliverable) to IPFS.
   * Returns IPFS CID hash (e.g. Qm...).
   */
  static async uploadJSON(data: Record<string, any>): Promise<string> {
    try {
      const response = await api.post<IPFSResponse>('/ipfs/upload', data);
      if (!response.data.cid) {
        throw new Error('IPFS upload did not return a valid CID');
      }
      return response.data.cid;
    } catch (err: any) {
      console.error('IPFS Upload Error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to upload document to IPFS');
    }
  }

  /**
   * Fetch JSON document from IPFS by CID reference.
   * Queries backend relay & public decentralized IPFS HTTP Gateways.
   */
  static async fetchJSON<T = any>(cid: string): Promise<T> {
    // 1. Try backend IPFS relay controller
    try {
      const response = await api.get<{ cid: string; data: T }>(`/ipfs/${cid}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      // Fallback to public gateways below
    }

    // 2. Query public decentralized IPFS HTTP Gateways directly
    for (const gatewayUrl of PUBLIC_IPFS_GATEWAYS) {
      try {
        const res = await fetch(`${gatewayUrl}${cid}`);
        if (res.ok) {
          const data = await res.json();
          return data as T;
        }
      } catch (e) {
        // Try next gateway
      }
    }

    throw new Error(`Failed to resolve IPFS document for CID: ${cid}`);
  }
}
