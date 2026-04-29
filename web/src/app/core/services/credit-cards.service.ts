import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closing_day: number;   
  payment_due_day: number;  
}

export interface CreditCardUsage {
  id: string;
  name: string;
  limit: number;
  used: number;
  available: number;
  usagePercentage: number;
}

export interface CreateCreditCardDto extends Omit<CreditCard, 'id'> {}

@Injectable({ providedIn: 'root' })
export class CreditCardService {
  private apiUrl = `${environment.apiUrl}/credit-cards`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(this.apiUrl);
  }

  getDashboardCardsUsage(month: string): Observable<CreditCardUsage[]> {
    return this.http.get<CreditCardUsage[]>(`${this.apiUrl}/usage/${month}`);
  }

  create(data: CreateCreditCardDto): Observable<CreditCard> {
    return this.http.post<CreditCard>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateCreditCardDto>): Observable<CreditCard> {
    return this.http.patch<CreditCard>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}