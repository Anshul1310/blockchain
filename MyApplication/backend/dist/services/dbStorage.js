export class DatabaseStorage {
    static data = {
        projects: [],
        proposals: [],
        messages: [],
        escrows: [],
    };
    /**
     * Initialize in-memory store (No file storage)
     */
    static init() {
        console.log(`[DatabaseStorage] Pure In-Memory Store Initialized (No local file storage).`);
    }
    /**
     * No-op save (No file storage on disk)
     */
    static save() {
        // Pure in-memory mode: no disk file operations
    }
    // Getters
    static getProjects() {
        return DatabaseStorage.data.projects;
    }
    static getProposals() {
        return DatabaseStorage.data.proposals;
    }
    static getMessages() {
        return DatabaseStorage.data.messages;
    }
    static getEscrows() {
        return DatabaseStorage.data.escrows;
    }
    // Mutators
    static addProject(project) {
        DatabaseStorage.data.projects.unshift(project);
    }
    static addProposal(proposal) {
        DatabaseStorage.data.proposals.unshift(proposal);
    }
    static addMessage(message) {
        DatabaseStorage.data.messages.push(message);
    }
    static addEscrow(escrow) {
        DatabaseStorage.data.escrows.unshift(escrow);
    }
    static updateProposalStatus(proposalId, status) {
        const p = DatabaseStorage.data.proposals.find((item) => item.id === proposalId);
        if (p) {
            p.status = status;
        }
    }
    static updateProjectStatus(projectId, status, assignedFreelancer) {
        const proj = DatabaseStorage.data.projects.find((item) => item.id === projectId);
        if (proj) {
            proj.status = status;
            if (assignedFreelancer)
                proj.assignedFreelancer = assignedFreelancer;
        }
    }
    static purge() {
        DatabaseStorage.data = {
            projects: [],
            proposals: [],
            messages: [],
            escrows: [],
        };
    }
}
