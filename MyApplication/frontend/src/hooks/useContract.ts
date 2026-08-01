import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI } from '../../../shared/src/constants/contract';
import { useAuth } from '../context/AuthContext';

export function useContract() {
  const { isConnected, walletAddress } = useAuth();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readOnlyContract, setReadOnlyContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    // Set up Read-Only Contract Provider (Sepolia Testnet)
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    const readOnlyInstance = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI, provider);
    setReadOnlyContract(readOnlyInstance);

    // Set up Signer Contract if user is connected
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
   * Register Profile CID on-chain
   */
  const registerProfileCID = useCallback(async (profileCID: string) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.registerProfileCID(profileCID);
    await tx.wait();
    return tx.hash;
  }, [contract]);

  /**
   * Deposit Escrow & Create Project on-chain
   */
  const createProjectOnChain = useCallback(async (
    projectCID: string,
    deadlineDays: number,
    milestoneAmountsWei: bigint[],
    totalValueWei: bigint
  ) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.createProject(projectCID, deadlineDays, milestoneAmountsWei, { value: totalValueWei });
    const receipt = await tx.wait();
    return receipt;
  }, [contract]);

  /**
   * Accept Freelancer on-chain
   */
  const acceptFreelancerOnChain = useCallback(async (projectId: number, freelancerAddress: string) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.acceptFreelancer(projectId, freelancerAddress);
    await tx.wait();
    return tx.hash;
  }, [contract]);

  /**
   * Upload Deliverable CID on-chain
   */
  const uploadDeliverableCIDOnChain = useCallback(async (projectId: number, milestoneIndex: number, deliverableCID: string) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.uploadDeliverableCID(projectId, milestoneIndex, deliverableCID);
    await tx.wait();
    return tx.hash;
  }, [contract]);

  /**
   * Release Milestone Payment on-chain
   */
  const releaseMilestonePaymentOnChain = useCallback(async (projectId: number, milestoneIndex: number) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.releaseMilestonePayment(projectId, milestoneIndex);
    await tx.wait();
    return tx.hash;
  }, [contract]);

  /**
   * Open Dispute on-chain
   */
  const openDisputeOnChain = useCallback(async (projectId: number) => {
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.openDispute(projectId);
    await tx.wait();
    return tx.hash;
  }, [contract]);

  return {
    contract,
    readOnlyContract,
    registerProfileCID,
    createProjectOnChain,
    acceptFreelancerOnChain,
    uploadDeliverableCIDOnChain,
    releaseMilestonePaymentOnChain,
    openDisputeOnChain,
  };
}
