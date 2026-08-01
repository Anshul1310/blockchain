import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, DollarSign, CheckCircle2, Inbox, PlusCircle, UserCheck, ArrowRight, Loader2, FileCode } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectItem } from '../types';

interface EscrowContract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientWallet: string;
  freelancerWallet: string;
  amountEth: string;
  status: string;
  currentMilestone: string;
  contractAddress: string;
  createdAt: number;
}

export const DashboardPage: React.FC = () => {
  const { walletAddress, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_projects' | 'escrows'>('escrows');
  
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentWallet = walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa';

      // 1. Fetch Projects
      const projRes = await api.get<{ projects: ProjectItem[] }>('/projects');
      setProjects(projRes.data.projects || []);

      // 2. Fetch Escrow Contracts for active wallet
      const escrowRes = await api.get<{ escrows: EscrowContract[] }>(`/escrows?wallet=${currentWallet}`);
      setEscrows(escrowRes.data.escrows || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [walletAddress]);

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const myProjects = projects.filter((p) => {
    if (userRole === 'client') {
      return !walletAddress || p.clientWallet?.toLowerCase() === walletAddress?.toLowerCase() || true;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="purple" className="mb-2">
            Workspace: {userRole === 'client' ? 'Client (Employer)' : 'Freelancer (Talent)'}
          </Badge>
          <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 font-mono">
            Connected Wallet: {walletAddress ? shortenAddress(walletAddress) : '0x1042...9DDa'}
          </p>
        </div>
        {userRole === 'client' && (
          <Link to="/create-project">
            <Button leftIcon={<PlusCircle className="w-4 h-4" />}>Post New Job</Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-4">
        <button
          onClick={() => setActiveTab('escrows')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'escrows'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Escrow Contracts ({escrows.length})
        </button>
        <button
          onClick={() => setActiveTab('my_projects')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'my_projects'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {userRole === 'client' ? 'My Posted Jobs' : 'Available Opportunities'} ({myProjects.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading escrow contracts and listed jobs...</p>
        </div>
      ) : activeTab === 'escrows' ? (
        escrows.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border border-white/10">
            <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="font-heading font-bold text-xl text-white">No Active Escrow Contracts</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {userRole === 'client'
                ? 'Accept a freelancer proposal on any of your posted jobs to book the order and initialize an active milestone escrow contract.'
                : 'Submit proposals on available jobs. Once the client accepts your quote, your booked escrow order will appear here.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {escrows.map((e) => (
              <Card key={e.id} glow="purple" className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                        Status: {(e.status || 'in_progress').toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">Escrow ID: {e.id}</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-white">{e.projectTitle}</h3>
                    <p className="text-xs font-mono text-slate-400">
                      Client: {shortenAddress(e.clientWallet)} • Freelancer: {shortenAddress(e.freelancerWallet)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Locked Escrow Budget</span>
                    <span className="font-heading font-extrabold text-2xl text-emerald-400">{e.amountEth} ETH</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="text-xs text-slate-300 font-mono">
                    Active Step: <span className="text-cyan-300 font-semibold">{e.currentMilestone}</span>
                  </div>

                  <Link to="/escrow">
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Manage Deliverables & Releases
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : myProjects.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border border-white/10">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-white">
            {userRole === 'client' ? 'No Jobs Posted Yet' : 'No Opportunities Available'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {userRole === 'client'
              ? 'Click "Post New Job" to pin your job description to IPFS and lock escrow funding.'
              : 'Browse available projects to submit anonymous proposals.'}
          </p>
          {userRole === 'client' && (
            <Link to="/create-project">
              <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>Post First Job</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myProjects.map((project) => (
            <Card key={project.id} glow="purple" className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">Status: {(project.status || 'open').toUpperCase()}</Badge>
                  <span className="text-xs font-mono text-slate-400">ID: {project.id}</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-white">{project.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.requiredSkills?.map((skill) => (
                    <Badge key={skill} variant="slate" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-400 block">Escrow Budget</span>
                  <span className="font-mono font-bold text-emerald-400 text-xl">{project.budgetEth} ETH</span>
                </div>

                <Link to={`/projects/${project.id}`}>
                  <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Applicants & Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
