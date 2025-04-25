import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product';
import { Category } from '../models/category';
import { CartService } from '../services/cart.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface FilterState {
  category: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  styleUrls: ['./product-list.component.css', '../../../node_modules/@fortawesome/fontawesome-free/css/all.min.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  // Products and categories
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  pageSizeOptions = [8, 12, 24, 48];
  
  // Sorting
  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'created_at', label: 'Newest' }
  ];
  
  // Filter state
  filterState: FilterState = {
    category: null,
    minPrice: null,
    maxPrice: null,
    searchQuery: '',
    sortBy: 'name',
    sortDirection: 'asc',
    page: 1,
    itemsPerPage: 12
  };
  
  // UI state
  loading =false;
  error = '';
  cartMessage = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Wishlist tracking
  wishlist: number[] = [];
  
  // Recently viewed products
  recentlyViewed: Product[] = [];

  constructor(
    private apiService: ApiService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadWishlist();
    this.loadRecentlyViewed();
    this.loadSavedFilters(); // Add this line to load filters first
    this.loadProducts();
  }
  

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        console.error(err);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.filteredProducts = data; 
        this.loading = false;
        this.applyFilters(); // Add this line to apply filters after loading
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error(err);
      }
    });
  }
  

  applyFilters(): void {
    let filtered = [...this.allProducts];
    
    // Apply search filter
    if (this.filterState.searchQuery.trim() !== '') {
      const query = this.filterState.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (this.filterState.category !== null) {
      filtered = filtered.filter(product => product.category === this.filterState.category);
    }
    
    // Apply price filters
    if (this.filterState.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= (this.filterState.minPrice || 0));
    }
    
    if (this.filterState.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= (this.filterState.maxPrice || Infinity));
    }
    
    // Apply sorting
    filtered = this.sortProducts(filtered, this.filterState.sortBy, this.filterState.sortDirection);
    
    // Calculate total pages
    this.totalPages = Math.ceil(filtered.length / this.filterState.itemsPerPage);
    
    // Apply pagination
    const startIndex = (this.filterState.page - 1) * this.filterState.itemsPerPage;
    const endIndex = startIndex + this.filterState.itemsPerPage;
    this.filteredProducts = filtered.slice(startIndex, endIndex);
    
    // Save filters
    this.saveFilters();
  }

  sortProducts(products: Product[], sortBy: string, direction: 'asc' | 'desc'): Product[] {
    return [...products].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'created_at':
          if (a.created_at && b.created_at) {
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
          break;
        default:
          comparison = 0;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  filterByCategory(categoryId: number | null): void {
    this.filterState.category = categoryId;
    this.filterState.page = 1; // Reset to first page
    this.applyFilters();
  }

  applyPriceFilter(): void {
    this.filterState.page = 1; // Reset to first page
    this.applyFilters();
  }

  clearSearch(): void {
    this.filterState.searchQuery = '';
    this.filterState.page = 1; // Reset to first page
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterState = {
      category: null,
      minPrice: null,
      maxPrice: null,
      searchQuery: '',
      sortBy: 'name',
      sortDirection: 'asc',
      page: 1,
      itemsPerPage: this.filterState.itemsPerPage
    };
    this.applyFilters();
  }

  changeSorting(sortBy: string): void {
    if (this.filterState.sortBy === sortBy) {
      // Toggle direction if same sort field
      this.filterState.sortDirection = this.filterState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.filterState.sortBy = sortBy;
      this.filterState.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.filterState.page = page;
    this.applyFilters();
  }

  changeItemsPerPage(items: number): void {
    this.filterState.itemsPerPage = items;
    this.filterState.page = 1; // Reset to first page
    this.applyFilters();
  }

  saveFilters(): void {
    localStorage.setItem('productFilters', JSON.stringify(this.filterState));
  }

  loadSavedFilters(): void {
    const savedFilters = localStorage.getItem('productFilters');
    if (savedFilters) {
      this.filterState = JSON.parse(savedFilters);
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      this.cartMessage = 'Sorry, this item is out of stock';
      setTimeout(() => {
        this.cartMessage = '';
      }, 3000);
      return;
    }
    
    this.cartService.addToCart(product);
    
    this.cartMessage = `${product.name} added to cart!`;
    
    setTimeout(() => {
      this.cartMessage = '';
    }, 3000);
  }
  
  toggleWishlist(productId: number): void {
    const index = this.wishlist.indexOf(productId);
    if (index === -1) {
      this.wishlist.push(productId);
    } else {
      this.wishlist.splice(index, 1);
    }
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }
  
  isInWishlist(productId: number): boolean {
    return this.wishlist.includes(productId);
  }
  
  loadWishlist(): void {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      this.wishlist = JSON.parse(saved);
    }
  }
  
  viewProductDetails(product: Product): void {
    // Add to recently viewed
    this.addToRecentlyViewed(product);
  }
  
  addToRecentlyViewed(product: Product): void {
    // Remove if already exists
    this.recentlyViewed = this.recentlyViewed.filter(p => p.id !== product.id);
    
    // Add to beginning of array
    this.recentlyViewed.unshift(product);
    
    // Keep only the latest 5
    if (this.recentlyViewed.length > 5) {
      this.recentlyViewed.pop();
    }
    
    localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
  }
  
  loadRecentlyViewed(): void {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      this.recentlyViewed = JSON.parse(saved);
    }
  }

  clearRecentlyViewed(): void {
    this.recentlyViewed = [];
    localStorage.removeItem('recentlyViewed');
  }
  trackById(index: number, product: any): number {
    return product.id;
  }
}