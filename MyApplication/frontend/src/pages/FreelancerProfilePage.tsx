import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Star, Bot, Award, ExternalLink, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const FreelancerProfilePage: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();

  const profile = {
    walletAddress: walletAddress || '0x4F89...9B12',
    username: 'Anon-Solidity-Specialist',
    bio: 'Senior Smart Contract Auditor & Web3 Full-Stack Developer with 5+ years building DeFi protocols and NFT marketplaces.',
    skills: ['Solidity', 'Foundry', 'Hardhat', 'Ethers.js v6', 'IPFS', 'OpenZeppelin', 'React 19'],
    rating: 4.98,
    completedProjectsCount: 18,
    aiTrustScore: 99,
    profileCid: 'QmP9x...1B3',
    experience: [
      { role: 'Lead Smart Contract Auditor', duration: '3 Years', summary: 'Audited 20+ Sepolia & Mainnet escrows' },
      { role: 'DeFi Protocol Engineer', duration: '2 Years', summary: 'Built ERC-4337 Account Abstraction modules' },
    ],
    portfolio: [
      { title: 'Zero-Knowledge Escrow Protocol', cid: 'QmZk1...A90', tags: ['Solidity', 'Foundry'] },
      { title: 'Decentralized IPFS Asset Storage', cid: 'QmIp2...B44', tags: ['IPFS', 'TypeScript'] },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/freelancers" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Talent Directory
      </Link>

      <Card glow="purple" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-xl text-white shadow-glow-purple">
              #{profile.walletAddress.substring(2, 4)}
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-white">{profile.username}</h1>
              <p className="text-xs font-mono text-slate-400">{profile.walletAddress}</p>
              <p className="text-[11px] font-mono text-purple-400 mt-0.5">Profile IPFS CID: {profile.profileCid}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="emerald" icon={<Bot className="w-3.5 h-3.5" />}>
              AI Trust Score: {profile.aiTrustScore}%
            </Badge>
            <Badge variant="amber" icon={<Star className="w-3.5 h-3.5 fill-amber-400" />}>
              {profile.rating} / 5.0
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-heading font-bold text-lg text-white">Anonymous Candidate Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-heading font-bold text-lg text-white">Verified Skill Matrix</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <Badge key={s} variant="purple" size="md">{s}</Badge>
            ))}
          </div>
        </div>

        {/* Portfolio CIDs */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <h3 className="font-heading font-bold text-lg text-white">Verified Portfolio Artifacts (IPFS)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.portfolio.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-card bg-black/30 space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                  <ExternalLink className="w-4 h-4 text-cyan-400 cursor-pointer" />
                </div>
                <p className="text-xs font-mono text-slate-400">CID: {item.cid}</p>
                <div className="flex gap-1.5 pt-1">
                  {item.tags.map((t) => (
                    <Badge key={t} variant="cyan" size="sm">{t}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
};
