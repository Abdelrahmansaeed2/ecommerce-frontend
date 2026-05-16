import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

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
export class CheckoutComponent implements OnInit {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://luxebelle-backend.vercel.app';

  router = inject(Router);
  cartService = inject(CartService);
  private http = inject(HttpClient);

  billing: BillingForm = {
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
  };

  selectedPayment = 'card';
  isProcessing = false;

  cart = this.cartService.cart();

  ngOnInit(): void {
    this.cart = this.cartService.cart();
  }

  getBillingForPaymob() {
    return {
      firstName: this.billing.firstName || 'Guest',
      lastName: this.billing.lastName || 'User',
      email: localStorage.getItem('User') || 'test@gmail.com',
      phone: '01000000000', 
      street: this.billing.street || 'NA',
      city: this.billing.city || 'NA',
      postalCode: this.billing.postalCode || 'NA'
    };
  }

  get subtotal() { return this.cartService.getSubtotal(); }
  get tax() { return this.subtotal * 0.08; }
  get total() { return this.subtotal + this.tax; }

  setPayment(method: string) { this.selectedPayment = method; }

  confirmOrder() {
    if (this.subtotal === 0) {
      alert('Your cart is empty.');
      return;
    }

    this.isProcessing = true;

    const paymentPayload = {
      amountEGP: this.total,
      billing: {
        firstName: this.billing.firstName || 'Guest',
        lastName: this.billing.lastName || 'User',
        email: localStorage.getItem('User') || 'test@gmail.com',
        phone: '01000000000'
      }
    };

    console.log('Initiating payment gateway routing to:', `${this.apiUrl}/payment/initiate`);

    this.http.post<{ checkoutUrl: string }>(`${this.apiUrl}/payment/initiate`, paymentPayload)
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response && response.checkoutUrl) {
            console.log('Redirecting to Paymob Secure Iframe...');
            window.location.href = response.checkoutUrl;
          } else {
            alert('Failed to get payment checkout URL from server.');
          }
        },
        error: (err) => {
          this.isProcessing = false;
          console.error('Checkout error detail:', err);
          alert('Error communicating with payment gateway. Please check backend status.');
        }
      });
  }
}