import { IPFSService } from '../services/ipfsService.js';
// Memory stores
const liveProjects = [];
const liveProposals = [];
const liveMessages = [];
export class ProjectController {
    /**
     * GET /api/projects
     */
    static getProjects(req, res) {
        return res.json({ projects: liveProjects });
    }
    /**
     * POST /api/projects
     */
    static async createProject(req, res) {
        try {
            const projectPayload = req.body;
            const cid = await IPFSService.uploadJSON(projectPayload);
            const newProject = {
                id: `proj-${Date.now()}`,
                clientWallet: (projectPayload.clientWallet || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa').toLowerCase(),
                title: projectPayload.title || 'Untitled Project',
                description: projectPayload.description || '',
                budgetEth: projectPayload.budgetEth || '0.05',
                deadlineDays: projectPayload.deadlineDays || 14,
                requiredSkills: projectPayload.skills || [],
                projectCid: cid,
                createdAt: Date.now(),
                status: 'open',
            };
            liveProjects.unshift(newProject);
            return res.json({ success: true, project: newProject, cid });
        }
        catch (err) {
            console.error('Create Project Error:', err);
            return res.status(500).json({ error: 'Failed to record project' });
        }
    }
    /**
     * POST /api/proposals
     */
    static async submitProposal(req, res) {
        try {
            const proposalPayload = req.body;
            const cid = await IPFSService.uploadJSON(proposalPayload);
            const freelancerWallet = (proposalPayload.freelancerWallet || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa').toLowerCase();
            const newProposal = {
                id: `prop-${Date.now()}`,
                projectId: proposalPayload.projectId,
                freelancerWallet,
                coverLetter: proposalPayload.coverLetter,
                requestedEth: proposalPayload.requestedBudgetEth || '0.05',
                estimatedDays: proposalPayload.estimatedDays || 7,
                proposalCid: cid,
                status: 'submitted',
                createdAt: Date.now(),
            };
            liveProposals.unshift(newProposal);
            return res.json({ success: true, proposal: newProposal, cid });
        }
        catch (err) {
            console.error('Submit Proposal Error:', err);
            return res.status(500).json({ error: 'Failed to submit proposal' });
        }
    }
    /**
     * GET /api/proposals
     * Query proposals by freelancer or projectId
     */
    static getProposals(req, res) {
        const { freelancer, projectId } = req.query;
        let result = [...liveProposals];
        if (freelancer) {
            const target = freelancer.toLowerCase();
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
    static getProjectProposals(req, res) {
        const { id } = req.params;
        const projectProposals = liveProposals.filter((p) => p.projectId === id);
        return res.json({ proposals: projectProposals });
    }
    /**
     * POST /api/proposals/:id/accept
     */
    static acceptProposal(req, res) {
        const { id } = req.params;
        const proposal = liveProposals.find((p) => p.id === id);
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }
        proposal.status = 'accepted';
        const project = liveProjects.find((p) => p.id === proposal.projectId);
        if (project) {
            project.status = 'in_progress';
            project.assignedFreelancer = proposal.freelancerWallet;
        }
        return res.json({
            success: true,
            proposal,
            message: `Proposal accepted! Order booked with freelancer ${proposal.freelancerWallet}`,
        });
    }
    /**
     * POST /api/messages
     * Store encrypted chat message between sender and recipient
     */
    static async sendMessage(req, res) {
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
            liveMessages.push(msg);
            return res.json({ success: true, message: msg });
        }
        catch (err) {
            console.error('Send Message Error:', err);
            return res.status(500).json({ error: 'Failed to record chat message' });
        }
    }
    /**
     * GET /api/messages
     * Fetch chat history between two wallet addresses
     */
    static getMessages(req, res) {
        const { wallet1, wallet2 } = req.query;
        if (!wallet1) {
            return res.json({ messages: liveMessages });
        }
        const w1 = wallet1.toLowerCase();
        const w2 = wallet2 ? wallet2.toLowerCase() : null;
        const chatHistory = liveMessages.filter((m) => {
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
    static resetAllData(req, res) {
        liveProjects.length = 0;
        liveProposals.length = 0;
        liveMessages.length = 0;
        return res.json({
            success: true,
            message: 'All projects, proposals, chat history, and memory stores purged.',
            timestamp: new Date().toISOString(),
        });
    }
}
