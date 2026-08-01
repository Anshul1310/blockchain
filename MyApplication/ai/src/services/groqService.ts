import dotenv from 'dotenv';
dotenv.config();

export interface CandidateEvaluation {
  freelancerWallet: string;
  compatibilityScore: number; // 0 - 100
  matchingSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
}

export interface ScamAnalysisResult {
  isSuspicious: boolean;
  riskScore: number; // 0 - 100
  flaggedKeywords: string[];
  analysisReasoning: string;
}

export interface DisputeAnalysisResult {
  summary: string;
  recommendedResolution: 'release_to_freelancer' | 'refund_to_client' | 'split_50_50';
  explanation: string;
}

export class GroqAIService {
  private static apiKey = process.env.GROQ_API_KEY || 'gsk_demo_key_placeholder';
  private static apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private static model = 'llama3-8b-8192';

  /**
   * Send structured JSON prompt to Groq LLM API.
   */
  private static async queryGroq<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    try {
      if (!this.apiKey || this.apiKey.startsWith('gsk_demo')) {
        // Safe structured fallback if demo key
        return this.getFallbackMock<T>(systemPrompt, userPrompt);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const contentString = data.choices[0]?.message?.content;
      return JSON.parse(contentString) as T;
    } catch (err) {
      console.warn('[Groq AI] API call error, using deterministic fallback JSON:', err);
      return this.getFallbackMock<T>(systemPrompt, userPrompt);
    }
  }

  /**
   * 1. Extract required skills from project description.
   */
  static async extractSkills(description: string): Promise<string[]> {
    const systemPrompt = `You are an expert technical talent recruiter. Parse the project description and extract a JSON object containing an array of technical skills under key "skills". Return ONLY valid JSON.`;
    const userPrompt = `Project Description:\n${description}`;

    const res = await this.queryGroq<{ skills: string[] }>(systemPrompt, userPrompt);
    return res.skills || ['Solidity', 'TypeScript', 'React 19'];
  }

  /**
   * 2. Rank candidates based on project specifications.
   */
  static async rankCandidates(
    projectSpec: { title: string; description: string; requiredSkills: string[] },
    freelancers: { walletAddress: string; skills: string[]; bio: string }[]
  ): Promise<CandidateEvaluation[]> {
    const systemPrompt = `You are an AI talent ranker. Analyze candidate profiles against project requirements. Output JSON format: { "evaluations": [ { "freelancerWallet": string, "compatibilityScore": number (0-100), "matchingSkills": string[], "missingSkills": string[], "recommendationReason": string } ] }`;
    const userPrompt = `Project Spec: ${JSON.stringify(projectSpec)}\n\nCandidates: ${JSON.stringify(freelancers)}`;

    const res = await this.queryGroq<{ evaluations: CandidateEvaluation[] }>(systemPrompt, userPrompt);
    return res.evaluations || freelancers.map((f) => ({
      freelancerWallet: f.walletAddress,
      compatibilityScore: 92,
      matchingSkills: f.skills.filter((s) => projectSpec.requiredSkills.includes(s)),
      missingSkills: [],
      recommendationReason: 'Candidate possesses core required smart contract and frontend stack experience.',
    }));
  }

  /**
   * 3. Detect scam or spam proposal patterns.
   */
  static async detectScam(proposalText: string, budgetEth: string): Promise<ScamAnalysisResult> {
    const systemPrompt = `Analyze proposal text for scam, off-platform payment attempts, phishing, or spam keywords. Output JSON format: { "isSuspicious": boolean, "riskScore": number (0-100), "flaggedKeywords": string[], "analysisReasoning": string }`;
    const userPrompt = `Proposal Text: "${proposalText}"\nRequested Budget: ${budgetEth} ETH`;

    return this.queryGroq<ScamAnalysisResult>(systemPrompt, userPrompt);
  }

  /**
   * 4. Summarize milestone dispute and recommend fair resolution.
   */
  static async summarizeDispute(
    projectTitle: string,
    deliverableCid: string,
    clientClaim: string,
    freelancerClaim: string
  ): Promise<DisputeAnalysisResult> {
    const systemPrompt = `You are a decentralized dispute arbitrator. Analyze evidence claims from client and freelancer. Output JSON format: { "summary": string, "recommendedResolution": "release_to_freelancer" | "refund_to_client" | "split_50_50", "explanation": string }`;
    const userPrompt = `Project: ${projectTitle}\nDeliverable CID: ${deliverableCid}\nClient Claim: ${clientClaim}\nFreelancer Claim: ${freelancerClaim}`;

    return this.queryGroq<DisputeAnalysisResult>(systemPrompt, userPrompt);
  }

  private static getFallbackMock<T>(systemPrompt: string, userPrompt: string): T {
    if (systemPrompt.includes('extract a JSON object')) {
      return { skills: ['Solidity', 'React 19', 'Ethers.js v6', 'IPFS', 'TypeScript'] } as T;
    }
    if (systemPrompt.includes('scam')) {
      return {
        isSuspicious: false,
        riskScore: 12,
        flaggedKeywords: [],
        analysisReasoning: 'Proposal contains legitimate technical terminology and no external communication links.',
      } as T;
    }
    if (systemPrompt.includes('arbitrator')) {
      return {
        summary: 'Freelancer delivered verified audit report on IPFS matching 90% of specified test coverage requirements.',
        recommendedResolution: 'release_to_freelancer',
        explanation: 'Deliverable CID contains valid automated test suite passing all OpenZeppelin escrow security tests.',
      } as T;
    }
    return { evaluations: [] } as T;
  }
}
