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
  private connection: any = null;
  private walletProvider: any = null;
  private walletPublicKey: any = null;
  private readonly NETWORK = 'mainnet-beta';
  private readonly RPC_URL = 'https://api.mainnet-beta.solana.com';

  private getConnection(): any {
    if (!this.connection) {
      if (!window.solanaWeb3) {
        throw new Error('Solana Web3 library not loaded');
      }
      this.connection = new window.solanaWeb3.Connection(this.RPC_URL, 'confirmed');
    }
    return this.connection;
  }

  // Initialize wallet from window globals
  async connectPhantom(): Promise<WalletConnection | null> {
    try {
      const provider = (window as any).phantom?.solana;
      if (!provider) {
        alert('Phantom wallet not found. Please install Phantom from phantom.app');
        throw new Error('Phantom wallet not installed');
      }
      
      // Check if already connected
      if (provider.isConnected) {
        this.walletPublicKey = provider.publicKey;
        this.walletProvider = provider;
        return {
          provider: this.walletProvider,
          publicKey: this.walletPublicKey,
          connected: true
        };
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
      if (error.code === 4001) {
        alert('Connection rejected. Please approve the connection in Phantom.');
      } else {
        alert('Failed to connect Phantom: ' + error.message);
      }
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
      const conn = this.getConnection();
      const balance = await conn.getBalance(this.walletPublicKey);
      return balance / 1e9;
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }

  async getTokenAccounts(): Promise<any[]> {
    if (!this.walletPublicKey) return [];
    try {
      const conn = this.getConnection();
      const accounts = await conn.getParsedTokenAccountsByOwner(
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

  getSolanaConnection(): any {
    return this.getConnection();
  }

  getNetwork(): string {
    return this.NETWORK;
  }
}

// Singleton instance
export const solanaWallet = new SolanaWallet();
