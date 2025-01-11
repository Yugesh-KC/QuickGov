import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isValidUser: boolean = false;
  skipLogin: boolean = false;
  loginText: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  onLogin() {
    const email = this.email.trim();
    if (!email) {
      this.loginText = 'Please enter an email';
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email: email };

    this.http
      .post('http://localhost:8080/api/user/', body, { headers })
      .subscribe(
        (response: any) => {
          if (
            response.status === 'success' &&
            response.data &&
            response.data.ID
          ) {
            this.isValidUser = true;
            this.skipLogin = true;
            this.userService.setUserId(response.data.ID);
            console.log('User ID:', this.userService.getUserId());
            this.router.navigate(['user']);
          } else {
            this.isValidUser = false;
            this.skipLogin = false;
            this.loginText = 'Please enter a valid email or password';
          }
        },
        (error) => {
          console.error('Error during login:', error);
          this.isValidUser = false;
          this.skipLogin = false;
          this.loginText = 'Please enter a valid email or password';
        }
      );
  }

  onSkipLogin() {
    this.skipLogin = true;
    this.router.navigate(['/user']);
  }
}
