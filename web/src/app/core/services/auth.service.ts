import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post<any>(`${this.API}/login`, credentials).pipe(
      tap(res => localStorage.setItem('access_token', res.accessToken)) 
    );
  }

  register(userData: any) {
    return this.http.post(`${this.API}/register`, userData); 
  }
}