import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { Category } from '../models/category';
import { Order } from '../models/order';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Helper to get the authorization header with Bearer token
  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = user?.token;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Product endpoints
  getProducts(params: any = {}): Observable<Product[]> {
    const headers = this.getAuthHeaders(); // Get auth header
    
    // Optional: build HttpParams if needed
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    return this.http.get<Product[]>(`${this.apiUrl}/products/`, {
      headers,
      params: httpParams
    });
  }

  getProduct(id: number): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/`, { headers });
  }

  createProduct(product: Product): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(`${this.apiUrl}/products/`, product, { headers });
  }

  updateProduct(product: Product): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.put<Product>(`${this.apiUrl}/products/${product.id}/`, product, { headers });
  }

  deleteProduct(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/products/${id}/`, { headers });
  }

  // Category endpoints
  getCategories(): Observable<Category[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`, { headers });
  }

  createCategory(category: Category): Observable<Category> {
    const headers = this.getAuthHeaders();
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category, { headers });
  }

  // Order endpoints
  // getOrders(): Observable<Order[]> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.get<Order[]>(`${this.apiUrl}/orders/`, { headers });
  // }

  getOrder(id: number): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}/`, { headers });
  }

  createOrder(order: any): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.post<Order>(`${this.apiUrl}/orders/`, order, { headers });
  }

  updateOrder(order: Order): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.put<Order>(`${this.apiUrl}/orders/${order.id}/`, order, { headers });
  }

  deleteOrder(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/orders/${id}/`, { headers });
  }

  // User profile endpoints
  getUserProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/profile/`, { headers });
  }

  updateUserProfile(userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/profile/update/`, userData, { headers });
  }
  updateProductStock(productId: number, newStockCount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    
    // First get the full product
    return this.getProduct(productId).pipe(
      switchMap(product => {
        // Update only the stock property
        product.stock = newStockCount;
        // Send the full product back
        return this.http.put(`${this.apiUrl}/products/${productId}/`, product, { headers });
      })
    );
  }
  updateOrderStatus(orderId: number, newStatus: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/`, { status: newStatus }, {
      headers: this.getAuthHeaders()
    });
  }
  checkAdminStatus(): Observable<{is_admin: boolean}> {
    const headers = this.getAuthHeaders();
    return this.http.get<{is_admin: boolean}>(`${this.apiUrl}/check-admin-status/`, { headers });
  }
  getUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/users/`, { headers });
  }
  
  // Get orders with optional filtering
  getOrders(params: any = {}): Observable<Order[]> {
    const headers = this.getAuthHeaders();
    
    // Build HttpParams for filtering
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`, {
      headers,
      params: httpParams
    });
  }
  

}
