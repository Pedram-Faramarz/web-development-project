import { Component, OnInit } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule,RouterModule]
})
export class AppComponent implements OnInit {
  title = 'E-Commerce Store';
  isLoggedIn = false;
  username = '';
  cartItemCount = 0;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.username : '';
    });
    
    // Update cart count initially and when local storage changes
    this.updateCartCount();
    window.addEventListener('storage', () => {
      this.updateCartCount();
    });
  }

  updateCartCount(): void {
    const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
    const activeItems = cart.filter((item: any) => item.quantity > 0);
    this.cartItemCount = activeItems.length;
    console.log('Cart from localStorage:', cart);

  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}