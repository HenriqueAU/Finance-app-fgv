import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  color: string;
  is_essential: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = 'http://localhost:3000/api/v1/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}`);
  }

  create(dto: { name: string; color: string, is_essential: boolean}): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<{ name: string; color: string }>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
