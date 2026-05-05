import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';
  private items: CartItem[] = [];
  private cartRecordId: string | null = null;
  cart = signal<CartItem[]>([]);

  private getUserEmail(): string | null {
    const user = localStorage.getItem('User');
    return user;
  }

  private syncCart() {
    if (this.cartRecordId) {
      this.http.put(`${this.apiUrl}/cart/${this.cartRecordId}`, { id: this.cartRecordId, email: this.getUserEmail(), items: this.items }).subscribe(
        (data) => console.log(data)
      );
    } else {
      this.http.post<any>(`${this.apiUrl}/cart`, { email: this.getUserEmail(), items: this.items }).subscribe(record => {
        console.log(record)
        this.cartRecordId = record.id;
      });
    }
  }

  loadCart() {
    const email = this.getUserEmail();
    console.log(email)
    if (!email) return;
    this.http.get<any[]>(`${this.apiUrl}/cart?email=${email}`).subscribe(carts => {
      if (carts.length > 0) {
        this.cartRecordId = carts[0].id;
        this.items = carts[0].items;
        this.cart.set([...this.items]);
      }
    });
  }

  addToCart(product: Product, quantity: number = 1, configuration: string = 'Standard') {
    const existing = this.items.find(i => i.product.id === product.id && i.configuration === configuration);
    if (existing) { existing.quantity += quantity; }
    else { this.items.push({ product, quantity, configuration }); }
    this.cart.set([...this.items]);
    this.syncCart();
  }

  removeFromCart(productId: string) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.cart.set([...this.items]);
    this.syncCart();
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (item && quantity > 0) { item.quantity = quantity; }
    this.cart.set([...this.items]);
    this.syncCart();
  }

  clearCart() {
    this.items = [];
    this.cartRecordId = null;
    this.cart.set([]);
    this.syncCart();
  }

  getSubtotal() { return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0); }
  getCartCount() { return this.items.reduce((sum, item) => sum + item.quantity, 0); }
}