export type MonthYear = string;

export type IntentionStatus =
  | 'pendente'
  | 'aprovada'
  | 'rejeitada'
  | 'cancelada';

export type ExpenseType = 'fixed' | 'installment' | 'intention';

export type InstallmentType = 'regular' | 'outros';

export type ExpensePaymentStatus = 'pending' | 'paid';

export interface MonthProjection {
  month: MonthYear;
  salary: number;
  totalFixed: number;
  totalInstallments: number;
  totalIntentions: number;
  available: number;
  emergencyReserve: number;
  snapshot: number;
  savings: number;
  cardDebt: number;
  freeToSpend: number;
  isCritical: boolean;
}

export interface ViabilityResult {
  viable: boolean;
  criticalMonths: MonthYear[];
  projection: MonthProjection[];
}

export interface MonthlySnapshot {
  id: string;
  userId: string;
  month: MonthYear;
  freeToSpend: number;
  createdAt: Date;
}

export interface CardUsage {
  creditCardId: string;
  month: MonthYear;
  limit: number;
  committed: number;
  previousDebt: number;
  totalOwed: number;
  available: number;
}

export interface ExpensePayment {
  id: string;
  expenseId: string;
  userId: string;
  month: MonthYear;
  paidAt: Date | null;
  status: ExpensePaymentStatus;
  createdAt: Date;
}

export interface CardPayment {
  id: string;
  userId: string;
  creditCardId: string;
  month: MonthYear;
  amountPaid: number;
  createdAt: Date;
}
