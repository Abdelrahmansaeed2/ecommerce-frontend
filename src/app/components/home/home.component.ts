import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  trendingProducts = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe((data) => {
      console.log(data)
      this.trendingProducts.set(data.slice(0, 2));
    })
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
    alert('Item added to cart!');
  }
}
