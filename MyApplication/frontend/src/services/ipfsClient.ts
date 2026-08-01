import { api } from './api';

export interface IPFSResponse {
  success: boolean;
  cid: string;
}

export class IPFSClient {
  /**
   * Upload any structured JSON payload (Profile, Project, Proposal, Review, Deliverable) to IPFS.
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
   * Fetch JSON content from IPFS by CID reference.
   */
  static async fetchJSON<T = any>(cid: string): Promise<T> {
    try {
      const response = await api.get<{ cid: string; data: T }>(`/ipfs/${cid}`);
      return response.data.data;
    } catch (err: any) {
      console.error(`IPFS Fetch Error for CID ${cid}:`, err);
      throw new Error(`Failed to fetch IPFS document for CID: ${cid}`);
    }
  }
}
