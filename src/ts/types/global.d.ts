// Type declarations for global Solana libraries loaded via CDN

declare global {
  interface Window {
    solanaWeb3: typeof import('@solana/web3.js');
    splToken: typeof import('@solana/spl-token');
    phantom?: {
      solana: {
        connect(): Promise<{ publicKey: { toString(): string } }>;
        disconnect(): Promise<void>;
      };
    };
    solflare?: {
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      publicKey: { toString(): string };
    };
  }
}

// Make this a module
export {};
