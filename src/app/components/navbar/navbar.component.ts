import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  cartService = inject(CartService);
  router = inject(Router);
  
  get count() { return this.cartService.getCartCount(); }

  onSearch(term: string) {
    if(term) { this.router.navigate(['/shop'], { queryParams: { q: term } }); }
  }
}
