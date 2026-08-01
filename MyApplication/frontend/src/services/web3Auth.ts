import { ethers } from 'ethers';
import { api } from './api';

export interface AuthSession {
  walletAddress: string;
  token: string;
  balanceEth: string;
}

export class Web3AuthService {
  /**
   * Request account access from MetaMask via Ethers v6 BrowserProvider.
   */
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

  /**
   * Fetch unique challenge nonce from backend for wallet.
   */
  static async getNonce(walletAddress: string): Promise<string> {
    const response = await api.get<{ walletAddress: string; nonce: string }>(`/auth/nonce?walletAddress=${walletAddress}`);
    return response.data.nonce;
  }

  /**
   * Complete WalletConnect/MetaMask authentication flow:
   * Connect -> Get Nonce -> Sign Nonce -> Verify -> Store JWT -> Return Session
   */
  static async loginWithWallet(): Promise<AuthSession> {
    try {
      // 1. Connect Wallet
      const { provider, signer, address } = await this.getBrowserProvider();

      // 2. Fetch challenge nonce from backend
      const nonce = await this.getNonce(address);

      // 3. Prompt user to sign nonce in MetaMask
      const signature = await signer.signMessage(nonce);

      // 4. Send signature to backend for verification & JWT issuance
      const response = await api.post<{ token: string; walletAddress: string }>('/auth/verify', {
        walletAddress: address,
        signature,
      });

      const token = response.data.token;

      // 5. Get ETH balance
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);

      // 6. Store in localStorage
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

  /**
   * Clear wallet session tokens.
   */
  static logout(): void {
    localStorage.removeItem('blindhire_jwt_token');
    localStorage.removeItem('blindhire_wallet_address');
  }

  /**
   * Check if saved session exists in localStorage.
   */
  static getStoredSession(): { walletAddress: string | null; token: string | null } {
    return {
      walletAddress: localStorage.getItem('blindhire_wallet_address'),
      token: localStorage.getItem('blindhire_jwt_token'),
    };
  }
}
