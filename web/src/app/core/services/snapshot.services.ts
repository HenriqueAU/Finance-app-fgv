import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlySnapshot } from '../../shared/types/index';

@Injectable({ providedIn: 'root' })
export class SnapshotsService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getCurrent(): Observable<MonthlySnapshot | null> {
    return this.http.get<MonthlySnapshot | null>(`${this.apiUrl}/snapshots/current`);
  }

  getByMonth(month: string): Observable<MonthlySnapshot | null> {
    return this.http.get<MonthlySnapshot | null>(`${this.apiUrl}/snapshots/${month}`);
  }
}
