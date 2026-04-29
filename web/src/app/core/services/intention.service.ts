import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Se o seu back-end rodar em outra porta, é só mudar aqui
const API_URL = 'http://localhost:3000/api/v1/intentions'; 

export interface Intention {
  id: string;
  description: string;
  categoryId?: string;
  installment_amount: number;
  months: number;
  desired_start_month: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // <-- A mágica aqui!
}

@Injectable({
  providedIn: 'root'
})
export class IntentionService {

  constructor(private http: HttpClient) {}

  // 1. Busca todas as intenções
  getAll(): Observable<Intention[]> {
    return this.http.get<Intention[]>(API_URL);
  }

  // 2. Cria uma nova intenção
  create(data: any): Observable<any> {
    return this.http.post(API_URL, data);
  }

  // 3. Atualiza (Editar)
  update(id: string, data: any): Observable<any> {
    return this.http.patch(`${API_URL}/${id}`, data);
  }

  // 4. Aprova a intenção (Botão verde)
  approve(id: string): Observable<any> {
    return this.http.patch(`${API_URL}/${id}/approve`, {});
  }

  // 5. Adia a intenção (Botão vermelho)
  postpone(id: string): Observable<any> {
    // Confirme com o Henrique se a rota é /postpone, /reject ou /cancel
    return this.http.patch(`${API_URL}/${id}/postpone`, {}); 
  }

  // 6. Deleta a intenção (Lixeira)
  remove(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }
}