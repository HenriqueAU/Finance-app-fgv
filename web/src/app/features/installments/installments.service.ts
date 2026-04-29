import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstallmentsService {
  private apiUrl = 'http://localhost:3000/api/v1/installments';
  private categoriesUrl = 'http://localhost:3000/api/v1/categories';

  constructor(private http: HttpClient) {}

  getInstallments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createInstallment(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteInstallment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoriesUrl);
  }
}