import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Wallet, Bot, PlusCircle, MessageSquare, LayoutDashboard, Search, Menu, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { WalletModal } from '../common/WalletModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { walletAddress, isConnected, userRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

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

  const hasSession = isConnected && Boolean(walletAddress);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0F172A]/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 p-0.5 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <div className="w-full h-full bg-[#0F172A] rounded-[9px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  BlindHire <span className="text-gradient-green">AI</span>
                </span>
                {hasSession && (
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-semibold">
                    {userRole === 'client' ? 'Client Workspace' : 'Freelancer Workspace'}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation Links (ONLY VISIBLE WHEN CONNECTED / LOGGED IN) */}
            {hasSession && (
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
                          ? 'text-white font-semibold bg-slate-800/80'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Wallet Action Button */}
            <div className="hidden sm:flex items-center gap-3">
              {hasSession ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 flex items-center gap-2.5 transition-all text-xs font-mono text-white"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{shortenAddress(walletAddress!)}</span>
                  </button>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-rose-500/50 transition-colors text-xs font-medium"
                    title="Disconnect Wallet"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-800 bg-[#0F172A] px-4 pt-3 pb-6 space-y-3"
            >
              {hasSession && navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-slate-800">
                {!hasSession ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setWalletModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-sm border border-rose-500/20"
                  >
                    Disconnect ({shortenAddress(walletAddress!)})
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Wallet Login Role Modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
