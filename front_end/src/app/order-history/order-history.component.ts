import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  selectedOrder: Order | null = null;
  productNames: {[key: number]: string} = {};
  isAdmin = false;
  
  // Filter options
  filterOptions = {
    userId: null as number | null,
    status: null as number | null,
    dateFrom: null as string | null, 
    dateTo: null as string | null
  };
  
  // Users list (for admin filtering)
  users: any[] = [];
  currentUserId: number | null = null;
  
  constructor(
    private apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    // Get current user ID from localStorage (assuming it's stored there)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser.id || null;
    
    // Check if user is admin
    this.checkAdminStatus();
  }
  
  checkAdminStatus(): void {
    this.apiService.checkAdminStatus().subscribe({
      next: (data) => {
        this.isAdmin = data.is_admin;
        
        if (this.isAdmin) {
          // Load users for filtering if admin
          this.loadUsers();
        }
        
        // Load orders
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to check admin status', err);
        // Default to non-admin if there's an error
        this.isAdmin = false;
        this.loadOrders();
      }
    });
  }
  
  loadUsers(): void {
    // Implement a service call to get users (for admin filtering)
    // This would need to be added to your ApiService
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }
  
  loadOrders(): void {
    this.loading = true;
    this.error = '';
    
    // Create params for filtering (if admin)
    const params: any = {};
    
    if (this.isAdmin) {
      if (this.filterOptions.userId) params.user_id = this.filterOptions.userId;
      if (this.filterOptions.status) params.status = this.filterOptions.status;
      if (this.filterOptions.dateFrom) params.date_from = this.filterOptions.dateFrom;
      if (this.filterOptions.dateTo) params.date_to = this.filterOptions.dateTo;
    }
    
    this.apiService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
        this.loadProductNames();
      },
      error: (err) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  loadProductNames(): void {
    // For each order item, get the product name
    this.orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          // Only fetch if we don't already have it
          if (!this.productNames[item.product]) {
            this.apiService.getProduct(item.product).subscribe({
              next: (product) => {
                this.productNames[item.product] = product.name;
              },
              error: (err) => {
                console.error(`Failed to load product ${item.product}`, err);
                this.productNames[item.product] = 'Unknown Product';
              }
            });
          }
        });
      }
    });
  }
  
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }
  
  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
  
  getStatusName(status: number): string {
    const statusMap: {[key: number]: string} = {
      1: 'Pending',
      2: 'Processing',
      3: 'Shipped',
      4: 'Delivered',
      5: 'Cancelled'
    };
    
    return statusMap[status] || 'Unknown';
  }
  
  getStatusClass(status: string): string {
    const statusClass: {[key: string]: string} = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    
    return statusClass[status] || '';
  }
  
  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.apiService.updateOrderStatus(orderId, 5).subscribe({
        next: () => {
          // Update the order status locally
          if (this.selectedOrder && this.selectedOrder.id === orderId) {
            this.selectedOrder.status = 5;
          }
          
          // Update the status in the orders list
          const index = this.orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            this.orders[index].status = 5;
          }
        },
        error: (err) => {
          this.error = 'Failed to cancel order';
          console.error(err);
        }
      });
    }
  }
  
  updateOrderStatus(orderId: number, newStatus: number): void {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        // Status updated successfully
        // No need to update locally as we're directly binding to the model
      },
      error: (err) => {
        this.error = 'Failed to update order status';
        console.error(err);
        
        // Revert the status change in UI
        if (this.selectedOrder) {
          // Get the original order from the list
          const originalOrder = this.orders.find(o => o.id === orderId);
          if (originalOrder) {
            this.selectedOrder.status = originalOrder.status;
          }
        }
      }
    });
  }
  
  
}