import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule],
})
export class LoginComponent implements OnInit {
  loginData = {
    username: '',
    password: ''
  };
  
  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  showRegisterForm = false;
  returnUrl: string = '/';
  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = 'Invalid username or password';
          this.loading = false;
          console.error(error);
        }
      });
  }

  onRegister(): void {
    // Password validation
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.authService.register({
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password
    }).subscribe({
      next: () => {
        // Auto login after successful registration
        this.authService.login(this.registerData.username, this.registerData.password)
          .subscribe({
            next: () => {
              this.router.navigate([this.returnUrl]);
            },
            error: (error) => {
              this.error = 'Registration successful but failed to log in. Please log in manually.';
              this.showRegisterForm = false;
              this.loading = false;
              console.error(error);
            }
          });
      },
      error: (error) => {
        if (error.error && typeof error.error === 'object') {
          // Handle specific validation errors
          let errorMessages = [];
          for (const key in error.error) {
            if (error.error.hasOwnProperty(key)) {
              errorMessages.push(`${key}: ${error.error[key]}`);
            }
          }
          this.error = errorMessages.join('. ');
        } else {
          this.error = 'Registration failed. Please try again.';
        }
        this.loading = false;
        console.error(error);
      }
    });
  }

  toggleForm(): void {
    this.showRegisterForm = !this.showRegisterForm;
    this.error = '';
  }
}