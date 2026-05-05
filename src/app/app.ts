import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Categories } from './components/categories/categories';
import { FeaturedProducts } from './components/featured-products/featured-products';
import { Journal } from './components/journal/journal';
import { Newsletter } from './components/newsletter/newsletter';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Hero,
    Categories,
    FeaturedProducts,
    Journal,
    Newsletter,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('aura-home');
}


