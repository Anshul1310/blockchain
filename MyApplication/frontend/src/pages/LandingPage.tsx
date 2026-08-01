import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Bot, Cpu, Lock, Sparkles, ArrowRight, CheckCircle2, Zap, DollarSign, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

interface LandingPageProps {
  onConnectWallet: () => void;
  isConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, isConnected }) => {
  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 max-w-7xl mx-auto text-center">
        {/* Glow Spheres */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[400px] bg-purple-600/25 blur-[160px] rounded-full animate-pulse-glow" />
          <div className="w-[450px] h-[350px] bg-cyan-500/20 blur-[140px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/40 text-purple-300 text-xs font-semibold mb-8 shadow-glow-purple"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Decentralized • Zero-Knowledge • Groq AI-Matched Marketplace</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.1]"
        >
          Hire Pure Skill. <br />
          <span className="text-gradient-purple">Zero Bias. Zero Exposure.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed"
        >
          BlindHire AI connects clients with elite developers strictly evaluated on verified code portfolios, IPFS artifacts, and Groq LLM matching. Identity is revealed only if both parties agree on-chain.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isConnected ? (
            <Link to="/projects">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Open Projects
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={onConnectWallet} leftIcon={<Zap className="w-5 h-5" />}>
              Connect Wallet & Sign Nonce
            </Button>
          )}

          <Link to="/create-project">
            <Button variant="outline" size="lg">
              Post Anonymous Job
            </Button>
          </Link>
        </motion.div>

        {/* Live AI Match Demo Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto text-left"
        >
          <Card className="border border-purple-500/40 shadow-glow-purple relative overflow-hidden bg-[#0C121E]/90">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">Groq Llama 3 Candidate Ranker</span>
              </div>
              <Badge variant="cyan" icon={<Bot className="w-3.5 h-3.5" />}>AI Verified Match</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-purple-400">Sepolia Escrow Listing #0x8ae...67c</span>
                <h3 className="font-heading font-bold text-xl text-white">Solidity Smart Contract Auditor for Escrow Protocol</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Budget: <span className="text-emerald-400 font-semibold font-mono">1.8 ETH</span> • Deadline: 14 Days
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="purple">Solidity</Badge>
                  <Badge variant="cyan">React 19</Badge>
                  <Badge variant="emerald">Ethers.js v6</Badge>
                  <Badge variant="amber">IPFS</Badge>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 bg-black/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Candidate Compatibility</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">98% Match Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-glow-purple">
                    #10
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Anon Developer #0x10...DDa</h4>
                    <p className="text-xs text-slate-400">Verified IPFS Portfolio • 5.0 ⭐ Reputation</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic border-l-2 border-purple-500 pl-2">
                  "AI Analysis: Candidate has audited 20+ OpenZeppelin escrow contracts & verified reentrancy test cases."
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white">
            Built for the <span className="text-gradient-cyan">Privacy Economy</span>
          </h2>
          <p className="text-slate-400 mt-3 text-base">Zero-knowledge matching, instant Sepolia escrows, and end-to-end encryption.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverable glow="purple" className="space-y-4 p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-glow-purple">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">Zero-Knowledge Identity</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No names, genders, photos, or locations. Hiring decisions are strictly based on verified skill matrices and IPFS portfolio CIDs.
            </p>
          </Card>

          <Card hoverable glow="cyan" className="space-y-4 p-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">Groq AI Engine</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our Llama 3 AI parses project descriptions, ranks candidate proposals, flags scam patterns, and summarizes dispute claims.
            </p>
          </Card>

          <Card hoverable glow="emerald" className="space-y-4 p-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">Sepolia Milestone Escrow</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Clients lock ETH in non-custodial smart contracts (`BlindHireEscrow.sol`). Funds are released only upon milestone verification.
            </p>
          </Card>
        </div>
      </section>

    </div>
  );
};
