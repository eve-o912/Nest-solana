// Nest - UI Utilities Module
// Common UI functions, theme management, and toast notifications

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export class UIUtils {
  private static toastContainer: HTMLElement | null = null;
  private static currentTheme: 'light' | 'dark' = 'light';

  // Initialize UI utilities
  static init(): void {
    this.setupToastContainer();
    this.setupTheme();
  }

  // Toast notifications
  private static setupToastContainer(): void {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1000;display:flex;flex-direction:column;gap:12px;';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  static showToast(type: ToastType, title: string, message: string, duration: number = 4000): void {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const colors: Record<ToastType, string> = {
      success: 'background:var(--success-bg);color:var(--success);border-left:4px solid var(--success);',
      error: 'background:var(--danger-bg);color:var(--danger);border-left:4px solid var(--danger);',
      info: 'background:var(--brand-bg);color:var(--brand-dark);border-left:4px solid var(--brand);',
      warning: 'background:var(--warning-bg);color:var(--warning);border-left:4px solid var(--warning);'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `padding:16px 20px;border-radius:var(--radius);${colors[type]}box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:12px;min-width:300px;animation:slideIn 0.3s ease;`;
    toast.innerHTML = `
      <span style="font-size:1.25rem;font-weight:700;">${icons[type]}</span>
      <div>
        <div style="font-weight:600;">${title}</div>
        <div style="font-size:0.875rem;opacity:0.9;">${message}</div>
      </div>
    `;

    this.toastContainer?.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Theme management
  private static setupTheme(): void {
    this.currentTheme = (localStorage.getItem('nest-theme') as 'light' | 'dark') || 'light';
    this.applyTheme(this.currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', () => this.toggleTheme());
  }

  static applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  static toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('nest-theme', this.currentTheme);
  }

  static getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  // View navigation
  static showView(viewName: string): void {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewName + 'View');
    if (view) {
      view.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('onclick')?.includes(viewName)) {
        link.classList.add('active');
      }
    });
  }

  // Animation styles
  static injectAnimationStyles(): void {
    if (document.getElementById('nest-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'nest-animations';
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(153,69,255,0.3); }
        50% { box-shadow: 0 0 40px rgba(153,69,255,0.5); }
      }
    `;
    document.head.appendChild(style);
  }
}
