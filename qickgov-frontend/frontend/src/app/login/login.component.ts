import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isValidUser: boolean = false;
  skipLogin: boolean = false;
  loginText: string = '';
  isLoggedIn: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.isLoggedIn = true;
      this.router.navigate(['/home']); // Navigate to home if already logged in
    }
  }

  onLogin() {
    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.loginText = 'Please enter both email and password';
      return;
    }

    this.authService.login({ email, password }).subscribe(
      (response: any) => {
        if (response.status === 'success' && response.token) {
          this.authService.storeToken(response.token);
          this.isLoggedIn = true;
          console.log('JWT Token:', response.token);
          this.router.navigate(['/home']); // Navigate to home route
        } else {
          console.log('Unexpected response:', response);
          this.loginText = 'Login failed. Please check your credentials.';
        }
      },
      (error) => {
        console.error('Error during login:', error);
        this.loginText = 'An error occurred during login. Please try again.';
      }
    );
  }

  onSkipLogin() {
    this.skipLogin = true;
    this.router.navigate(['/home']);
  }
}
