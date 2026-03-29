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
      "Based on your Solana transaction history, I recommend staking 30% of your idle SOL for passive yield. Marinade Finance offers liquid staking at ~6% APY.",
      "Your M-Pesa to Solana tokenization shows strong weekly inflows. Consider setting up automated USDC savings on Jupiter to hedge against volatility.",
      "I've analyzed your cash flow patterns. Your business typically receives 40% more payments on Fridays. Plan your inventory purchases accordingly.",
      "Your wallet currently holds 142.5 SOL and $250 USDC. The portfolio is 98% Solana-native. Diversification into other SPL tokens could reduce risk.",
      "Gemini detected: You have 3 recurring M-Pesa payments that could be automated via Solana Pay. This would save ~2 hours/week in manual processing.",
      "Looking at your on-chain data, you're spending 15% more on supplier payments this month. Consider negotiating bulk discounts or exploring Just-in-Time inventory.",
      "Your Solana USDC holdings could be earning 8-12% APY through lending protocols like Solend or marginfi. Would you like me to compare rates?"
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
        ? `You are a CFO assistant for a business using Solana blockchain. User wallet: ${walletAddress}. User asks: ${userMessage}`
        : `You are a CFO assistant for a business. User asks: ${userMessage}`;

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
        type: 'warning',
        title: 'Cash Flow Alert',
        description: 'Your M-Pesa till balance dropped 40% this week. Consider topping up for weekend sales.',
        action: 'Ask Gemini →'
      },
      {
        id: '2',
        type: 'success',
        title: 'Solana DeFi Opportunity',
        description: 'You have 50 SOL idle. Gemini suggests staking for ~6% APY on Marinade Finance.',
        action: 'Learn more →'
      },
      {
        id: '3',
        type: 'info',
        title: 'AI Forecast',
        description: 'Based on your on-chain and off-chain data, expect 12,400 USDC revenue next month (+18%).',
        action: 'View analysis →'
      }
    ];
  }
}

// Singleton instance
export const geminiAI = new GeminiAI();
