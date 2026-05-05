import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  addToCart(product: Product, quantity: number = 1, configuration: string = 'Standard') {
    const existing = this.items.find(i => i.product.id === product.id && i.configuration === configuration);
    if (existing) { existing.quantity += quantity; } 
    else { this.items.push({ product, quantity, configuration }); }
    this.cartSubject.next(this.items);
  }

  removeFromCart(productId: string) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.cartSubject.next(this.items);
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (item && quantity > 0) { item.quantity = quantity; }
    this.cartSubject.next(this.items);
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);
  }

  getSubtotal() { return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0); }
  getCartCount() { return this.items.reduce((sum, item) => sum + item.quantity, 0); }
}
