export type MonthYear = string;

export type IntentionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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

export interface User {
  id: string;
  name: string;
  email: string;
  salary: number;
  emergency_reserve: number;
  payday: number | null;
  savings: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
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
