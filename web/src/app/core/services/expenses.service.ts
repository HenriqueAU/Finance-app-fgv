import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id: string;
  description: string;
  category: { id: string; name: string; color: string } | null;
  amount: number;
  due_day: number | null;
  is_active: boolean;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  categoryId?: string;
  due_day?: number;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
  }

  create(dto: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, dto);
  }

  update(id: string, dto: Partial<CreateExpenseDto>): Observable<Expense> {
    return this.http.patch<Expense>(`${this.apiUrl}/expenses/${id}`, dto);
  }

  toggle(id: string): Observable<Expense> {
    return this.http.patch<Expense>(`${this.apiUrl}/expenses/${id}/toggle`, {});
  }

  getPaymentsByMonth(month: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses/payments/${month}`);
  }

  pay(expenseId: string, month: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/expenses/${expenseId}/payments/${month}/pay`, {});
  }

  unpay(expenseId: string, month: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/expenses/${expenseId}/payments/${month}/unpay`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }
}
