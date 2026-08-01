import React from 'react';
import { ShieldCheck, Lock, Cpu, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#060910] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#060910] rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-lg text-white">
                BlindHire <span className="text-gradient-purple">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Decentralized, privacy-first freelancing powered by Sepolia smart contracts, IPFS, and Groq AI matching.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/projects" className="hover:text-purple-400 transition-colors">Browse Projects</Link></li>
              <li><Link to="/freelancers" className="hover:text-purple-400 transition-colors">Find Talent</Link></li>
              <li><Link to="/create-project" className="hover:text-purple-400 transition-colors">Post Job</Link></li>
              <li><Link to="/escrow" className="hover:text-purple-400 transition-colors">Escrow Protection</Link></li>
            </ul>
          </div>

          {/* Col 3: Privacy & Tech */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Security Stack
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Zero-Knowledge Identity
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Groq LLM Matcher
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Decentralized IPFS
              </li>
            </ul>
          </div>

          {/* Col 4: Network Status */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Network Status
            </h4>
            <div className="glass-card p-4 rounded-xl space-y-2 border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span>Smart Contract</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sepolia Testnet
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>AI Processing Engine</span>
                <span className="text-cyan-400 font-mono">Groq Llama 3</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Storage Relay</span>
                <span className="text-purple-400 font-mono">IPFS Decentralized</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} BlindHire AI. Production Decentralized Freelance Infrastructure.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500" /> for Web3 Privacy & Fair Hiring
          </p>
        </div>
      </div>
    </footer>
  );
};
