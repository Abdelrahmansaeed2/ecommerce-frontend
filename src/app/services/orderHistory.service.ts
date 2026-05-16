import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  email: string; 
  items: { item: string; quantity: number }[]; 
  amountEGP: string; 
  success: boolean;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderHistoryService {
    private apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://luxebelle-backend.vercel.app';

    private http = inject(HttpClient);

    checkout(email: string, items: any[], amountEGP: string, success: boolean): Observable<any> {
      return this.http.post(`${this.apiUrl}/payments`, {
        email,
        items,          
        amountEGP,
        success,
        date: new Date().toISOString(),
      });
    }  

    getOrders(): Observable<Order[]> {
      return this.http.get<Order[]>(`${this.apiUrl}/payments?email=${localStorage.getItem("User")}`); 
    }
}