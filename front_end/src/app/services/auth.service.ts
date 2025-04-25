import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';  // Corrected import for jwt-decode

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';  // API URL
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter for the current user value
  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  // Decode JWT token and check if it is expired
  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      return decodedToken.exp < currentTime;
    } catch (e) {
      return true; // If decoding fails, consider the token expired
    }
  }

  // Helper to get the authorization header with Bearer token
  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = user?.token;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Login method to authenticate user and store tokens
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/token/`, { username, password })
      .pipe(
        map(response => {
          // Store user details and JWT token in local storage
          const user = {
            username,
            token: response.access,
            refreshToken: response.refresh
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return response;
        }),
        catchError(error => {
          return throwError(() => error); // Error handling
        })
      );
  }

  // Register method to register a new user
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, userData)
      .pipe(
        catchError(error => throwError(() => error)) // Handle any registration errors
      );
  }

  // Logout method to remove user data and token
  logout() {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Refresh token method to get a new access token using the refresh token
  refreshToken(): Observable<any> {
    const refreshToken = this.currentUserValue?.refreshToken;
    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    return this.http.post<any>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap(tokens => {
          // Update stored tokens
          const user = this.currentUserValue;
          user.token = tokens.access;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => throwError(() => error)) // Error handling for refresh token
      );
  }

  // Check if the user is logged in by validating the token
  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    if (user && user.token) {
      return !this.isTokenExpired(user.token);  // Check if the token is expired
    }
    return false;
  }

  
isAdmin(): boolean {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // Check for Django's staff or superuser status
  return user?.is_staff === true || user?.is_superuser === true;
}

// Get the username of the currently logged in user
getUserName(): string | null {
  const user = this.currentUserValue;
  if (user && user.username) {
    return user.username;
  }
  return null;
}
}
