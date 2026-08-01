import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Wallet, Bot, PlusCircle, MessageSquare, LayoutDashboard, Search, Menu, X, UserCheck, Briefcase, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { WalletModal } from '../common/WalletModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { walletAddress, isConnected, userRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Role-based navigation item filtering
  const navItems = userRole === 'client'
    ? [
        { label: 'My Listed Jobs', path: '/dashboard', icon: FileText },
        { label: 'Post Job', path: '/create-project', icon: PlusCircle },
        { label: 'Find Talent', path: '/freelancers', icon: Bot },
        { label: 'Messages', path: '/messages', icon: MessageSquare },
      ]
    : [
        { label: 'Browse Jobs', path: '/projects', icon: Search },
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Messages', path: '/messages', icon: MessageSquare },
      ];

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-b border-white/10 bg-[#090D16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  BlindHire <span className="text-gradient-purple">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  {userRole === 'client' ? 'Client Workspace' : 'Freelancer Workspace'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Actions & Role Pill */}
            <div className="hidden sm:flex items-center gap-3">
              {isConnected && walletAddress ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl glass-card border border-purple-500/30 hover:border-purple-400 flex items-center gap-2.5 transition-all"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {shortenAddress(walletAddress)} ({userRole === 'client' ? 'Client' : 'Freelancer'})
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-glow-purple hover:shadow-glow-cyan transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#090D16]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <Icon className="w-5 h-5 text-purple-400" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-white/10">
                {isConnected && walletAddress ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl text-center font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
                  >
                    Disconnect ({shortenAddress(walletAddress)})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setWalletModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-glow-purple flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Wallet Modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
