import React, { useState } from 'react';
import { X, ShieldCheck, Upload, CheckCircle2, User, Code, Plus, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useContract } from '../../hooks/useContract';
import { IPFSClient } from '../../services/ipfsClient';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { walletAddress } = useAuth();
  const { registerProfileCID } = useContract();

  const [username, setUsername] = useState('Anon-Engineer');
  const [bio, setBio] = useState('Full-stack Web3 developer specializing in smart contract security and React 19 dApps.');
  const [skills, setSkills] = useState<string[]>(['Solidity', 'React 19', 'TypeScript', 'IPFS']);
  const [newSkill, setNewSkill] = useState('');
  const [registerOnChain, setRegisterOnChain] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [savedCid, setSavedCid] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    setIsSaving(true);
    try {
      const profileJSON = {
        walletAddress,
        username,
        bio,
        skills,
        experience: [{ companyRole: 'Senior Web3 Auditor', durationYears: 3, summary: 'Security auditing', technologiesUsed: skills }],
        completedProjects: 0,
        ratings: 5.0,
        createdAt: Date.now(),
      };

      // 1. Pin Profile JSON to IPFS (100% Free, 0 ETH)
      const cid = await IPFSClient.uploadJSON(profileJSON);
      setSavedCid(cid);

      // 2. Register Profile CID on Sepolia Smart Contract ONLY if user checked the option
      if (registerOnChain) {
        await registerProfileCID(cid);
      }

      alert(`Profile IPFS CID generated: ${cid}${registerOnChain ? ' & Registered on Sepolia Smart Contract!' : ''}`);
      onClose();
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl glass-card rounded-3xl p-6 border border-purple-500/30 shadow-glow-purple relative my-8"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">Create Anonymous Profile</h3>
                <p className="text-xs text-slate-400">Profile JSON is stored on IPFS (100% Free, 0 ETH required).</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Creating a profile is <strong>100% FREE (0 ETH)</strong>. Your profile data is stored on decentralized IPFS.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Anonymous Handle / Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Bio & Skill Summary (No PII)</label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Skills Editor */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Verified Skills Matrix</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill (e.g. Solidity, Foundry)..."
                    className="flex-1 p-2.5 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <Badge key={s} variant="purple" size="sm" className="flex items-center gap-1">
                      <span>{s}</span>
                      <button type="button" onClick={() => setSkills(skills.filter((k) => k !== s))}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Optional On-Chain Checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="checkbox"
                  id="registerOnChain"
                  checked={registerOnChain}
                  onChange={(e) => setRegisterOnChain(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="registerOnChain" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Also register CID reference on Sepolia Smart Contract (Requires tiny testnet gas fee)
                </label>
              </div>

              <Button type="submit" isLoading={isSaving} className="w-full" leftIcon={<Upload className="w-4 h-4" />}>
                Save Anonymous Profile (Free IPFS Pin)
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
