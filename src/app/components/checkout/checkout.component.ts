import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  router = inject(Router);
  cartService = inject(CartService);
  
  cart = this.cartService.cart();
  selectedPayment = 'card';

  get subtotal() { return this.cartService.getSubtotal(); }
  get tax() { return this.subtotal * 0.08; }
  get total() { return this.subtotal + this.tax; }

  setPayment(method: string) { this.selectedPayment = method; }

  confirmOrder() {
    if(this.subtotal === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert('Payment Successful! Your LUXE order is confirmed and will be shipped soon.');
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
