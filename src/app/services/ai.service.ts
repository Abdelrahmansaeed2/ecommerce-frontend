import { Injectable } from '@angular/core';
import { ProductService } from './product.service';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  // IMPORTANT: Replace with your actual Groq API key
  private readonly API_KEY = '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';
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly MODEL = 'llama-3.3-70b-versatile';

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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Groq API Error:', error);
      return `I'm sorry, I'm having trouble connecting to my brain right now. Error: ${error.message}`;
    }
  }
}
