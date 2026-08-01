import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Bot, ArrowRight, ShieldCheck, Sparkles, Clock, DollarSign, PlusCircle, Inbox, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProjectItem } from '../types';

export const HomePage: React.FC = () => {
  const { walletAddress, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const popularSkills = ['All', 'Solidity', 'React 19', 'IPFS', 'TypeScript', 'Node.js', 'Groq LLM', 'Foundry'];

  useEffect(() => {
    const fetchFeedData = async () => {
      setIsLoading(true);
      try {
        
        const response = await api.get<{ projects: ProjectItem[] }>('/projects');
        setProjects(response.data.projects || []);

        
        if (walletAddress) {
          const propRes = await api.get<{ proposals: any[] }>(`/proposals?freelancer=${walletAddress}`);
          const ids = new Set((propRes.data.proposals || []).map((p: any) => p.projectId));
          setAppliedProjectIds(ids);
        }
      } catch (err) {
        console.error('Failed to fetch projects feed:', err);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedData();
  }, [walletAddress]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = selectedSkill === 'All' || project.requiredSkills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10 py-8">
      
      
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-background-card to-cyan-950/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-glow-purple">
        <div className="space-y-4 max-w-2xl text-left">
          <Badge variant="cyan" icon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Recommendation Feed
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            Anonymous Opportunities <br />
            <span className="text-gradient-purple">Matched to Your Verified Skills</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            No identity disclosure required. Apply with your verified IPFS portfolio and let Groq Llama 3 rank your fit on-chain.
          </p>
        </div>
        {userRole === 'client' && (
          <Link to="/create-project" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" leftIcon={<PlusCircle className="w-5 h-5" />}>
              Post Anonymous Job
            </Button>
          </Link>
        )}
      </div>

      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, technology, or project title..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-card border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
        </div>

        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {popularSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedSkill === skill
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-glow-purple scale-105'
                  : 'glass-card text-slate-400 hover:text-white hover:border-purple-500/40'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> Live Job Opportunities
          </h2>
          <span className="text-xs font-mono text-slate-400">{filteredProjects.length} Active Listings</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="glass-card p-6 rounded-2xl animate-pulse h-36" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-xl text-white">No Projects Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No job listings posted yet. Be the first client to publish an anonymous project!
              </p>
            </div>
            {userRole === 'client' && (
              <div className="pt-2">
                <Link to="/create-project">
                  <Button leftIcon={<PlusCircle className="w-4 h-4" />}>Post First Project</Button>
                </Link>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => {
              const hasApplied = appliedProjectIds.has(project.id);
              return (
                <Card key={project.id} hoverable glow="purple" className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="cyan" icon={<Bot className="w-3.5 h-3.5" />}>
                        Status: {project.status.toUpperCase()}
                      </Badge>

                      
                      {hasApplied && (
                        <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                          ✓ Proposal Submitted
                        </Badge>
                      )}

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> {project.deadlineDays} Days Deadline
                      </span>
                    </div>

                    <Link to={`/projects/${project.id}`}>
                      <h3 className="font-heading font-bold text-xl text-white hover:text-purple-400 transition-colors">
                        {project.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {project.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="slate">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block">Escrow Locked</span>
                      <span className="font-heading font-extrabold text-2xl text-emerald-400 flex items-center gap-1">
                        <DollarSign className="w-5 h-5" /> {project.budgetEth}
                      </span>
                    </div>

                    <Link to={`/projects/${project.id}`}>
                      <Button
                        variant={hasApplied ? 'secondary' : 'primary'}
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        {hasApplied ? 'View My Proposal' : 'View & Apply'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
