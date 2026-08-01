import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ShieldCheck, Search, Star, Award, Code, CheckCircle, UserCheck, Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProfileModal } from '../components/profile/ProfileModal';
import { useAuth } from '../context/AuthContext';

export const FreelancersPage: React.FC = () => {
  const [searchSkill, setSearchSkill] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { isConnected, walletAddress } = useAuth();

  
  const freelancers: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2 text-left">
          <Badge variant="cyan" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Zero-Knowledge Talent Directory
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Anonymous Skilled Freelancers
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Clients hire based strictly on verified portfolio IPFS CIDs, AI trust scores, and code ratings. Names and photos are hidden.
          </p>
        </div>

        <Button onClick={() => setProfileModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Register Anonymous Profile
        </Button>
      </div>

      
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
        <input
          type="text"
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
          placeholder="Filter talent by skills (e.g. Solidity, React 19, IPFS)..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 shadow-inner"
        />
      </div>

      
      {freelancers.length === 0 ? (
        <Card className="p-12 text-center space-y-6 border border-purple-500/20 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center shadow-glow-purple">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-2xl text-white">No Public Candidate Profiles Yet</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Be the first freelancer to create an anonymous Web3 profile, pin your portfolio to IPFS, and register your profile CID on the Sepolia smart contract!
            </p>
          </div>
          <Button size="lg" onClick={() => setProfileModalOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
            Create Anonymous Profile Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancers.map((f) => (
            <Card key={f.walletAddress} hoverable glow="purple" className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-white shadow-glow-purple">
                      #{f.walletAddress.substring(2, 4)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-white">{f.username}</h3>
                      <span className="text-xs font-mono text-slate-400">{f.walletAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono border-y border-white/10 py-2.5">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {f.rating}
                  </span>
                  <span className="text-slate-300">{f.completedProjects} Projects</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Bot className="w-3.5 h-3.5" /> {f.aiTrustScore}% AI Score
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{f.bio}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.skills.map((s: string) => (
                    <Badge key={s} variant="slate" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <Link to={`/freelancers/${f.walletAddress}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Anonymous Profile
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

    </div>
  );
};
