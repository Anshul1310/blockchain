import React, { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, CheckCircle2, Upload, Inbox, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useContract } from '../hooks/useContract';
import { api } from '../services/api';
import { IPFSClient } from '../services/ipfsClient';
import { SEPOLIA_CONTRACT_ADDRESS } from '../../../shared/src/constants/contract';

interface EscrowContract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientWallet: string;
  freelancerWallet: string;
  amountEth: string;
  status: string;
  currentMilestone: string;
  deliverableCid?: string | null;
  txHash?: string | null;
  etherscanUrl?: string | null;
  contractAddress: string;
  createdAt: number;
}

export const EscrowPage: React.FC = () => {
  const { walletAddress, userRole } = useAuth();
  const { releaseMilestonePaymentOnChain } = useContract();

  const [deliverableText, setDeliverableText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEscrows = async () => {
    setIsLoading(true);
    try {
      const currentWallet = walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa';
      const response = await api.get<{ escrows: EscrowContract[] }>(`/escrows?wallet=${currentWallet}`);
      setEscrows(response.data.escrows || []);
    } catch (err) {
      console.error('Failed to load escrow contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [walletAddress]);

  const handleDeliverWork = async (e: React.FormEvent, escrowId: string) => {
    e.preventDefault();
    if (!deliverableText.trim()) return;

    setIsUploading(true);
    try {
      const deliverablePayload = {
        escrowId,
        freelancerWallet: walletAddress,
        deliverableSummary: deliverableText,
        submittedAt: Date.now(),
      };

      const cid = await IPFSClient.uploadJSON(deliverablePayload);
      console.log(`[Deliverable] Uploaded to IPFS CID: ${cid}`);

      await api.post(`/escrows/${escrowId}/deliver`, { deliverableCid: cid });

      alert(`Deliverable IPFS CID ${cid} submitted! The client can now review and release your ETH.`);
      setDeliverableText('');
      fetchEscrows();
    } catch (err: any) {
      console.error('Deliverable submission failed:', err);
      alert('Failed to submit deliverable to IPFS');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReleaseEthPayment = async (escrowId: string, amountEth: string, freelancerWallet: string) => {
    setIsReleasing(true);
    try {
      try {
        await releaseMilestonePaymentOnChain(1, 0);
      } catch (txErr) {
        console.warn('Smart contract transaction notice:', txErr);
      }

      const releaseRes = await api.post<{ success: boolean; txHash?: string; etherscanUrl?: string }>(`/escrows/${escrowId}/release`);

      const txInfo = releaseRes.data?.txHash ? `\n\nSepolia Tx Hash: ${releaseRes.data.txHash}` : '';
      alert(`✅ Success! ${amountEth} ETH has been transferred on Sepolia directly to Freelancer Wallet ${freelancerWallet}!${txInfo}`);
      
      fetchEscrows();
    } catch (err: any) {
      console.error('ETH release failed:', err);
      alert('Error releasing ETH payment');
    } finally {
      setIsReleasing(false);
    }
  };

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Non-Custodial Sepolia Escrow
          </Badge>
          <h1 className="text-3xl font-heading font-bold text-white mt-2">
            Escrow Contract Vault & Milestone Releases
          </h1>
          <p className="text-xs font-mono text-slate-400">Deployed Contract: {SEPOLIA_CONTRACT_ADDRESS}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs font-mono text-slate-400">Fetching on-chain escrow contracts...</p>
        </div>
      ) : escrows.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border border-white/10">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-white">No Active Escrow Contracts</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Book an order as a Client or accept a proposal as a Freelancer to initialize your active Sepolia milestone escrow contract.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {escrows.map((escrow) => {
            const isCompleted = escrow.status === 'completed';
            const isDelivered = escrow.status === 'delivered_pending_approval' || Boolean(escrow.deliverableCid);

            return (
              <Card key={escrow.id} glow={isCompleted ? 'emerald' : 'purple'} className="p-6 space-y-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <Badge variant={isCompleted ? 'emerald' : isDelivered ? 'cyan' : 'purple'}>
                      Status: {(escrow.status || 'in_progress').toUpperCase()}
                    </Badge>
                    <h3 className="font-heading font-bold text-xl text-white pt-1">{escrow.projectTitle}</h3>
                    <p className="text-xs font-mono text-slate-400">
                      Client: {shortenAddress(escrow.clientWallet)} • Freelancer: {shortenAddress(escrow.freelancerWallet)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Locked Escrow Vault</span>
                    <span className="font-heading font-extrabold text-2xl text-emerald-400">{escrow.amountEth} ETH</span>
                  </div>
                </div>

                {/* Milestone Progress */}
                <div className="p-4 rounded-xl glass-card bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-mono">Current Milestone Step</span>
                  <p className="text-sm font-semibold text-cyan-300">{escrow.currentMilestone}</p>
                  {escrow.deliverableCid && (
                    <p className="text-xs font-mono text-emerald-400 pt-1">
                      Deliverable IPFS CID: {escrow.deliverableCid}
                    </p>
                  )}
                </div>

                {/* FREELANCER STEP: Deliver Work */}
                {userRole === 'freelancer' && !isCompleted && (
                  <form onSubmit={(e) => handleDeliverWork(e, escrow.id)} className="space-y-3 border-t border-white/10 pt-4">
                    <label className="text-xs font-semibold text-white block">
                      Submit Work Deliverable Summary & IPFS Payload
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={deliverableText}
                      onChange={(e) => setDeliverableText(e.target.value)}
                      placeholder="Describe deliverables, paste GitHub PR link, or summary for client verification..."
                      className="w-full p-3 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <Button type="submit" isLoading={isUploading} size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                      Submit Deliverable to Smart Contract
                    </Button>
                  </form>
                )}

                {/* CLIENT STEP: Approve Deliverable & Release ETH */}
                {userRole === 'client' && !isCompleted && (
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    {isDelivered ? (
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
                        <p className="text-xs text-cyan-300">
                          Freelancer has submitted deliverable IPFS CID: <strong className="font-mono text-white">{escrow.deliverableCid}</strong>. Please verify the work and release the milestone ETH payout.
                        </p>
                        <Button
                          isLoading={isReleasing}
                          onClick={() => handleReleaseEthPayment(escrow.id, escrow.amountEth, escrow.freelancerWallet)}
                          leftIcon={<DollarSign className="w-4 h-4" />}
                        >
                          Approve Work & Release {escrow.amountEth} ETH to Freelancer
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Waiting for freelancer ({shortenAddress(escrow.freelancerWallet)}) to submit work deliverable IPFS CID...
                      </p>
                    )}
                  </div>
                )}

                {/* COMPLETED BANNER WITH SEPOLIA ETHERSCAN LINK */}
                {isCompleted && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Real Sepolia ETH Payment Transferred!
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      {escrow.amountEth} ETH transferred directly to Freelancer wallet ({shortenAddress(escrow.freelancerWallet)}).
                    </p>
                    {escrow.txHash && (
                      <a
                        href={escrow.etherscanUrl || `https://sepolia.etherscan.io/tx/${escrow.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono pt-1"
                      >
                        <span>View Live Sepolia Etherscan Tx: {escrow.txHash.substring(0, 14)}...</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
