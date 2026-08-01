interface DatabaseSchema {
  projects: any[];
  proposals: any[];
  messages: any[];
  escrows: any[];
}

export class DatabaseStorage {
  private static data: DatabaseSchema = {
    projects: [],
    proposals: [],
    messages: [],
    escrows: [],
  };

  


  static init() {
    console.log(`[DatabaseStorage] Pure In-Memory Store Initialized (No local file storage).`);
  }

  


  static save() {
    
  }

  
  static getProjects(): any[] {
    return DatabaseStorage.data.projects;
  }

  static getProposals(): any[] {
    return DatabaseStorage.data.proposals;
  }

  static getMessages(): any[] {
    return DatabaseStorage.data.messages;
  }

  static getEscrows(): any[] {
    return DatabaseStorage.data.escrows;
  }

  
  static addProject(project: any) {
    DatabaseStorage.data.projects.unshift(project);
  }

  static addProposal(proposal: any) {
    DatabaseStorage.data.proposals.unshift(proposal);
  }

  static addMessage(message: any) {
    DatabaseStorage.data.messages.push(message);
  }

  static addEscrow(escrow: any) {
    DatabaseStorage.data.escrows.unshift(escrow);
  }

  static updateProposalStatus(proposalId: string, status: string) {
    const p = DatabaseStorage.data.proposals.find((item) => item.id === proposalId);
    if (p) {
      p.status = status;
    }
  }

  static updateProjectStatus(projectId: string, status: string, assignedFreelancer?: string) {
    const proj = DatabaseStorage.data.projects.find((item) => item.id === projectId);
    if (proj) {
      proj.status = status;
      if (assignedFreelancer) proj.assignedFreelancer = assignedFreelancer;
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
