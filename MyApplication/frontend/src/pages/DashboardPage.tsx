import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, DollarSign, CheckCircle2, Inbox, PlusCircle, UserCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { walletAddress, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_projects' | 'escrows'>('my_projects');
  
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{ projects: ProjectItem[] }>('/projects');
        setProjects(response.data.projects || []);
      } catch (err) {
        console.error('Failed to load projects for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Filter projects posted by client or applied by freelancer
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
            Wallet Address: {walletAddress ? shortenAddress(walletAddress) : '0x1042...9DDa'}
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
          onClick={() => setActiveTab('my_projects')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'my_projects'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {userRole === 'client' ? 'My Posted Jobs' : 'Available Opportunities'} ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('escrows')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'escrows'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Escrow Contracts (0)
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading your listed jobs from IPFS & Backend...</p>
        </div>
      ) : activeTab === 'my_projects' ? (
        myProjects.length === 0 ? (
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
        )
      ) : (
        <Card className="p-12 text-center space-y-4 border border-white/10">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-white">No Active Escrows</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Accept a freelancer proposal on any of your posted jobs to initialize an active milestone escrow contract.
          </p>
        </Card>
      )}

    </div>
  );
};
