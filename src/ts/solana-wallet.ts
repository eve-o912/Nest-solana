// Nest - Solana Wallet Module
// Handles all Solana blockchain interactions

// Type declarations for CDN-loaded libraries
type SolanaWeb3 = typeof import('@solana/web3.js');
type SplToken = typeof import('@solana/spl-token');

// Extend Window interface
declare global {
  interface Window {
    solanaWeb3: SolanaWeb3;
    splToken: SplToken;
  }
}

export interface WalletConnection {
  provider: any;
  publicKey: any;
  connected: boolean;
}

export class SolanaWallet {
  private connection: any;
  private walletProvider: any = null;
  private walletPublicKey: any = null;
  private readonly NETWORK = 'mainnet-beta';
  private readonly RPC_URL = 'https://api.mainnet-beta.solana.com';

  constructor() {
    this.connection = new window.solanaWeb3.Connection(this.RPC_URL, 'confirmed');
  }

  // Initialize wallet from window globals
  async connectPhantom(): Promise<WalletConnection | null> {
    try {
      const provider = (window as any).phantom?.solana;
      if (!provider) {
        throw new Error('Phantom wallet not installed');
      }
      
      const resp = await provider.connect();
      this.walletPublicKey = resp.publicKey;
      this.walletProvider = provider;
      
      return {
        provider: this.walletProvider,
        publicKey: this.walletPublicKey,
        connected: true
      };
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      return null;
    }
  }

  async connectSolflare(): Promise<WalletConnection | null> {
    try {
      const provider = (window as any).solflare;
      if (!provider) {
        throw new Error('Solflare wallet not installed');
      }
      
      await provider.connect();
      this.walletPublicKey = provider.publicKey;
      this.walletProvider = provider;
      
      return {
        provider: this.walletProvider,
        publicKey: this.walletPublicKey,
        connected: true
      };
    } catch (error: any) {
      console.error('Solflare connection error:', error);
      return null;
    }
  }

  async getBalance(): Promise<number> {
    if (!this.walletPublicKey) return 0;
    try {
      const balance = await this.connection.getBalance(this.walletPublicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }

  async getTokenAccounts(): Promise<any[]> {
    if (!this.walletPublicKey) return [];
    try {
      const accounts = await this.connection.getParsedTokenAccountsByOwner(
        this.walletPublicKey,
        { programId: window.splToken.TOKEN_PROGRAM_ID }
      );
      return accounts.value;
    } catch (error) {
      console.error('Token accounts fetch error:', error);
      return [];
    }
  }

  getPublicKey(): string {
    return this.walletPublicKey?.toString() || '';
  }

  getShortAddress(): string {
    const addr = this.getPublicKey();
    if (!addr) return '';
    return addr.slice(0, 4) + '...' + addr.slice(-4);
  }

  isConnected(): boolean {
    return !!this.walletPublicKey;
  }

  getConnection(): any {
    return this.connection;
  }

  getNetwork(): string {
    return this.NETWORK;
  }
}

// Singleton instance
export const solanaWallet = new SolanaWallet();
