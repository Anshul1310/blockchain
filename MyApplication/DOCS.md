# 🛡️ BlindHire AI — Comprehensive System Architecture & Technical Documentation

Welcome to the complete technical documentation for **BlindHire AI**, a production-ready, privacy-first, decentralized freelancing marketplace.

---

## 📋 Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [High-Level Architecture Diagram](#2-high-level-architecture-diagram)
3. [Technology Stack Matrix](#3-technology-stack-matrix)
4. [Subsystem Breakdown](#4-subsystem-breakdown)
   - [A. Smart Contract Layer (`/contracts`)](#a-smart-contract-layer-contracts)
   - [B. Decentralized IPFS Storage Layer](#b-decentralized-ipfs-storage-layer)
   - [C. Web3 Authentication Engine](#c-web3-authentication-engine)
   - [D. Groq AI Matching & Arbitration Engine (`/ai`)](#d-groq-ai-matching--arbitration-engine-ai)
   - [E. E2E Encrypted WebSocket Relay Server (`/backend`)](#e-e2e-encrypted-websocket-relay-server-backend)
   - [F. React 19 Frontend DApp (`/frontend`)](#f-react-19-frontend-dapp-frontend)
5. [End-to-End Workflows & Data Lifecycle](#5-end-to-end-workflows--data-lifecycle)
6. [Security & Zero-Knowledge Guarantees](#6-security--zero-knowledge-guarantees)
7. [Local Setup & Deployment Guide](#7-local-setup--deployment-guide)

---

## 1. Executive Summary & Core Philosophy

Traditional freelancing platforms enforce heavy Personally Identifiable Information (PII) collection—photos, names, locations, genders—which introduces subconscious hiring bias and centralized privacy vulnerabilities.

**BlindHire AI** reimagines freelancing by enforcing **Zero-Knowledge Anonymous Hiring**:
- **Skills Over Identity**: Candidates are evaluated purely on verified portfolio IPFS CIDs, code quality, and past smart contract reputation.
- **On-Chain Escrows**: Clients deposit ETH directly into non-custodial Solidity smart contract vaults on Sepolia Testnet.
- **Privacy-Preserving AI**: Groq Llama 3 parses requirements, ranks talent, detects scam proposals, and summarizes disputes without processing PII.
- **Client-Side E2E Encryption**: Direct messaging is encrypted locally via AES-GCM 256-bit keys and relayed as IPFS CIDs over native WebSockets.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 REACT 19 FRONTEND                                 |
|   (Vite, TypeScript, Tailwind CSS, Ethers.js v6, Framer Motion, TanStack Query)   |
+----------------------------------------+------------------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+------------------+           +------------------+           +--------------------+
|  MetaMask / Web3 |           |   Node.js API    |           | Native WebSockets  |
|  Wallet Provider |           |  (Express, JWT)  |           |  (E2E CID Relay)   |
+--------+---------+           +--------+---------+           +---------+----------+
         |                              |                               |
         | Signature                    | Query                         | Encrypted
         | Auth                         | AI/IPFS                       | Message CIDs
         v                              v                               v
+------------------+           +------------------+           +--------------------+
|  Sepolia Escrow  |           | Groq LLM Engine  |           |   IPFS Network     |
| Smart Contract   |           | (Llama 3 JSON)   |           | (Profiles, Specs,  |
| (CIDs & ETH Vault|           | (Match/Scams)    |           |  Encrypted CIDs)   |
+------------------+           +------------------+           +--------------------+
```

---

## 3. Technology Stack Matrix

| Layer | Technologies Used | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router, Ethers.js v6, Framer Motion, Zod | UI Rendering, Web3 Provider connection, client-side AES-GCM encryption, Form validation |
| **Backend** | Node.js, Express.js, TypeScript, WebSockets (`ws`), JWT, Ethers.js, Helmet, Rate Limiter | Challenge Nonce issuing, signature verification, E2E WebSocket CID relaying |
| **Blockchain** | Solidity `0.8.24`, Hardhat, OpenZeppelin (`ReentrancyGuard`, `Ownable`), Sepolia Testnet | Non-custodial ETH milestone escrows, CID registry, reputation counters, dispute resolution |
| **AI Engine** | Groq API (`llama-3.3-70b-versatile` / `llama3-8b-8192`) | Skill extraction, candidate compatibility ranking, scam detection, dispute arbitration |
| **Storage** | IPFS (InterPlanetary File System) | Decentralized storage for JSON specs (Profiles, Projects, Proposals, Deliverables, Reviews) |

---

## 4. Subsystem Breakdown

### A. Smart Contract Layer (`/contracts`)
The **[`BlindHireEscrow.sol`](file:///c:/Users/hunti/OneDrive/Documents/GitHub/blockchain/MyApplication/contracts/contracts/BlindHireEscrow.sol)** contract enforces non-custodial milestone escrows:

- **State Storage**: Stores **ONLY** IPFS CIDs (`profileCID`, `projectCID`, `deliverableCID`, `reviewCID`), ETH amounts, milestone completion flags, and reputation counts.
- **Key Functions**:
  - `registerProfileCID(string profileCID)`: Updates caller's latest profile CID.
  - `createProject(string projectCID, uint256 deadlineDays, uint256[] milestoneAmountsWei)`: Locks total ETH deposit into vault.
  - `acceptFreelancer(uint256 projectId, address freelancer)`: Assigns candidate.
  - `uploadDeliverableCID(uint256 projectId, uint256 milestoneIndex, string deliverableCID)`: Freelancer registers deliverable proof.
  - `releaseMilestonePayment(uint256 projectId, uint256 milestoneIndex)`: Transfers milestone ETH to freelancer using Checks-Effects-Interactions pattern.
  - `cancelProject(uint256 projectId)`: Refunds unassigned project ETH to client.
  - `openDispute(uint256 projectId)` / `resolveDispute(...)`: Freezes escrow and enables governance resolution.

### B. Decentralized IPFS Storage Layer
No SQL or NoSQL databases are used. All documents are structured JSON pinned to IPFS via **[`ipfsService.ts`](file:///c:/Users/hunti/OneDrive/Documents/GitHub/blockchain/MyApplication/backend/src/services/ipfsService.ts)** & **[`ipfsClient.ts`](file:///c:/Users/hunti/OneDrive/Documents/GitHub/blockchain/MyApplication/frontend/src/services/ipfsClient.ts)**.

### C. Web3 Authentication Engine
Authentication is 100% wallet-based:
1. User connects MetaMask/WalletConnect.
2. GET `/api/auth/nonce?walletAddress=0x...` returns a unique 5-minute challenge string.
3. User signs the nonce in MetaMask (`signer.signMessage(nonce)`).
4. POST `/api/auth/verify` validates signature via `ethers.verifyMessage()` and issues a 24h JWT token.

### D. Groq AI Engine (`/ai`)
Located in **[`groqService.ts`](file:///c:/Users/hunti/OneDrive/Documents/GitHub/blockchain/MyApplication/ai/src/services/groqService.ts)**:
- **`extractSkills(description)`**: Parses job text into array of technology tags.
- **`rankCandidates(projectSpec, candidateProfiles[])`**: Evaluates portfolios and returns compatibility scores (0-100), key matching skills, skill gaps, and reasoning.
- **`detectScam(proposalText, budgetEth)`**: Analyzes proposal for off-platform payment attempts or phishing.
- **`summarizeDispute(...)`**: Analyzes deliverable CID specs & claim text to recommend fair escrow partitioning.

### E. E2E Encrypted WebSocket Relay (`/backend`)
Located in **[`relayServer.ts`](file:///c:/Users/hunti/OneDrive/Documents/GitHub/blockchain/MyApplication/backend/src/websocket/relayServer.ts)**:
- Messages are encrypted locally on client using Web Crypto API (`AES-GCM 256-bit`).
- Encrypted payload is pinned to IPFS -> returns `encryptedCid`.
- `encryptedCid` is sent over WebSocket (`ws://localhost:5000/ws`).
- Server relays `encryptedCid` strictly to target recipient's active WebSocket connection.
- Receiver downloads CID and decrypts payload locally. Server never reads plaintext.

### F. React 19 Frontend DApp (`/frontend`)
- Glassmorphic dark aesthetic (`#090D16` background, neon purple/cyan glows).
- 17 complete page routes covering Landing, Home, Project Feed, Details, Application Forms, Anonymous Profiles, Dashboard, Encrypted Chat, and Escrow Vault Manager.

---

## 5. End-to-End Workflows & Data Lifecycle

```
[Candidate]                                     [Client]
    |                                              |
    | 1. Create Profile -> IPFS JSON (QmProfile)  | 1. Post Job -> IPFS JSON (QmProject)
    | 2. Call contract.registerProfileCID()       | 2. Call contract.createProject() + Lock ETH
    |                                              |
    +-----------------------+----------------------+
                            |
                            v
                   [Groq AI Matcher]
    (Matches candidate skills to job requirements & ranks fit)
                            |
                            v
                     [Assignment]
          (Client calls contract.acceptFreelancer)
                            |
                            v
                    [Deliver & Pay]
    - Freelancer uploads QmDeliverable via contract.uploadDeliverableCID()
    - Client calls contract.releaseMilestonePayment() -> ETH transferred to Freelancer
```

---

## 6. Security & Zero-Knowledge Guarantees

1. **Reentrancy Protection**: All ETH transfer paths use OpenZeppelin `ReentrancyGuard` and Checks-Effects-Interactions state transitions.
2. **Replay Attack Prevention**: Nonces expire after 5 minutes and are deleted immediately upon consumption.
3. **HTTP & Express Security**: Helmet headers enabled, CORS restricted to trusted frontend origins, and Express Rate Limiting (200 req / 15 mins).
4. **Data Isolation**: No PII (names, photos, locations) stored anywhere.

---

## 7. Local Setup & Deployment Guide

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `v10.x`
- MetaMask browser extension installed

---

### Step 1: Install & Start Backend Service
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000 and ws://localhost:5000/ws
```

### Step 2: Start Frontend DApp
```bash
cd frontend
npm install
npm run dev
# Vite DApp running at http://localhost:3000
```

### Step 3: Deploy Smart Contract to Sepolia Testnet
```bash
cd contracts
npm install
npm run compile

# Add your Sepolia RPC and Private Key to contracts/.env
# SEPOLIA_RPC_URL=https://rpc.sepolia.org
# PRIVATE_KEY=0x...

npm run deploy:sepolia
```
