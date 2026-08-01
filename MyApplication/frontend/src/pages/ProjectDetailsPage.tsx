import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, DollarSign, Send, CheckCircle2, ArrowLeft, Info, Loader2, Inbox, MessageSquare, Check, UserCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IPFSClient } from '../services/ipfsClient';
import { ProjectItem } from '../types';

interface ApplicantProposal {
  id: string;
  projectId: string;
  freelancerWallet: string;
  coverLetter: string;
  requestedEth: string;
  estimatedDays: number;
  proposalCid: string;
  status: 'submitted' | 'accepted' | 'rejected';
  createdAt: number;
}

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { walletAddress, userRole } = useAuth();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [proposals, setProposals] = useState<ApplicantProposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Proposal Submission State for Freelancers
  const [coverLetter, setCoverLetter] = useState('');
  const [requestedEth, setRequestedEth] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Hiring / Booking State for Clients
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null);
  const [isHiring, setIsHiring] = useState(false);

  const fetchProjectAndProposals = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Project
      const projRes = await api.get<{ projects: ProjectItem[] }>('/projects');
      const found = projRes.data.projects?.find((p) => p.id === id);
      if (found) {
        setProject(found);
        setRequestedEth(found.budgetEth || '0.02');
      }

      // 2. Fetch Applicants/Proposals for this project
      const propRes = await api.get<{ proposals: ApplicantProposal[] }>(`/projects/${id}/proposals`);
      setProposals(propRes.data.proposals || []);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndProposals();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmitting(true);
    try {
      const payload = {
        projectId: project.id,
        freelancerWallet: walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa',
        coverLetter,
        requestedBudgetEth: requestedEth,
        estimatedDays: parseInt(estimatedDays, 10),
      };

      const response = await api.post<{ success: boolean; proposal: ApplicantProposal; cid: string }>('/proposals', payload);
      setProposalSubmitted(true);
      
      // Refresh applicants list
      fetchProjectAndProposals();
    } catch (err: any) {
      console.error('Proposal submission failed:', err);
      alert('Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAndBookOrder = async (proposalId: string, freelancerWallet: string) => {
    setIsHiring(true);
    try {
      await api.post(`/proposals/${proposalId}/accept`);
      setAcceptedProposalId(proposalId);
      alert(`Order Booked! Proposal accepted with Freelancer ${freelancerWallet}. Escrow order initialized.`);
      fetchProjectAndProposals();
    } catch (err) {
      console.error('Failed to accept proposal:', err);
      alert('Error accepting proposal');
    } finally {
      setIsHiring(false);
    }
  };

  const handleStartChat = (freelancerWallet: string) => {
    navigate(`/messages?recipient=${freelancerWallet}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto" />
        <p className="text-sm font-mono text-slate-400">Loading project specification and applicant proposals...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects Feed
        </Link>
        <Card className="p-12 text-center space-y-4 max-w-xl mx-auto border border-white/10">
          <Inbox className="w-12 h-12 text-purple-400 mx-auto" />
          <h2 className="font-heading font-bold text-2xl text-white">Project Not Found</h2>
          <p className="text-sm text-slate-400">The project specification with ID {id} was not found.</p>
        </Card>
      </div>
    );
  }

  const isClient = userRole === 'client' || walletAddress === project.clientWallet;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Overview & Applicants */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-6">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">Status: {(project.status || 'open').toUpperCase()}</Badge>
                <span className="text-xs font-mono text-slate-400">ID: {project.id}</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {project.title}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Client: {project.clientWallet} • IPFS CID: {project.projectCid}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading font-bold text-lg text-white">Project Scope & Deliverables</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-lg text-white">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="purple" size="md">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* CLIENT VIEW: Applicants List */}
          {isClient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" /> Applicants & Proposals ({proposals.length})
                </h3>
              </div>

              {proposals.length === 0 ? (
                <Card className="p-8 text-center space-y-3 border border-white/10">
                  <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="font-bold text-white text-base">No Proposals Submitted Yet</h4>
                  <p className="text-xs text-slate-400">
                    Freelancers looking for work will review your job specification and submit IPFS proposals here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <Card key={prop.id} glow="purple" className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              Freelancer: {prop.freelancerWallet}
                            </span>
                            <Badge variant={prop.status === 'accepted' ? 'emerald' : 'purple'}>
                              {prop.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-slate-400">Proposal IPFS CID: {prop.proposalCid}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Quote</span>
                          <span className="font-mono font-bold text-emerald-400 text-lg">{prop.requestedEth} ETH</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-300">Cover Letter / Proposal Pitch:</span>
                        <p className="text-xs text-slate-200 glass-card bg-black/40 p-3 rounded-xl leading-relaxed whitespace-pre-line">
                          {prop.coverLetter}
                        </p>
                      </div>

                      {/* Action Buttons for Client */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<MessageSquare className="w-4 h-4 text-purple-400" />}
                          onClick={() => handleStartChat(prop.freelancerWallet)}
                        >
                          Chat with Applicant
                        </Button>

                        {prop.status === 'accepted' ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                            <Check className="w-4 h-4" /> Order Booked & Escrow Active
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            isLoading={isHiring}
                            leftIcon={<DollarSign className="w-4 h-4" />}
                            onClick={() => handleAcceptAndBookOrder(prop.id, prop.freelancerWallet)}
                          >
                            Book Order & Lock Escrow
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Apply Form (FREELANCER VIEW ONLY) */}
        <div className="space-y-6">
          <Card glow="purple" className="space-y-6">
            <div className="space-y-1 text-center border-b border-white/10 pb-4">
              <span className="text-xs text-slate-400">Escrow Budget</span>
              <div className="text-3xl font-heading font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                <DollarSign className="w-6 h-6" /> {project.budgetEth}
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {project.deadlineDays} Days Delivery
              </span>
            </div>

            {isClient ? (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-2">
                <p className="text-xs font-semibold text-purple-300">Client Management Mode</p>
                <p className="text-[11px] text-slate-400">
                  Review applicant proposals on the left, initiate encrypted discussions, and accept proposals to book orders.
                </p>
              </div>
            ) : proposalSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-white">Proposal Uploaded to IPFS</h4>
                <p className="text-xs text-slate-300">
                  Your proposal has been submitted to the client. The client can now chat with you and book the escrow order!
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <h3 className="font-heading font-semibold text-base text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" /> Submit Proposal
                </h3>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Applying is <strong>100% free</strong>! The client will review your proposal and can start a direct chat to hire you.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Cover Letter / Skill Pitch</label>
                  <textarea
                    required
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe your relevant skills and experience for this job..."
                    className="w-full p-3 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Est. Days</label>
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Requested ETH (Quote)</label>
                    <input
                      type="text"
                      value={requestedEth}
                      onChange={(e) => setRequestedEth(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Upload Proposal CID to IPFS
                </Button>
              </form>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
