import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { CartItem } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [CommonModule,FormsModule,RouterLink]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount = 0;
  shippingAddress = '';
  contactPhone = '';
  isLoggedIn = false;
  statusmessage :string= '';
  statustype:string ='';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  calculateTotal(): void {
    this.totalAmount = this.cartService.getCartTotal();
  }

  updateQuantity(productId: number, newQuantity: number): void {
    this.cartService.updateQuantity(productId, newQuantity);
  }

  removeItem(productId: number): void {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    this.statusmessage = '';
    this.statustype = 'info';
  
    if (!this.isLoggedIn) {
      this.statusmessage = 'Please log in to complete your order';
      this.statustype = 'error';
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
  
    if (this.cartItems.length === 0) {
      this.statusmessage = 'Your cart is empty';
      this.statustype = 'error';
      return;
    }
  
    if (!this.shippingAddress || !this.contactPhone) {
      this.statusmessage = 'Please provide shipping address and contact phone';
      this.statustype = 'error';
      return;
    }
  
    const orderData = {
      user: this.authService.currentUserValue,
      user_username:this.authService.getUserName,
      status: 1,

      total_amount: this.totalAmount,
      shipping_address: this.shippingAddress,
      contact_phone: this.contactPhone,
      items: this.cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      }))
    };
  
    this.apiService.createOrder(orderData).subscribe({
      next: (orderResponse) => {
        // After successful order creation, update product stock
        const stockUpdateObservables = this.cartItems.map(item => {
          // First, get the current product details to know its current stock
          return this.apiService.getProduct(item.product).pipe(
            switchMap(product => {
              const newStock = Math.max(0, product.stock - item.quantity);
              // Then update the stock
              return this.apiService.updateProductStock(item.product, newStock);
            })
          );
        });
  
        // Wait for all stock updates to complete
        forkJoin(stockUpdateObservables).subscribe({
          next: () => {
            this.statusmessage = 'Order placed successfully! Product stocks updated.';
            this.statustype = 'success';
            this.cartService.clearCart();
          },
          error: (error) => {
            console.error('Failed to update product stocks:', error);
            this.statusmessage = 'Order placed successfully, but there was an issue updating product stocks.';
            this.statustype = 'warning';
            this.cartService.clearCart();
          }
        });
      },
      error: (error) => {
        let message = 'Failed to place order. Please try again.';
        if (error?.error?.message) {
          message += ' ' + error.error.message;
        }
        this.statusmessage = message;
        this.statustype = 'error';
      }
    });
  }
  
}
