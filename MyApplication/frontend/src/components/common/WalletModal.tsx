import React, { useState } from 'react';
import { X, ShieldCheck, Wallet, ExternalLink, Loader2, LogOut, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Button } from './Button';
import { Badge } from './Badge';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { isConnected, walletAddress, balanceEth, isLoggingIn, error, userRole, login, setUserRole, logout, clearError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer'>('freelancer');

  if (!isOpen) return null;

  const handleConnect = async () => {
    await login(selectedRole);
    onClose();
  };

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md glass-card rounded-3xl p-6 border border-purple-500/30 shadow-glow-purple relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isConnected && walletAddress ? (
            
            <div className="space-y-6 text-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 mx-auto flex items-center justify-center font-mono font-bold text-xl text-white shadow-glow-purple">
                #{walletAddress.substring(2, 4)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Sepolia Connected
                  </Badge>
                  <Badge variant="purple">
                    Role: {userRole === 'client' ? 'Client (Employer)' : 'Freelancer (Talent)'}
                  </Badge>
                </div>
                <h3 className="font-mono font-bold text-lg text-white pt-1">{shortenAddress(walletAddress)}</h3>
                <p className="text-xs font-mono text-slate-400 break-all px-4">{walletAddress}</p>
              </div>

              
              <div className="p-3 rounded-2xl glass-card bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 block">Switch Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUserRole('client')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      userRole === 'client'
                        ? 'bg-purple-600 text-white shadow-glow-purple'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Client (Post Jobs)
                  </button>
                  <button
                    onClick={() => setUserRole('freelancer')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      userRole === 'freelancer'
                        ? 'bg-cyan-600 text-white shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Freelancer (Apply)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl glass-card bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">ETH Balance</span>
                <span className="font-heading font-extrabold text-lg text-emerald-400">{balanceEth} ETH</span>
              </div>

              <Button
                variant="danger"
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                Disconnect Session
              </Button>
            </div>
          ) : (
            
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white">Connect & Choose Role</h3>
                <p className="text-xs text-slate-400">
                  Select your role to customize your anonymous marketplace workspace.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={clearError} className="hover:text-white font-bold">×</button>
                </div>
              )}

              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white block">1. I am using BlindHire AI as:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('client')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedRole === 'client'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-glow-purple'
                        : 'glass-card border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 text-purple-400 mb-1" />
                    <h4 className="font-bold text-xs">Client / Employer</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Post jobs & hire talent</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('freelancer')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedRole === 'freelancer'
                        ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-glow-cyan'
                        : 'glass-card border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-cyan-400 mb-1" />
                    <h4 className="font-bold text-xs">Freelancer / Talent</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Browse jobs & apply</p>
                  </button>
                </div>
              </div>

              
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">2. Connect Web3 Wallet:</label>
                
                <button
                  onClick={handleConnect}
                  disabled={isLoggingIn}
                  className="w-full p-4 rounded-2xl glass-card bg-black/40 hover:bg-purple-600/15 border border-white/10 hover:border-purple-500/50 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦊</span>
                    <div className="text-left">
                      <h4 className="font-heading font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        MetaMask
                      </h4>
                      <p className="text-[11px] text-slate-400">Sign Nonce as {selectedRole === 'client' ? 'Client' : 'Freelancer'}</p>
                    </div>
                  </div>
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> : <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />}
                </button>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
