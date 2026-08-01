import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI } from '../../../shared/src/constants/contract';
import { useAuth } from '../context/AuthContext';

export function useContract() {
  const { isConnected, walletAddress } = useAuth();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readOnlyContract, setReadOnlyContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    const readOnlyInstance = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, BLINDHIRE_ESCROW_ABI, provider);
    setReadOnlyContract(readOnlyInstance);

    
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

  


  const registerProfileCID = useCallback(async (profileCID: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.registerProfileCID(profileCID);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  


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

  


  const acceptFreelancerOnChain = useCallback(async (projectId: number, freelancerAddr: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.acceptFreelancer(projectId, freelancerAddr);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  


  const uploadDeliverableCIDOnChain = useCallback(async (projectId: number, milestoneIndex: number, deliverableCID: string) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.uploadDeliverableCID(projectId, milestoneIndex, deliverableCID);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  


  const releaseMilestonePaymentOnChain = useCallback(async (projectId: number, milestoneIndex: number) => {
    await ensureSepoliaNetwork();
    if (!contract) throw new Error('Contract not initialized or wallet not connected');
    const tx = await contract.releaseMilestonePayment(projectId, milestoneIndex);
    await tx.wait();
    return tx.hash;
  }, [contract, ensureSepoliaNetwork]);

  


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
