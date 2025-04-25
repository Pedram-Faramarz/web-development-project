import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.token) {
      request = this.addToken(request, currentUser.token);
    }

    console.log('Request with Authorization Header:', request.headers);

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const errorDetail = error?.error?.detail || '';

          console.log('401 Error: ', errorDetail);

          if (errorDetail.includes('token not valid')) {
            this.authService.logout();
            return throwError(() => new Error('Session expired. Please login again.'));
          }

          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    console.log('Adding token to request:', token);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;

          const currentUser = this.authService.currentUserValue;
          const updatedUser = {
            ...currentUser,
            token: token.access
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          this.refreshTokenSubject.next(token.access);
          return next.handle(this.addToken(request, token.access));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(jwt => next.handle(this.addToken(request, jwt!)))
      );
    }
  }
}
