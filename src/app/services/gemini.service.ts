import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  // IMPORTANT: Replace with your actual API key
  private readonly API_KEY = 'YOUR_GEMINI_API_KEY';
  private genAI = new GoogleGenerativeAI(this.API_KEY);
  private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  constructor(private productService: ProductService) {}

  private getSystemPrompt(): string {
    const products = this.productService.getProducts();
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

Our current product catalog:
${productContext}

Always refer to these products when asked for recommendations.`;
  }

  async getChatResponse(userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      if (this.API_KEY === 'YOUR_GEMINI_API_KEY') {
        return "System: Please configure the Gemini API Key in `src/app/services/gemini.service.ts` to enable the AI Assistant.";
      }

      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // Include the system prompt as part of the first message context if history is empty
      // or as a specialized instruction. For Flash 1.5, we'll prefix it to the message or use a system instruction if supported.
      // For simplicity and broad compatibility, we'll use it to start the chat if it's the first message.
      
      const fullMessage = history.length === 0 
        ? `${this.getSystemPrompt()}\n\nUser: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(fullMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }
  }
}
