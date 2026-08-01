import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Sparkles, Bot, Clock, DollarSign, Upload, CheckCircle2, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CreateProjectPage: React.FC = () => {
  const { walletAddress, userRole, setUserRole } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetEth, setBudgetEth] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('14');
  const [skills, setSkills] = useState<string[]>(['Solidity', 'React 19']);
  const [skillInput, setSkillInput] = useState('');
  const [isExtractingAI, setIsExtractingAI] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [createdCid, setCreatedCid] = useState<string | null>(null);

  // Block Freelancers from creating jobs
  if (userRole === 'freelancer') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <Card className="p-10 border border-purple-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-2xl text-white">Client-Only Feature</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Job creation is restricted to <strong>Clients (Employers)</strong>. You are currently in <strong>Freelancer Mode</strong>.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="sm" onClick={() => setUserRole('client')}>
              Switch to Client Mode
            </Button>
            <Link to="/projects">
              <Button variant="outline" size="sm">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleAIExtract = () => {
    if (!description.trim()) return;
    setIsExtractingAI(true);
    setTimeout(() => {
      setIsExtractingAI(false);
      const extracted = ['Solidity', 'Ethers.js v6', 'IPFS', 'Sepolia', 'TypeScript'];
      setSkills(Array.from(new Set([...skills, ...extracted])));
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const response = await api.post<{ success: boolean; cid: string }>('/projects', {
        clientWallet: walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa',
        title,
        description,
        budgetEth,
        deadlineDays: parseInt(deadlineDays, 10),
        skills,
      });

      setCreatedCid(response.data.cid);
    } catch (err: any) {
      console.error('Failed to post project:', err);
      alert('Error posting project to IPFS & API');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="text-center space-y-3">
        <Badge variant="purple" icon={<PlusCircle className="w-3.5 h-3.5" />}>
          Anonymous Client Job Posting
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
          Create & Post Project to IPFS
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Your project specification is uploaded to IPFS. The IPFS CID is registered on the Sepolia smart contract with escrow funding.
        </p>
      </div>

      {createdCid ? (
        <Card glow="emerald" className="p-8 text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-white">Project Published to IPFS!</h2>
            <p className="text-xs font-mono text-emerald-300">IPFS CID: {createdCid}</p>
            <p className="text-sm text-slate-300">
              Smart contract escrow initialized. Groq AI is indexing your job to match top anonymous talent.
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-4">
            <Button onClick={() => setCreatedCid(null)}>Post Another Job</Button>
          </div>
        </Card>
      ) : (
        <Card glow="purple">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Audit ERC-20 Escrow Contract & Build React 19 Frontend"
                className="w-full p-3.5 rounded-xl glass-card bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">Project Description & Requirements</label>
                <button
                  type="button"
                  onClick={handleAIExtract}
                  disabled={!description.trim() || isExtractingAI}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Bot className="w-4 h-4" />
                  {isExtractingAI ? 'Extracting with Groq AI...' : 'Auto-Extract Skills (AI)'}
                </button>
              </div>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the technical scope, deliverables, testing requirements, and architecture..."
                className="w-full p-3.5 rounded-xl glass-card bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Skills Tag Picker */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Required Skills & Technologies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type skill and press enter (e.g., Solidity, Zod, ethers.js)..."
                  className="flex-1 p-3 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <Button type="button" variant="secondary" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((s) => (
                  <Badge key={s} variant="purple" className="flex items-center gap-1.5">
                    <span>{s}</span>
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Budget & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Total Budget (ETH)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={budgetEth}
                    onChange={(e) => setBudgetEth(e.target.value)}
                    placeholder="e.g. 0.05"
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-card bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Deadline (Days)</label>
                <div className="relative">
                  <Clock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-card bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={isPosting} size="lg" className="w-full" leftIcon={<Upload className="w-5 h-5" />}>
              Generate IPFS CID & Deposit Escrow
            </Button>
          </form>
        </Card>
      )}

    </div>
  );
};
