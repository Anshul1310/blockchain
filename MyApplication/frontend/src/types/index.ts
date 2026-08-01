export type UserRole = 'client' | 'freelance' | 'both';

export interface ExperienceItem {
  companyRole: string;
  durationYears: number;
  summary: string;
  technologiesUsed: string[];
}

export interface PortfolioItem {
  title: string;
  description: string;
  projectUrl?: string;
  ipfsHash?: string;
  tags: string[];
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

export interface UserProfile {
  walletAddress: string;
  username: string;
  bio: string;
  skills: string[];
  experience: ExperienceItem[];
  portfolio: PortfolioItem[];
  certifications: CertificationItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  completedProjectsCount: number;
  ratingsAverage: number;
  profileCid?: string;
  identityRevealed?: boolean;
}

export interface ProjectMilestone {
  id: string;
  description: string;
  amountEth: string;
  isCompleted: boolean;
  isApproved: boolean;
  deliverableCid?: string;
}

export type ProjectStatus = 'open' | 'assigned' | 'in_progress' | 'disputed' | 'completed' | 'cancelled';

export interface ProjectItem {
  id: string;
  clientWallet: string;
  title: string;
  description: string;
  budgetEth: string;
  deadlineDays: number;
  requiredSkills: string[];
  attachmentCids: string[];
  status: ProjectStatus;
  createdAt: number;
  projectCid: string;
  selectedFreelancer?: string;
  escrowId?: string;
  milestones: ProjectMilestone[];
}

export interface ProposalItem {
  id: string;
  projectId: string;
  freelancerWallet: string;
  coverLetter: string;
  estimatedDays: number;
  requestedBudgetEth: string;
  proposalCid: string;
  submittedAt: number;
  status: 'pending' | 'accepted' | 'rejected';
  aiScore?: number;
  aiReasoning?: string;
}

export interface AIMatchResult {
  freelancerWallet: string;
  compatibilityScore: number; 
  keyMatchingSkills: string[];
  gapSkills: string[];
  recommendationReason: string;
}

export interface AIScamReport {
  isSuspicious: boolean;
  riskScore: number; 
  flaggedKeywords: string[];
  analysisReasoning: string;
}

export interface AIDisputeSummary {
  summary: string;
  recommendedResolution: 'release_to_freelancer' | 'refund_to_client' | 'split_50_50';
  explanation: string;
}

export interface EncryptedMessagePayload {
  id: string;
  projectId: string;
  senderWallet: string;
  receiverWallet: string;
  encryptedCid: string;
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balanceEth: string;
  jwtToken: string | null;
}
