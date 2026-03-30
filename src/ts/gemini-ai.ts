// Nest - Gemini AI Module
// Handles all Google Gemini AI integrations

export interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: string;
}

export class GeminiAI {
  private apiKey: string = '';
  private readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private demoMode: boolean = true;

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey(): void {
    this.apiKey = localStorage.getItem('geminiApiKey') || '';
    this.demoMode = !this.apiKey || this.apiKey.length < 20;
  }

  setApiKey(key: string): boolean {
    if (key && key.length >= 20) {
      this.apiKey = key;
      localStorage.setItem('geminiApiKey', key);
      this.demoMode = false;
      return true;
    }
    return false;
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  // Demo responses for when no API key is set
  private getDemoResponse(): string {
    const responses = [
      "Based on your M-Pesa and bank transaction history, your payment consistency score is 94%. This strong pattern indicates reliable income streams and improves your creditworthiness.",
      "Your credit utilization is at 23%, which is excellent. Keeping it below 30% positively impacts your Nest Credit Score and shows lenders you're not over-reliant on credit.",
      "Gemini detected: Your gig income from Uber has been consistent for 6 months. This alternative income stream adds 15 points to your credit score - traditional bureaus would miss this entirely.",
      "I've analyzed your cash flow patterns. You maintain positive balances 95% of the time. This stability signals low credit risk to potential lenders in the marketplace.",
      "Your credit score improved 12 points this month. The main driver was connecting your Equity Bank account, which added transaction diversity to your credit profile.",
      "Looking at your data, you could qualify for up to $8,000 in unsecured credit from Marinade Finance at 10% APR. Your reputation score of 742 puts you in their 'Preferred' tier.",
      "Your ZK-proof credit signal has been verified 47 times by lenders this month. Your privacy remains intact - they verified your score without seeing your raw transaction data."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get AI response (real API or demo)
  async generateResponse(userMessage: string, walletAddress?: string): Promise<string> {
    if (this.demoMode) {
      // Simulate API delay for demo mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      return this.getDemoResponse();
    }

    try {
      const context = walletAddress 
        ? `You are a credit advisor for Nest, a decentralized credit reputation protocol on Solana. The user's wallet ${walletAddress} has a Nest Credit Score based on their real-world financial behavior (mobile money, bank accounts, gig work). Provide helpful, encouraging advice about creditworthiness, lending opportunities, and financial reputation. User asks: ${userMessage}`
        : `You are a credit advisor for Nest, a decentralized credit reputation protocol. User asks: ${userMessage}`;

      const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: context }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm analyzing your data. Please try again.";
    } catch (error: any) {
      console.error('Gemini API error:', error);
      return `Error: ${error.message}. Falling back to demo mode.`;
    }
  }

  // Generate default insights for dashboard
  getDefaultInsights(): AIInsight[] {
    return [
      {
        id: '1',
        type: 'success',
        title: 'Credit Score Boost',
        description: 'Connecting your Uber driver income increased your score by 15 points. Gig work verification adds credibility traditional bureaus miss.',
        action: 'View Details →'
      },
      {
        id: '2',
        type: 'info',
        title: 'ZK-Proof Verification',
        description: '3 lenders verified your creditworthiness this week using zero-knowledge proofs. Your raw data stayed private.',
        action: 'View Proof Log →'
      },
      {
        id: '3',
        type: 'success',
        title: 'Pre-approved Credit Available',
        description: 'Marinade Finance has pre-approved you for $8,000 at 10% APR based on your 742 Nest Credit Score.',
        action: 'View Offer →'
      }
    ];
  }
}

// Singleton instance
export const geminiAI = new GeminiAI();
