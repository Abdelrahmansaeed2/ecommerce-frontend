import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://luxebelle-backend.vercel.app';

  private http = inject(HttpClient);
  constructor(private productService: ProductService) {}

  private getSystemPrompt(products: Product[]): string {
    const productContext = products.map(p => 
      `- ${p.name} (${p.category}): $${p.price}. ${p.description} (Rating: ${p.rating}/5)`
    ).join('\n');

    return `You are "LUXE Assistant", a helpful and professional AI shopping assistant for LUXE, a premium e-commerce store.
    
Your goals:
1. Help users find products from our catalog.
2. Provide styling advice and recommendations based on our collection.
3. Answer questions about our premium services.

Guidelines:
- Be polite, sophisticated, and helpful.
- If a user asks for a product we don't have, politely inform them and suggest the closest alternative from our list.
- Use emojis occasionally to be friendly but maintain a premium tone.
- Keep responses concise but informative.
- ALWAYS respond in the same language as the user (Arabic or English).

ACTIONS:
You can trigger UI actions by including special tags in your response. 
When you recommend a product or the user asks to see it, ALWAYS include the "view" action. 
If they want to buy it or add it to cart, include the "add" action.
Format: [ACTION:type:id:label]
Types: "view" (open details), "add" (add to cart)
Example: "I highly recommend the Chronos Obsidian Edition. [ACTION:view:1:View Watch] [ACTION:add:1:Add to Cart]"

Our current product catalog:
${productContext}

Always refer to these products when asked for recommendations.`;
  }

  async getChatResponse(userMessage: string, history: { role: 'user' | 'assistant', content: string }[] = []) {
    try {
      const products = await firstValueFrom(this.productService.getProducts());
      const messages = [
        { role: 'system', content: this.getSystemPrompt(products) },
        ...history,
        { role: 'user', content: userMessage }
      ];

      console.log('Routing AI chat request securely to backend gateway...');
      
      const response = await firstValueFrom(
        this.http.post<{ content: string }>(`${this.apiUrl}/api/chat`, { messages })
      );

      return response.content;
    } catch (error: any) {
      console.error('Secure Chat Client Error:', error);
      return `I'm sorry, I'm having trouble connecting to my brain right now.`;
    }
  }
}