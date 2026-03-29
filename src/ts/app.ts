// Nest - Main Application Entry Point
// Orchestrates all modules and initializes the app

import { solanaWallet } from './solana-wallet.js';
import { geminiAI } from './gemini-ai.js';
import { UIUtils } from './ui-utils.js';

// Chart instances
let cashFlowChart: any;
let portfolioChart: any;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  UIUtils.init();
  UIUtils.injectAnimationStyles();
  setupEventListeners();
  
  // Show welcome toast
  setTimeout(() => {
    UIUtils.showToast('info', 'Welcome to Nest', 'Solana-powered AI CFO for your business');
  }, 1000);
});

// Event listener setup
function setupEventListeners(): void {
  // Chart filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleChartFilterClick);
  });

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', handleSidebarClick);
  });

  // Transaction search
  const txSearch = document.getElementById('txSearch');
  txSearch?.addEventListener('input', (e) => {
    searchTransactions((e.target as HTMLInputElement).value);
  });
}

// Chart filter handler
function handleChartFilterClick(this: HTMLElement): void {
  const parent = this.parentElement;
  parent?.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  this.classList.add('active');

  // Update chart data
  if (cashFlowChart) {
    cashFlowChart.data.datasets.forEach((ds: any) => {
      ds.data = ds.data.map((v: number) => v * (0.8 + Math.random() * 0.4));
    });
    cashFlowChart.update();
  }
}

// Sidebar click handler
function handleSidebarClick(this: HTMLElement): void {
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.remove('active');
  });
  this.classList.add('active');
  
  const tab = this.getAttribute('data-tab');
  if (tab) {
    UIUtils.showToast('info', 'Navigation', `Switched to ${tab}`);
  }
}

// Transaction search
function searchTransactions(query: string): void {
  const rows = document.querySelectorAll('.tx-row');
  const lowerQuery = query.toLowerCase();
  
  rows.forEach(row => {
    const text = row.textContent?.toLowerCase() || '';
    (row as HTMLElement).style.display = text.includes(lowerQuery) ? 'grid' : 'none';
  });
}

// Onboarding step navigation
let currentStep = 1;
const selectedAccounts: string[] = [];

export function nextStep(step: number): void {
  // Validation
  if (step === 2) {
    if (!solanaWallet.isConnected()) {
      UIUtils.showToast('error', 'Wallet Required', 'Please connect your Solana wallet');
      return;
    }
  }
  
  if (step === 3) {
    const bizName = (document.getElementById('bizName') as HTMLInputElement)?.value;
    const bizType = (document.getElementById('bizType') as HTMLSelectElement)?.value;
    if (!bizName || !bizType) {
      UIUtils.showToast('error', 'Required', 'Please fill business details');
      return;
    }
  }
  
  if (step === 4) {
    updateReviewData();
  }
  
  // Hide all steps, show target
  document.querySelectorAll('.onboarding-step').forEach(s => {
    s.classList.add('hidden');
  });
  
  const targetStep = document.getElementById(`step${step}`);
  targetStep?.classList.remove('hidden');
  currentStep = step;
}

export function prevStep(step: number): void {
  document.querySelectorAll('.onboarding-step').forEach(s => {
    s.classList.add('hidden');
  });
  
  const targetStep = document.getElementById(`step${step}`);
  targetStep?.classList.remove('hidden');
  currentStep = step;
}

// Toggle account type selection
export function toggleAccountType(card: HTMLElement, type: string): void {
  card.classList.toggle('selected');
  const detailsDiv = document.getElementById(`${type}Details`);
  
  if (card.classList.contains('selected')) {
    detailsDiv?.classList.remove('hidden');
    if (!selectedAccounts.includes(type)) {
      selectedAccounts.push(type);
    }
  } else {
    detailsDiv?.classList.add('hidden');
    const index = selectedAccounts.indexOf(type);
    if (index > -1) {
      selectedAccounts.splice(index, 1);
    }
  }
}

// Update review data
function updateReviewData(): void {
  const bizName = (document.getElementById('bizName') as HTMLInputElement)?.value;
  const bizType = (document.getElementById('bizType') as HTMLSelectElement)?.value;
  
  const reviewBizName = document.getElementById('reviewBizName');
  const reviewBizType = document.getElementById('reviewBizType');
  const reviewWallet = document.getElementById('reviewWallet');
  
  if (reviewBizName) reviewBizName.textContent = bizName || 'Not provided';
  if (reviewBizType) reviewBizType.textContent = bizType || 'Not selected';
  if (reviewWallet) {
    reviewWallet.textContent = solanaWallet.getShortAddress() || 'Not connected';
  }
}

// Complete onboarding
export function completeOnboarding(): void {
  const bizName = (document.getElementById('bizName') as HTMLInputElement)?.value || 'My Business';
  
  // Update dashboard
  const dashAvatar = document.getElementById('dashAvatar');
  const dashBizName = document.getElementById('dashBizName');
  const dashBizType = document.getElementById('dashBizType');
  
  if (dashAvatar) dashAvatar.textContent = bizName.charAt(0).toUpperCase();
  if (dashBizName) dashBizName.textContent = bizName;
  if (dashBizType) {
    dashBizType.textContent = (document.getElementById('bizType') as HTMLSelectElement)?.value || 'Business';
  }
  
  // Update wallet display
  const dashWalletAddr = document.getElementById('dashWalletAddr');
  if (dashWalletAddr) {
    dashWalletAddr.textContent = solanaWallet.getShortAddress();
  }
  
  UIUtils.showToast('success', 'AI CFO Activated!', `Gemini is now analyzing ${bizName}'s finances`);
  
  setTimeout(() => {
    UIUtils.showView('dashboard');
    initDashboardCharts();
  }, 1500);
}

// Wallet connection for onboarding step 1
export async function connectPhantomStep1(): Promise<void> {
  const result = await solanaWallet.connectPhantom();
  
  if (result) {
    const connectedDiv = document.getElementById('walletConnectedStep1');
    const addressDiv = document.getElementById('walletAddressStep1');
    const balanceDiv = document.getElementById('walletBalanceStep1');
    const continueBtn = document.getElementById('step1Continue') as HTMLButtonElement;
    
    if (connectedDiv) connectedDiv.classList.remove('hidden');
    if (addressDiv) {
      addressDiv.textContent = solanaWallet.getPublicKey().slice(0, 8) + '...' + solanaWallet.getPublicKey().slice(-8);
    }
    
    const balance = await solanaWallet.getBalance();
    if (balanceDiv) balanceDiv.textContent = balance.toFixed(4) + ' SOL';
    if (continueBtn) continueBtn.disabled = false;
    
    UIUtils.showToast('success', 'Phantom Connected', solanaWallet.getShortAddress());
  }
}

export async function connectSolflareStep1(): Promise<void> {
  const result = await solanaWallet.connectSolflare();
  
  if (result) {
    const connectedDiv = document.getElementById('walletConnectedStep1');
    const addressDiv = document.getElementById('walletAddressStep1');
    const balanceDiv = document.getElementById('walletBalanceStep1');
    const continueBtn = document.getElementById('step1Continue') as HTMLButtonElement;
    
    if (connectedDiv) connectedDiv.classList.remove('hidden');
    if (addressDiv) {
      addressDiv.textContent = solanaWallet.getPublicKey().slice(0, 8) + '...' + solanaWallet.getPublicKey().slice(-8);
    }
    
    const balance = await solanaWallet.getBalance();
    if (balanceDiv) balanceDiv.textContent = balance.toFixed(4) + ' SOL';
    if (continueBtn) continueBtn.disabled = false;
    
    UIUtils.showToast('success', 'Solflare Connected', solanaWallet.getShortAddress());
  }
}

// Refresh Solana balance
export async function refreshSolanaBalance(): Promise<void> {
  if (!solanaWallet.isConnected()) {
    UIUtils.showToast('error', 'No Wallet', 'Please connect your wallet first');
    return;
  }
  
  try {
    const balance = await solanaWallet.getBalance();
    UIUtils.showToast('success', 'Balance Updated', `${balance.toFixed(4)} SOL`);
  } catch (err: any) {
    UIUtils.showToast('error', 'Error', err.message);
  }
}

// Initialize dashboard charts
export function initDashboardCharts(): void {
  if (cashFlowChart) return;
  
  const ctx1 = document.getElementById('cashFlowChart') as HTMLCanvasElement;
  if (ctx1) {
    cashFlowChart = new (window as any).Chart(ctx1.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Money In',
            data: [4500, 5200, 4800, 6100, 7500, 3800, 4200],
            backgroundColor: 'rgba(34,197,94,0.8)',
            borderRadius: 4
          },
          {
            label: 'Money Out',
            data: [2800, 3500, 3200, 4100, 3800, 2500, 2900],
            backgroundColor: 'rgba(153,69,255,0.3)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
  
  const ctx2 = document.getElementById('portfolioChart') as HTMLCanvasElement;
  if (ctx2) {
    portfolioChart = new (window as any).Chart(ctx2.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['SOL', 'M-Pesa', 'Bank USDC', 'Other'],
        datasets: [{
          data: [52, 35, 10, 3],
          backgroundColor: [
            'rgba(153,69,255,0.8)',
            'rgba(34,197,94,0.8)',
            'rgba(59,130,246,0.8)',
            'rgba(100,100,100,0.3)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 20, usePointStyle: true }
          }
        }
      }
    });
  }
}

// AI Chat functions
export function toggleAIChat(): void {
  const panel = document.getElementById('aiChatPanel');
  panel?.classList.toggle('active');
  
  // Load saved API key
  const keyInput = document.getElementById('geminiApiKey') as HTMLInputElement;
  if (keyInput && geminiAI.getApiKey()) {
    keyInput.value = '••••••••••••••••';
  }
}

export function saveGeminiKey(): void {
  const input = document.getElementById('geminiApiKey') as HTMLInputElement;
  if (input && geminiAI.setApiKey(input.value)) {
    UIUtils.showToast('success', 'API Key Saved', 'Gemini Pro activated');
  }
}

export async function sendAIMessage(): Promise<void> {
  const input = document.getElementById('aiChatInput') as HTMLInputElement;
  const message = input?.value.trim();
  if (!message) return;
  
  const messagesDiv = document.getElementById('aiChatMessages');
  if (!messagesDiv) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-message user';
  userMsg.textContent = message;
  messagesDiv.appendChild(userMsg);
  
  if (input) input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Show loading
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'ai-message assistant loading';
  loadingMsg.textContent = 'Gemini is analyzing your Solana data...';
  messagesDiv.appendChild(loadingMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Get AI response
  const response = await geminiAI.generateResponse(message, solanaWallet.getPublicKey());
  
  loadingMsg.remove();
  
  const responseMsg = document.createElement('div');
  responseMsg.className = 'ai-message assistant';
  responseMsg.textContent = response;
  messagesDiv.appendChild(responseMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

export function askAI(question: string): void {
  toggleAIChat();
  
  const messagesDiv = document.getElementById('aiChatMessages');
  if (!messagesDiv) return;
  
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-message user';
  userMsg.textContent = question;
  messagesDiv.appendChild(userMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  sendAIMessage();
}

// Expose functions to window for onclick handlers
(window as any).nextStep = nextStep;
(window as any).prevStep = prevStep;
(window as any).toggleAccountType = toggleAccountType;
(window as any).completeOnboarding = completeOnboarding;
(window as any).connectPhantomStep1 = connectPhantomStep1;
(window as any).connectSolflareStep1 = connectSolflareStep1;
(window as any).refreshSolanaBalance = refreshSolanaBalance;
(window as any).toggleAIChat = toggleAIChat;
(window as any).saveGeminiKey = saveGeminiKey;
(window as any).sendAIMessage = sendAIMessage;
(window as any).askAI = askAI;
(window as any).showView = (view: string) => UIUtils.showView(view);
