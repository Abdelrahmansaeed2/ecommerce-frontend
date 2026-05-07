import { FormsModule, NgModel } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

interface BillingForm {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  router = inject(Router);
  cartService = inject(CartService);
   billing: BillingForm = {
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
  };


   getBillingForPaymob() {
    return {
      firstName: this.billing.firstName,
      lastName: this.billing.lastName,
      street: this.billing.street,
      city: this.billing.city,
      postalCode: this.billing.postalCode,
    };
  }

  cart = this.cartService.cart();
  selectedPayment = 'card';

  get subtotal() { return this.cartService.getSubtotal(); }
  get tax() { return this.subtotal * 0.08; }
  get total() { return this.subtotal + this.tax; }

  setPayment(method: string) { this.selectedPayment = method; }

  async confirmOrder() {
    if(this.subtotal === 0) {
      alert('Your cart is empty.');
      return;
    }
    const { checkoutUrl } = await fetch("http://localhost:3001/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      amountEGP: this.total,
      billing: this.getBillingForPaymob()
    }),
    }).then(
      r => {
        return r.json()
      }
    );

    window.location.href = checkoutUrl;
  }
}
