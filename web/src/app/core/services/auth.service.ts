import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginResponse } from '../../shared/types/index';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // 1. Tiramos o 'any' e colocamos o 'User' (ou Partial<User> se o tipo não tiver senha)
  register(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData);
  }

  // 2. Tiramos o 'any' e colocamos o 'LoginResponse'
  login(credentials: { email: string; password: string }): Observable<LoginResponse> { // credentials pode ficar como 'any' ou criar um LoginRequest { email, password }
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        // 3. Ajustado de response.token para response.accessToken
        if (response && response.accessToken) {
          localStorage.setItem('auth_token', response.accessToken);
        }
      })
    );
  }
  logout(): void {
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  updateProfile(data: { name?: string; email?: string }): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/me`, data);
  }

  updateSalary(data: { salary?: number; payday?: number }): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/me/salary`, data);
  }
}
