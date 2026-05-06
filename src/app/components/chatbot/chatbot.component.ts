import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

interface MessageAction {
  type: 'view' | 'add';
  id: string;
  label: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  actions?: MessageAction[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  isChatOpen: boolean = false;
  userInput: string = '';
  isLoading: boolean = false;
  messages: Message[] = [];

  constructor(
    private aiService: AiService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMessages();
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        text: 'Welcome to LUXE. I am your personal shopping assistant. How can I help you today?',
        timestamp: new Date()
      });
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => {
        this.scrollToBottom();
        if (this.chatInput) {
          this.chatInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userText = this.userInput;
    this.userInput = '';
    
    const userMsg: Message = {
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    this.messages.push(userMsg);
    this.saveMessages();
    this.isLoading = true;

    try {
      const history = this.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.text
      }));

      const aiResponse = await this.aiService.getChatResponse(userText, history);
      
      const { cleanText, actions } = this.parseActions(aiResponse);

      this.messages.push({
        role: 'assistant',
        text: cleanText,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined
      });
      this.saveMessages();

      // AUTO-TRIGGER: If AI says it's opening/adding something, do it!
      const lowerText = cleanText.toLowerCase();
      if (actions.length > 0) {
        // If text contains "opening", "viewing", "فتح", "عرض" and there's a view action
        const viewAction = actions.find(a => a.type === 'view');
        if (viewAction && (lowerText.includes('فتح') || lowerText.includes('عرض') || lowerText.includes('open') || lowerText.includes('view'))) {
          setTimeout(() => this.handleAction(viewAction), 1000);
        }
        
        // If text contains "added", "adding", "تمت إضافة", "ضيف" and there's an add action
        const addAction = actions.find(a => a.type === 'add');
        if (addAction && (lowerText.includes('إضافة') || lowerText.includes('ضيف') || lowerText.includes('add'))) {
          // We don't want to double-add if they just clicked the button, 
          // but if they TYPED it, this will handle it.
          // To be safe, we only auto-add if the user didn't just click a button (complex to track, so maybe skip auto-add for now to avoid duplicates)
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
      
      // Auto-focus the input field so user can type immediately
      setTimeout(() => {
        if (this.chatInput) {
          this.chatInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  private parseActions(text: string): { cleanText: string, actions: MessageAction[] } {
    const actions: MessageAction[] = [];
    const actionRegex = /\[ACTION:(view|add):([^:]+):([^\]]+)\]/g;
    
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({
        type: match[1] as 'view' | 'add',
        id: match[2],
        label: match[3]
      });
    }
    
    // Clean all tags from the text
    const cleanText = text.replace(actionRegex, '').trim();
    
    return { cleanText, actions };
  }

  handleAction(action: MessageAction) {
    if (action.type === 'view') {
      this.router.navigate(['/product', action.id]);
      this.isChatOpen = false; // Close chat on navigation
    } else if (action.type === 'add') {
      const product = this.productService.getProductById(action.id);
      if (product) {
        this.cartService.addToCart(product);
        // Maybe show a small feedback in chat?
        const feedback: Message = {
          role: 'assistant',
          text: `Added ${product.name} to your cart! 🛍️`,
          timestamp: new Date()
        };
        this.messages.push(feedback);
        this.saveMessages();
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private saveMessages() {
    localStorage.setItem('luxe_chat_history', JSON.stringify(this.messages));
  }

  private loadMessages() {
    const saved = localStorage.getItem('luxe_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.messages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        this.messages = [];
      }
    }
  }

  clearChat() {
    this.messages = [{
      role: 'assistant',
      text: 'Chat cleared. How else can I help you?',
      timestamp: new Date()
    }];
    this.saveMessages();
  }
}
