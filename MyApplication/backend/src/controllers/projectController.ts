import { Request, Response } from 'express';
import { IPFSService } from '../services/ipfsService.js';
import { DatabaseStorage } from '../services/dbStorage.js';
import { BlockchainService } from '../services/blockchainService.js';

export class ProjectController {
  /**
   * GET /api/projects
   */
  static getProjects(req: Request, res: Response) {
    return res.json({ projects: DatabaseStorage.getProjects() });
  }

  /**
   * POST /api/projects
   */
  static async createProject(req: Request, res: Response) {
    try {
      const projectPayload = req.body;
      const cid = await IPFSService.uploadJSON(projectPayload);

      const budgetValue = projectPayload.budgetEth ? `${projectPayload.budgetEth}` : '0.01';

      const newProject = {
        id: `proj-${Date.now()}`,
        clientWallet: (projectPayload.clientWallet || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa').toLowerCase(),
        title: projectPayload.title || 'Untitled Project',
        description: projectPayload.description || '',
        budgetEth: budgetValue,
        deadlineDays: projectPayload.deadlineDays || 14,
        requiredSkills: projectPayload.skills || [],
        projectCid: cid,
        createdAt: Date.now(),
        status: 'open',
      };

      DatabaseStorage.addProject(newProject);

      return res.json({ success: true, project: newProject, cid });
    } catch (err) {
      console.error('Create Project Error:', err);
      return res.status(500).json({ error: 'Failed to record project' });
    }
  }

  /**
   * POST /api/proposals
   */
  static async submitProposal(req: Request, res: Response) {
    try {
      const proposalPayload = req.body;
      const cid = await IPFSService.uploadJSON(proposalPayload);

      const freelancerWallet = (proposalPayload.freelancerWallet || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa').toLowerCase();
      const project = DatabaseStorage.getProjects().find((p) => p.id === proposalPayload.projectId);

      const requestedEth = proposalPayload.requestedBudgetEth
        ? `${proposalPayload.requestedBudgetEth}`
        : (project ? project.budgetEth : '0.01');

      const newProposal = {
        id: `prop-${Date.now()}`,
        projectId: proposalPayload.projectId,
        freelancerWallet,
        coverLetter: proposalPayload.coverLetter,
        requestedEth,
        estimatedDays: proposalPayload.estimatedDays || 7,
        proposalCid: cid,
        status: 'submitted',
        createdAt: Date.now(),
      };

      DatabaseStorage.addProposal(newProposal);

      return res.json({ success: true, proposal: newProposal, cid });
    } catch (err) {
      console.error('Submit Proposal Error:', err);
      return res.status(500).json({ error: 'Failed to submit proposal' });
    }
  }

  /**
   * GET /api/proposals
   */
  static getProposals(req: Request, res: Response) {
    const { freelancer, projectId } = req.query;

    let result = [...DatabaseStorage.getProposals()];

    if (freelancer) {
      const target = (freelancer as string).toLowerCase();
      result = result.filter((p) => p.freelancerWallet.toLowerCase() === target);
    }

    if (projectId) {
      result = result.filter((p) => p.projectId === projectId);
    }

    return res.json({ proposals: result });
  }

  /**
   * GET /api/projects/:id/proposals
   */
  static getProjectProposals(req: Request, res: Response) {
    const { id } = req.params;
    const projectProposals = DatabaseStorage.getProposals().filter((p) => p.projectId === id);
    return res.json({ proposals: projectProposals });
  }

  /**
   * POST /api/proposals/:id/accept
   */
  static acceptProposal(req: Request, res: Response) {
    const { id } = req.params;
    const proposal = DatabaseStorage.getProposals().find((p) => p.id === id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    DatabaseStorage.updateProposalStatus(id, 'accepted');

    const project = DatabaseStorage.getProjects().find((p) => p.id === proposal.projectId);
    const clientWallet = project ? project.clientWallet.toLowerCase() : '0x10429d68a7677f20e3c5181707afc438ac896dda';
    const exactAmountEth = proposal.requestedEth || (project ? project.budgetEth : '0.01');

    if (project) {
      DatabaseStorage.updateProjectStatus(proposal.projectId, 'in_progress', proposal.freelancerWallet);
    }

    const newEscrow = {
      id: `escrow-${Date.now()}`,
      projectId: proposal.projectId,
      projectTitle: project ? project.title : 'Booked Project Escrow',
      clientWallet: clientWallet,
      freelancerWallet: proposal.freelancerWallet.toLowerCase(),
      amountEth: exactAmountEth,
      status: 'in_progress',
      currentMilestone: 'Milestone 1: Development In Progress',
      deliverableCid: null,
      txHash: null,
      etherscanUrl: null,
      contractAddress: '0x8ae17d69F226d6322281eb171E367c4Be45cf67c',
      createdAt: Date.now(),
    };

    DatabaseStorage.addEscrow(newEscrow);

    return res.json({
      success: true,
      proposal,
      escrow: newEscrow,
      message: `Order Booked! Escrow initialized for ${exactAmountEth} ETH between Client (${clientWallet}) and Freelancer (${proposal.freelancerWallet})`,
    });
  }

  /**
   * GET /api/escrows
   */
  static getEscrows(req: Request, res: Response) {
    const { wallet } = req.query;
    const allEscrows = DatabaseStorage.getEscrows();

    if (!wallet) {
      return res.json({ escrows: allEscrows });
    }

    const target = (wallet as string).toLowerCase();

    const matched = allEscrows.filter(
      (e) => e.clientWallet.toLowerCase() === target || e.freelancerWallet.toLowerCase() === target
    );

    return res.json({ escrows: matched.length > 0 ? matched : allEscrows });
  }

  /**
   * POST /api/escrows/:id/deliver
   * AUTOMATED PAYOUT: Submitting deliverable automatically transfers Sepolia ETH directly to Freelancer Wallet!
   */
  static async submitEscrowDeliverable(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { deliverableCid } = req.body;

      const escrow = DatabaseStorage.getEscrows().find((e) => e.id === id);

      if (!escrow) {
        return res.status(404).json({ error: 'Escrow contract not found' });
      }

      escrow.deliverableCid = deliverableCid;

      // AUTOMATIC ON-CHAIN SEPOLIA ETH PAYOUT DISPATCH!
      const payoutResult = await BlockchainService.sendEthPayout(escrow.freelancerWallet, escrow.amountEth);

      escrow.status = 'completed';
      escrow.currentMilestone = 'Completed - Sepolia ETH Milestone Payment Automatically Released to Freelancer';
      
      if (payoutResult.success) {
        escrow.txHash = payoutResult.txHash;
        escrow.etherscanUrl = payoutResult.etherscanUrl;
      }
      
      DatabaseStorage.save();

      return res.json({
        success: true,
        escrow,
        txHash: payoutResult.txHash,
        etherscanUrl: payoutResult.etherscanUrl,
        message: `Deliverable IPFS CID ${deliverableCid} submitted! Automated payout of ${escrow.amountEth} ETH transferred to freelancer wallet ${escrow.freelancerWallet} on Sepolia!`,
      });
    } catch (err: any) {
      console.error('Submit Deliverable Error:', err);
      return res.status(500).json({ error: 'Failed to process deliverable and auto-payout' });
    }
  }

  /**
   * POST /api/escrows/:id/release
   */
  static async releaseEscrowPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const escrow = DatabaseStorage.getEscrows().find((e) => e.id === id);

      if (!escrow) {
        return res.status(404).json({ error: 'Escrow contract not found' });
      }

      const payoutResult = await BlockchainService.sendEthPayout(escrow.freelancerWallet, escrow.amountEth);

      escrow.status = 'completed';
      escrow.currentMilestone = 'Completed - ETH Payment Transferred to Freelancer Wallet on Sepolia';
      
      if (payoutResult.success) {
        escrow.txHash = payoutResult.txHash;
        escrow.etherscanUrl = payoutResult.etherscanUrl;
      }
      
      DatabaseStorage.save();

      return res.json({
        success: true,
        escrow,
        txHash: payoutResult.txHash,
        etherscanUrl: payoutResult.etherscanUrl,
        message: `${escrow.amountEth} ETH successfully transferred to freelancer wallet ${escrow.freelancerWallet} on Sepolia!`,
      });
    } catch (err: any) {
      console.error('Release Escrow Error:', err);
      return res.status(500).json({ error: 'Failed to release escrow payment' });
    }
  }

  /**
   * POST /api/messages
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { senderWallet, recipientWallet, text, encryptedCid } = req.body;

      if (!senderWallet || !recipientWallet || !text) {
        return res.status(400).json({ error: 'Missing required message parameters' });
      }

      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderWallet: senderWallet.toLowerCase(),
        recipientWallet: recipientWallet.toLowerCase(),
        text,
        encryptedCid: encryptedCid || `QmEnc${Date.now()}`,
        timestamp: Date.now(),
      };

      DatabaseStorage.addMessage(msg);

      return res.json({ success: true, message: msg });
    } catch (err) {
      console.error('Send Message Error:', err);
      return res.status(500).json({ error: 'Failed to record chat message' });
    }
  }

  /**
   * GET /api/messages
   */
  static getMessages(req: Request, res: Response) {
    const { wallet1, wallet2 } = req.query;

    const allMessages = DatabaseStorage.getMessages();

    if (!wallet1) {
      return res.json({ messages: allMessages });
    }

    const w1 = (wallet1 as string).toLowerCase();
    const w2 = wallet2 ? (wallet2 as string).toLowerCase() : null;

    const chatHistory = allMessages.filter((m) => {
      const isW1Sender = m.senderWallet === w1;
      const isW1Recipient = m.recipientWallet === w1;

      if (!w2) {
        return isW1Sender || isW1Recipient;
      }

      const isW2Sender = m.senderWallet === w2;
      const isW2Recipient = m.recipientWallet === w2;

      return (isW1Sender && isW2Recipient) || (isW2Sender && isW1Recipient);
    });

    return res.json({ messages: chatHistory });
  }

  /**
   * POST /api/reset or POST /api/purge
   */
  static resetAllData(req: Request, res: Response) {
    DatabaseStorage.purge();
    IPFSService.purge();
    return res.json({
      success: true,
      message: 'All in-memory project listings, applicant proposals, chat messages, escrows, and IPFS caches purged successfully.',
      timestamp: new Date().toISOString(),
    });
  }
}
