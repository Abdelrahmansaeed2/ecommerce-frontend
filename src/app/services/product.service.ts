import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://luxebelle-backend.vercel.app';

    http = inject(HttpClient);

    getProducts() {
      return this.http.get<Product[]>(`${this.apiUrl}/products`);
    }

    getProductById(id: string) {  
      return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
    }

    searchProducts(query: string) {
      console.log("Query", query)
      return this.http.get<Product[]>(
        `${this.apiUrl}/products?category_like=${query}&name_like=${query}`
      );
    }
}