import { map } from 'rxjs';
import { CartService } from './../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderHistoryService } from '../../services/orderHistory.service';

@Component({
  selector: 'app-payment-result',
  imports: [RouterLink, CommonModule],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResultComponent  {
  success = false;
  transactionId = '';
  orderId = '';
  amount = '';
  cartService = inject(CartService);
  orderHistory = inject(OrderHistoryService)
  constructor(private route: ActivatedRoute) {}

   ngOnInit() {
    const q = this.route.snapshot.queryParams;
    this.success = q['success'] === 'true';
    this.orderId = q['order'] ?? 'N/A';
    this.amount = q['amount_cents'] ?? 'N/A';
    console.log(this.success, this.transactionId, this.orderId, (+this.amount / 100).toString() );
    if(this.amount != 'N/A') this.amount = (+this.amount / 100).toString()
    if(this.success){
      const boughtItems = this.cartService.cart().map( (x) => {return {"item": x.product.name, "quantity": x.quantity}})
    this.orderHistory.checkout(localStorage.getItem("User") ?? "",boughtItems, this.amount ,this.success);
     this.cartService.clearCart(); 
     console.log(this.cartService.cart());
    }
  }
}
