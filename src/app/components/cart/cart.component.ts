import { CartService } from './../../services/cart.service';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);
  cart = this.cartService.cart
  ngOnInit(){
      this.cartService.loadCart();
  }


  inc(id: string, current: number) { this.cartService.updateQuantity(id, current + 1); }
  dec(id: string, current: number) { this.cartService.updateQuantity(id, current - 1); }
  remove(id: string) { this.cartService.removeFromCart(id); }

  get subtotal() { return this.cartService.getSubtotal(); }
  get tax() { return this.subtotal * 0.08; }
  get total() { return this.subtotal + this.tax; }
}
