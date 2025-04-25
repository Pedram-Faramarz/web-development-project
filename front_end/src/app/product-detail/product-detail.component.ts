import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  loading = true;
  error = '';
  cartMessage: string = ''; // Variable for the notification message

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router, // Router service for programmatic navigation
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    } else {
      this.error = 'Product ID not provided';
      this.loading = false;
    }
  }

  loadProduct(id: number): void {
    this.apiService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    if (this.product.stock <= 0) {
      this.cartMessage = 'Sorry, this item is out of stock';
      setTimeout(() => {
        this.cartMessage = '';
      }, 3000);
      return;
    }
    
    // Use cart service instead of direct localStorage manipulation
    this.cartService.addToCart(this.product);
    
    this.cartMessage = `${this.product.name} added to cart!`;
    
    setTimeout(() => {
      this.cartMessage = '';
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/products']); // Navigate back to the product list page
  }
}
