import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';

export interface Order{
  email: string, items: {item: string, quantity: number}[], amountEGP: string, success : boolean
}
@Injectable({ providedIn: 'root' })
export class OrderHistoryService {
    private apiUrl = 'http://localhost:3000';
    http = inject(HttpClient);
    checkout = async (email: string, items: {item: string, quantity: number}[], amountEGP: string, success : boolean) => {
          
      this.http.post(`${this.apiUrl}/payments`, 
      JSON.stringify({
          email,
          items,          
          amountEGP,
          success,
          date: new Date().toISOString(),
        }),
      ).subscribe();

    }  
    getOrders = () => {
      return this.http.get<Order[]>(`${this.apiUrl}/payments?email=${localStorage.getItem("User")}`); 
    }
}
