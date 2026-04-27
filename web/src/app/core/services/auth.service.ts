import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginResponse } from '../../shared/types/index'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  // 1. Tiramos o 'any' e colocamos o 'User' (ou Partial<User> se o tipo não tiver senha)
  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  // 2. Tiramos o 'any' e colocamos o 'LoginResponse'
  login(credentials: any): Observable<LoginResponse> { // credentials pode ficar como 'any' ou criar um LoginRequest { email, password }
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        // 3. Ajustado de response.token para response.accessToken 
        if (response && response.accessToken) {
          localStorage.setItem('auth_token', response.accessToken);
        }
      })
    );
  }
}