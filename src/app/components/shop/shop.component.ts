import { Component, inject, OnInit, signal } from '@angular/core';
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
  
  products = signal<Product[]>([]);
  searchQuery = '';

  ngOnInit() {
      this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      console.log(this.searchQuery)
      if(this.searchQuery !=''){
      this.productService.getProducts().subscribe((data) => {
        const filtered = data.filter(p =>
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        this.products.set(filtered);
      });
    }
      else{
        this.productService.getProducts().subscribe((data) => {
        console.log(data)
      
        this.products.set(data);
      });
      
    }
     });
    
  }

  onSearch() {
  this.productService.searchProducts(this.searchQuery).subscribe((data) => {
    this.products.set(data);
  });
}
  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
    alert('Item added to cart!');
  }
}
