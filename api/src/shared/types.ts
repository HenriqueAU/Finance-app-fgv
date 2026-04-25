export type MonthYear = string;

export type IntentionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ExpenseType = 'fixed' | 'installment' | 'intention' | 'investment';

export interface MonthProjection {
  month: MonthYear;
  salary: number;
  totalFixed: number;
  totalInstallments: number;
  totalIntentions: number;
  available: number;
  emergencyReserve: number;
  freeToSpend: number;
  isCritical: boolean;
}

export interface ViabilityResult {
  viable: boolean;
  criticalMonths: MonthYear[];
  projection: MonthProjection[];
}
