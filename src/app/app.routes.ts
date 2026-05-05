import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { DashboardComponent } from './components/dashboard/dashboard-component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login-component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ShopComponent } from './components/shop/shop.component';
import { SignupComponent } from './components/signup/signup-component';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'shop', component: ShopComponent, canActivate: [AuthGuard] },
  { path: 'product/:id', component: ProductDetailComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];