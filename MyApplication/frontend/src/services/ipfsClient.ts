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

  



  static async fetchJSON<T = any>(cid: string): Promise<T> {
    
    try {
      const response = await api.get<{ cid: string; data: T }>(`/ipfs/${cid}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      
    }

    
    for (const gatewayUrl of PUBLIC_IPFS_GATEWAYS) {
      try {
        const res = await fetch(`${gatewayUrl}${cid}`);
        if (res.ok) {
          const data = await res.json();
          return data as T;
        }
      } catch (e) {
        
      }
    }

    throw new Error(`Failed to resolve IPFS document for CID: ${cid}`);
  }
}
