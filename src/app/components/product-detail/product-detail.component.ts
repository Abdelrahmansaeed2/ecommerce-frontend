import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  cartService = inject(CartService);

  product = signal<Product>({} as Product);
  quantity = 1;
  activeConfig = 'Standard Finish';
  expandedSpec = 'Materials & Care';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productService.getProducts().subscribe(
        (data)=> {
          this.product.set(data.find((p) => p.id == params["id"])!)
          console.log(this.product)
        }
      );
      window.scrollTo(0, 0);
    });
  }

  inc() { this.quantity++; }
  dec() { if(this.quantity > 1) this.quantity--; }

  setConfig(conf: string) { this.activeConfig = conf; }
  toggleSpec(spec: string) { this.expandedSpec = this.expandedSpec === spec ? '' : spec; }

  addToCart() {
    if(this.product) {
      this.cartService.addToCart(this.product(), this.quantity, this.activeConfig);
      alert(`Added ${this.quantity}x ${this.product.name} (${this.activeConfig}) to your cart!`);
      this.quantity = 1;
    }
  }

  writeReview() {
    alert('Review submitted successfully!');
  }
}
