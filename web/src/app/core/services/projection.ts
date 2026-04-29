import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthProjection } from '../../shared/types/index';

@Injectable({
  providedIn: 'root',
})
export class ProjectionService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getCurrent(): Observable<MonthProjection> {
    return this.http.get<MonthProjection>(`${this.apiUrl}/projection/current`);
  }

  getRange(from: string, to: string): Observable<MonthProjection[]> {
    return this.http.get<MonthProjection[]>(`${this.apiUrl}/projection/range?from=${from}&to=${to}`);
  }
}
