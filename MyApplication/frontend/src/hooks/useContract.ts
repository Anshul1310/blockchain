import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI } from '../../../shared/src/constants/contract';
import { useAuth } from '../context/AuthContext';

export function useContract() {
  const { isConnected, walletAddress } = useAuth();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readOnlyContract, setReadOnlyContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    // Read-Only Contract Provider on Sepolia Testnet
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    const readOnlyInstance = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI, provider);
    setReadOnlyContract(readOnlyInstance);

    // Signer Contract if user is connected
    if (isConnected && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      browserProvider.getSigner().then((signer) => {
        const signerInstance = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI, signer);
        setContract(signerInstance);
      }).catch(console.error);
    } else {
      setContract(null);
    }
  }, [isConnected, walletAddress]);

  /**
   * Automatically switch MetaMask network to Sepolia Testnet (Chain ID 0xaa36a7 / 11155111)
   */
  const ensureSepoliaNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network to MetaMask:', addError);
        }
      }
    }
  }, []);

  /**
   * Register Profile CID on-chain
   */
  const registerProfileCID = useCallback(async (profileCID: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.registerProfileCID(profileCID);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  /**
   * Deposit Escrow & Create Project on-chain
   */
  const createProjectOnChain = useCallback(async (
    projectCID: string,
    deadlineDays: number,
    milestoneAmountsWei: bigint[],
    totalValueWei: bigint
  ) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.createProject(projectCID, deadlineDays, milestoneAmountsWei, { value: totalValueWei });
    const receipt = await tx.wait();
    return receipt.hash;
  }, [contract, ensureSepoliaNetwork]);

  /**
   * Accept Freelancer on-chain
   */
  const acceptFreelancerOnChain = useCallback(async (projectId: number, freelancerAddr: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.acceptFreelancer(projectId, freelancerAddr);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  /**
   * Upload Deliverable CID on-chain
   */
  const uploadDeliverableCIDOnChain = useCallback(async (projectId: number, milestoneIndex: number, deliverableCID: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.uploadDeliverableCID(projectId, milestoneIndex, deliverableCID);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  /**
   * Release Milestone Payment on-chain
   */
  const releaseMilestonePaymentOnChain = useCallback(async (projectId: number, milestoneIndex: number) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.releaseMilestonePayment(projectId, milestoneIndex);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  /**
   * Open Dispute on-chain
   */
  const openDisputeOnChain = useCallback(async (projectId: number) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.openDispute(projectId);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  return {
    contract,
    readOnlyContract,
    ensureSepoliaNetwork,
    registerProfileCID,
    createProjectOnChain,
    acceptFreelancerOnChain,
    uploadDeliverableCIDOnChain,
    releaseMilestonePaymentOnChain,
    openDisputeOnChain,
  };
}
