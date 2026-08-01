import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Bot, Lock, Code2, ArrowRight, Zap, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface LandingPageProps {
  onConnectWallet: () => void;
  isConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, isConnected }) => {
  return (
    <div className="space-y-24 py-12 px-4 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-8">
        
        {/* Network Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-emerald-500/30 text-xs font-mono text-emerald-400"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live on Sepolia Testnet • IPFS Pinata Ready
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto"
        >
          DeCentralized <span className="text-gradient-green">Blind Hiring</span> & Escrow Marketplace
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed"
        >
          Connect clients with developers strictly evaluated on verified code portfolios, IPFS artifacts, and smart contract escrow.
        </motion.p>

        {/* Single Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center"
        >
          {isConnected ? (
            <Link to="/home">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Enter Workspace
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={onConnectWallet} leftIcon={<Zap className="w-5 h-5" />}>
              Connect Wallet & Login
            </Button>
          )}
        </motion.div>

        {/* Live AI Match Demo Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto text-left"
        >
          <Card glow="emerald" className="p-6 relative overflow-hidden bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">BlindHire Protocol Escrow #0x8ae...67c</span>
              </div>
              <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>Non-Custodial Escrow</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-emerald-400">Active Job Listing</span>
                <h3 className="font-heading font-bold text-xl text-white">Smart Contract Auditor for Escrow Protocol</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Locked Budget: <span className="text-emerald-400 font-semibold font-mono">0.05 ETH</span> • Deadline: 14 Days
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="emerald">Solidity</Badge>
                  <Badge variant="cyan">React 19</Badge>
                  <Badge variant="cyan">Ethers.js v6</Badge>
                  <Badge variant="slate">IPFS</Badge>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 bg-black/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Proposal Compatibility</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">Verified Match</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                    #10
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">Candidate Wallet</span>
                    <span className="text-sm font-semibold text-white font-mono">0x1042...9DDa</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </section>

    </div>
  );
};
