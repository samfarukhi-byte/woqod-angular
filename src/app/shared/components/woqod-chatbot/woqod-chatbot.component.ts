import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ChatAction { label: string; route?: string; intent?: string; }
interface ChatMessage { from: 'bot' | 'user'; text: string; actions?: ChatAction[]; }

interface Intent {
  keywords: string[];
  reply: string;
  actions?: ChatAction[];
}

@Component({
  selector: 'app-woqod-chatbot',
  templateUrl: './woqod-chatbot.component.html',
  styleUrls: ['./woqod-chatbot.component.scss'],
})
export class WoqodChatbotComponent {
  open = false;
  typing = false;
  draft = '';
  messages: ChatMessage[] = [];

  /** Quick replies offered at the start of a conversation. */
  readonly quickStarters: ChatAction[] = [
    { label: '🚛 Bulk fuel contract', intent: 'bulkfuel' },
    { label: '🧾 View invoices', intent: 'invoice' },
    { label: '📋 Track a request', intent: 'track' },
    { label: '🗂️ All services', intent: 'services' },
    { label: '💬 Talk to support', intent: 'support' },
  ];

  // Lightweight intent engine. (Designed so a real LLM endpoint — e.g. the
  // Claude API — can later replace `respond()` without changing the UI.)
  private readonly intents: Intent[] = [
    {
      keywords: ['hi', 'hello', 'hey', 'salam', 'start', 'help'],
      reply: 'Hello! 👋 I’m the WOQOD Assistant. I can help you with bulk fuel contracts, invoices, requests and more. What would you like to do?',
    },
    {
      keywords: ['bulk', 'fuel', 'contract', 'diesel', 'gasoil', 'gasoline', 'register'],
      reply: 'For Bulk Fuel you can apply for a new contract, amend or terminate an existing one. Where would you like to go?',
      actions: [
        { label: 'Open Bulk Fuel', route: '/csp/services/bulk-fuel/dashboard' },
        { label: 'Register new contract', route: '/csp/services/bulk-fuel/register' },
        { label: 'Amend contract', route: '/csp/services/bulk-fuel/amend' },
      ],
    },
    {
      keywords: ['invoice', 'bill', 'payment', 'statement', 'amount', 'pay'],
      reply: 'You can view and download your invoices and the contract-status report here:',
      actions: [
        { label: 'Bulk Fuel invoices', route: '/csp/services/bulk-fuel/invoices' },
        { label: 'Kenar rent & invoices', route: '/kenar/invoices' },
      ],
    },
    {
      keywords: ['track', 'request', 'status', 'application', 'reference', 'complaint'],
      reply: 'You can submit and track all your requests — including bulk fuel applications — from the tracker:',
      actions: [{ label: 'Submit & Track Requests', route: '/csp/track-requests' }],
    },
    {
      keywords: ['service', 'services', 'retail', 'aviation', 'bunker', 'bitumen', 'shafaf', 'gas'],
      reply: 'Here are all WOQOD services. Click any service to explore its sections:',
      actions: [{ label: 'View all services', route: '/csp/services' }],
    },
    {
      keywords: ['inspection', 'tank', 'periodic'],
      reply: 'Your tanks’ periodic inspection schedule is available here:',
      actions: [{ label: 'Periodic inspection', route: '/csp/services/bulk-fuel/inspection' }],
    },
    {
      keywords: ['kenar', 'shop', 'rent', 'cheque', 'lease'],
      reply: 'Kenar lets you manage rental shops, contracts, invoices, cheques and sales data:',
      actions: [{ label: 'Open Kenar', route: '/kenar/dashboard' }],
    },
    {
      keywords: ['profile', 'account', 'company', 'user', 'access', 'settings'],
      reply: 'You can manage your company profile, users and access from Settings:',
      actions: [
        { label: 'Company Profile', route: '/csp/settings/company-profile' },
        { label: 'User & Access', route: '/csp/settings/user-access' },
      ],
    },
    {
      keywords: ['notification', 'alert', 'message'],
      reply: 'Your notifications are here:',
      actions: [{ label: 'Notifications', route: '/csp/notifications' }],
    },
    {
      keywords: ['support', 'contact', 'agent', 'human', 'call', 'phone', 'email'],
      reply: 'Our support team is here to help. ☎️ Call 16007 (WOQOD Contact Centre) or email customercare@woqod.com.qa. You can also raise a request and we’ll follow up.',
      actions: [{ label: 'Raise a request', route: '/csp/track-requests' }],
    },
  ];

  constructor(private readonly router: Router) {}

  toggle(): void {
    this.open = !this.open;
    if (this.open && this.messages.length === 0) {
      this.pushBot(
        'Hi! 👋 I’m the **WOQOD Assistant**. How can I help you today?',
        this.quickStarters
      );
    }
  }

  close(): void { this.open = false; }

  send(text?: string): void {
    const value = (text ?? this.draft).trim();
    if (!value) return;
    this.messages.push({ from: 'user', text: value });
    this.draft = '';
    this.scrollSoon();
    this.respond(value);
  }

  /** Quick-reply / action chip handler. */
  act(action: ChatAction): void {
    if (action.route) {
      this.messages.push({ from: 'user', text: action.label });
      this.pushBot(`Taking you to **${action.label}**…`);
      this.router.navigateByUrl(action.route);
      setTimeout(() => (this.open = false), 600);
      return;
    }
    if (action.intent) {
      this.messages.push({ from: 'user', text: action.label });
      this.scrollSoon();
      this.respondToIntent(action.intent);
    }
  }

  private respond(text: string): void {
    const lower = text.toLowerCase();
    const match = this.intents.find((i) => i.keywords.some((k) => lower.includes(k)));
    if (match) {
      this.pushBot(match.reply, match.actions);
    } else {
      this.pushBot(
        'I’m not sure about that yet, but I can help you with these. Pick an option or rephrase:',
        this.quickStarters
      );
    }
  }

  private respondToIntent(intentKey: string): void {
    const map: Record<string, number> = {
      bulkfuel: 1, invoice: 2, track: 3, services: 4, support: 9,
    };
    const idx = map[intentKey];
    const intent = idx != null ? this.intents[idx] : undefined;
    if (intent) this.pushBot(intent.reply, intent.actions);
    else this.respond(intentKey);
  }

  private pushBot(text: string, actions?: ChatAction[]): void {
    this.typing = true;
    this.scrollSoon();
    setTimeout(() => {
      this.typing = false;
      this.messages.push({ from: 'bot', text, actions });
      this.scrollSoon();
    }, 500);
  }

  /** Render **bold** markdown lightly for bot messages. */
  format(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  private scrollSoon(): void {
    setTimeout(() => {
      const el = document.querySelector('.woqod-chat__body');
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }
}
