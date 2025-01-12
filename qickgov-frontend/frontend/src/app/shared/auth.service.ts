import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import tap operator
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private tokenKey = 'access_token';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  login(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/login`, payload).pipe(
      tap((response: any) => {
        if (response.status === 'success' && response.token) {
          this.storeToken(response.token);
          this.checkUserId(response.token).subscribe((userId) => {
            if (userId) {
              this.userService.setUserId(userId);
            } else {
              console.log('User ID not found');
            }
          });
        }
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/create`, payload);
  }

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  checkExistingToken(): void {
    const token = this.getToken();
    if (token) {
      console.log('Existing token found:', token);
      this.checkUserId(token).subscribe((userId) => {
        if (userId) {
          this.userService.setUserId(userId);
          this.router.navigate(['/home']);
        } else {
          console.log('User ID not found');
          this.router.navigate(['/login']);
        }
      });
    }
  }

  checkUserId(token: string): Observable<string> {
    return this.http
      .get(`${this.apiUrl}/api/user/id`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(map((response: any) => response.data.id));
  }
}
