import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MonthProjection } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class ProjectionService { // Nome igual ao real para facilitar troca no Dia 4
  getMonthProjection(month: string): Observable<MonthProjection> {
    return of({
      month,
      salary: 5000,
      totalFixed: 1380,
      totalInstallments: 350,
      totalIntentions: 0,
      available: 3270,
      emergencyReserve: 500,
      freeToSpend: 2770,
      isCritical: false
    }); 
  }
}