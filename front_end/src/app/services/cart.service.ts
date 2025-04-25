import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem {
  product: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'shopping_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  cartItems$ = this.cartItemsSubject.asObservable();
  
  constructor() {
    this.loadCart();
  }
  
  private loadCart(): void {
    const cart = JSON.parse(localStorage.getItem(this.cartKey) || '[]');
    this.cartItemsSubject.next(cart);
  }
  
  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }
  
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }
  
  getCartTotal(): number {
    return this.getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  getCartItemCount(): number {
    return this.getCartItems().reduce((count, item) => count + item.quantity, 0);
  }
  
  addToCart(product: Product): void {
    const cart = this.getCartItems();
    const existingItemIndex = cart.findIndex(item => item.product === product.id);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        product: product.id!,
        name: product.name,
        price: product.price,
        quantity: 1,
        
      });
    }
    
    this.saveCart(cart);
  }
  
  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCartItems();
    const existingItemIndex = cart.findIndex(item => item.product === productId);
    
    if (existingItemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(existingItemIndex, 1);
      } else {
        cart[existingItemIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }
  }
  
  removeFromCart(productId: number): void {
    const cart = this.getCartItems().filter(item => item.product !== productId);
    this.saveCart(cart);
  }
  
  clearCart(): void {
    this.saveCart([]);
  }
  
  // For server synchronization (to be implemented)
  syncWithServer(): void {
    // This would communicate with your API to save cart data server-side
    // And handle merging of offline cart with server data
  }
  
}