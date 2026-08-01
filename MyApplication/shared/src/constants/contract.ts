export const SEPOLIA_CHAIN_ID = 11155111;

export const SEPOLIA_CONTRACT_ADDRESS = '0x8ae17d69F226d6322281eb171E367c4Be45cf67c';

export const BLINDHIRE_ESCROW_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "profileCID", "type": "string" }
    ],
    "name": "ProfileCIDRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "projectCID", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "totalBudgetWei", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "deadlineTimestamp", "type": "uint256" }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" }
    ],
    "name": "FreelancerAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "milestoneIndex", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "deliverableCID", "type": "string" }
    ],
    "name": "DeliverableSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "milestoneIndex", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountWei", "type": "uint256" }
    ],
    "name": "MilestonePaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" }
    ],
    "name": "ProjectCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "initiator", "type": "address" }
    ],
    "name": "DisputeOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "releasedToFreelancerWei", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "refundedToClientWei", "type": "uint256" }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "profileCID", "type": "string" }
    ],
    "name": "registerProfileCID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "projectCID", "type": "string" },
      { "internalType": "uint256", "name": "deadlineDays", "type": "uint256" },
      { "internalType": "uint256[]", "name": "milestoneAmountsWei", "type": "uint256[]" }
    ],
    "name": "createProject",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "freelancer", "type": "address" }
    ],
    "name": "acceptFreelancer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "uint256", "name": "milestoneIndex", "type": "uint256" },
      { "internalType": "string", "name": "deliverableCID", "type": "string" }
    ],
    "name": "uploadDeliverableCID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "uint256", "name": "milestoneIndex", "type": "uint256" }
    ],
    "name": "releaseMilestonePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" }
    ],
    "name": "cancelProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" }
    ],
    "name": "openDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "uint256", "name": "releaseToFreelancerWei", "type": "uint256" },
      { "internalType": "uint256", "name": "refundToClientWei", "type": "uint256" }
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
