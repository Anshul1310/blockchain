import { ethers } from 'ethers';
import { api } from './api';

export interface AuthSession {
  walletAddress: string;
  token: string;
  balanceEth: string;
}

export class Web3AuthService {
  


  static async getBrowserProvider(): Promise<{ provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; address: string }> {
    if (!window.ethereum) {
      throw new Error('MetaMask or Web3 wallet extension not detected.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts authorized.');
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  }

  


  static async getNonce(walletAddress: string): Promise<string> {
    const response = await api.get<{ walletAddress: string; nonce: string }>(`/auth/nonce?walletAddress=${walletAddress}`);
    return response.data.nonce;
  }

  



  static async loginWithWallet(): Promise<AuthSession> {
    try {
      
      const { provider, signer, address } = await this.getBrowserProvider();

      
      const nonce = await this.getNonce(address);

      
      const signature = await signer.signMessage(nonce);

      
      const response = await api.post<{ token: string; walletAddress: string }>('/auth/verify', {
        walletAddress: address,
        signature,
      });

      const token = response.data.token;

      
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);

      
      localStorage.setItem('blindhire_jwt_token', token);
      localStorage.setItem('blindhire_wallet_address', address);

      return {
        walletAddress: address,
        token,
        balanceEth: parseFloat(balanceEth).toFixed(4),
      };
    } catch (err: any) {
      console.error('Wallet Login Failure:', err);
      throw new Error(err.response?.data?.error || err.message || 'Wallet authentication failed');
    }
  }

  


  static logout(): void {
    localStorage.removeItem('blindhire_jwt_token');
    localStorage.removeItem('blindhire_wallet_address');
  }

  


  static getStoredSession(): { walletAddress: string | null; token: string | null } {
    return {
      walletAddress: localStorage.getItem('blindhire_wallet_address'),
      token: localStorage.getItem('blindhire_jwt_token'),
    };
  }
}
