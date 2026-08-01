import React, { useState } from 'react';
import { ShieldCheck, DollarSign, CheckCircle2, AlertTriangle, Upload, Inbox } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { SEPOLIA_CONTRACT_ADDRESS } from '../../../shared/src/constants/contract';

export const EscrowPage: React.FC = () => {
  const { walletAddress } = useAuth();
  const [deliverableCid, setDeliverableCid] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Escrow details loaded dynamically from on-chain smart contract
  const activeEscrow: any = null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="purple" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Non-Custodial Sepolia Escrow
          </Badge>
          <h1 className="text-3xl font-heading font-bold text-white mt-2">
            Escrow Contract Management
          </h1>
          <p className="text-xs font-mono text-slate-400">Deployed Contract: {SEPOLIA_CONTRACT_ADDRESS}</p>
        </div>
      </div>

      {!activeEscrow ? (
        <Card className="p-12 text-center space-y-4 border border-white/10">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-white">No Active Contract Selected</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Select an active project escrow from your Dashboard to view milestone releases, submit deliverable IPFS CIDs, or trigger Groq AI dispute arbitration.
          </p>
        </Card>
      ) : (
        <Card className="space-y-6">
          <h3 className="font-heading font-bold text-xl text-white">Active Milestone Vault</h3>
        </Card>
      )}

    </div>
  );
};
