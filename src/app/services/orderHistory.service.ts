import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://luxebelle-backend.vercel.app';

  private http = inject(HttpClient);

  billingData = {
    firstName: '',
    lastName: '',
    email: localStorage.getItem('User') || '',
    phone: ''
  };

  cartItems: any[] = [];
  totalAmount: number = 0;
  isProcessing: boolean = false;

  ngOnInit(): void {
    const savedCart = localStorage.getItem('Cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  confirmOrder(): void {
    if (this.totalAmount <= 0) {
      alert('Your cart is empty!');
      return;
    }

    this.isProcessing = true;

    const paymentPayload = {
      amountEGP: this.totalAmount,
      billing: {
        firstName: this.billingData.firstName || 'Guest',
        lastName: this.billingData.lastName || 'User',
        email: this.billingData.email,
        phone: this.billingData.phone || '01000000000'
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
          alert('Error communicating with payment gateway. Please check terminal console.');
        }
      });
  }
}