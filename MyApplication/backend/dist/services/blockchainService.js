import { ethers } from 'ethers';
import { env } from '../config/env.js';
// Deployer Private Key for Sepolia Testnet Auto-Payouts
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0xa6d9df9444105439674ef8cca849ab5c68eb08654a4e00198a62798dd9146984';
const SEPOLIA_RPC_URL = env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const SEPOLIA_CHAIN_ID = 11155111; // Explicit Sepolia Testnet Chain ID
export class BlockchainService {
    /**
     * Transfer Sepolia TESTNET ETH directly to Freelancer's MetaMask Wallet
     */
    static async sendEthPayout(recipientAddress, amountEth) {
        try {
            console.log(`[BlockchainService] Connecting to Sepolia Testnet (Chain ID: ${SEPOLIA_CHAIN_ID}) RPC: ${SEPOLIA_RPC_URL}`);
            // Enforce Sepolia Testnet network (Chain ID 11155111)
            const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, {
                name: 'sepolia',
                chainId: SEPOLIA_CHAIN_ID,
            });
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
                throw new Error(`Connected network is not Sepolia Testnet! (Detected Chain ID: ${network.chainId})`);
            }
            const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
            const parsedAmount = ethers.parseEther(amountEth && parseFloat(amountEth) > 0 ? amountEth : '0.01');
            console.log(`[BlockchainService] Sending ${amountEth} Sepolia TESTNET ETH from ${wallet.address} to ${recipientAddress}...`);
            // Execute transaction on Sepolia Testnet
            const tx = await wallet.sendTransaction({
                to: recipientAddress,
                value: parsedAmount,
            });
            console.log(`[BlockchainService] Sepolia Testnet Tx Sent to Mempool: ${tx.hash}`);
            // Wait 1 block confirmation
            await tx.wait(1);
            const etherscanUrl = `https://sepolia.etherscan.io/tx/${tx.hash}`;
            console.log(`[BlockchainService] ✅ Sepolia Testnet Payout Confirmed! Hash: ${tx.hash}`);
            return {
                success: true,
                txHash: tx.hash,
                etherscanUrl,
            };
        }
        catch (err) {
            console.error('[BlockchainService] Sepolia Testnet ETH Payout Error:', err);
            return {
                success: false,
                error: err.message || 'Failed to dispatch Sepolia Testnet ETH payment',
            };
        }
    }
}
