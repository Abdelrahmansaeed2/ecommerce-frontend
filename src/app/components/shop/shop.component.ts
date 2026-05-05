import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);
  
  products: Product[] = [];
  searchQuery = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.products = this.productService.searchProducts(this.searchQuery);
    });
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
    alert('Item added to cart!');
  }
}
