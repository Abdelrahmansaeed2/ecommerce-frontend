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
    http://localhost:4200/payment-result?id=457115327&pending=false&amount_cents=239760&success=true&is_auth=false&is_capture=false&is_standalone_payment=true&is_voided=false&is_refunded=false&is_3d_secure=true&integration_id=4913066&profile_id=1015131&has_parent_transaction=false&order=520622595&created_at=2026-05-07T01:47:34.849851&currency=EGP&merchant_commission=0&accept_fees=0&discount_details=%5B%5D&amount_cents_bigint=239760&is_void=false&is_refund=false&error_occured=false&refunded_amount_cents=0&refunded_amount_cents_bigint=0&captured_amount=0&captured_amount_bigint=0&settlement_amount_cents_bigint=0&accept_fees_cents_bigint=0&vat_cents_bigint=0&updated_at=2026-05-07T01:47:55.733293&is_settled=false&bill_balanced=false&is_bill=false&owner=1891398&data.message=Approved&source_data.type=card&source_data.pan=2346&source_data.sub_type=MasterCard&acq_response_code=00&txn_response_code=APPROVED&hmac=a294ac97bc774f5c6ae0cc4fcb8a5ced3d3a278072c068d36b0f8df56802c4d4e8f232d4421924e9ad1b10dca18280d0bb2e6e9c3108212863dab4de4121b2ec
    if(this.success){
      const boughtItems = this.cartService.cart().map( (x) => {return {"item": x.product.name, "quantity": x.quantity}})
    this.orderHistory.checkout(localStorage.getItem("User") ?? "",boughtItems, this.amount ,this.success);
     this.cartService.clearCart(); 
     console.log(this.cartService.cart());
    }
  }
}