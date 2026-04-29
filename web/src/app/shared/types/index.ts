export type MonthYear = string; // Formato YYYY-MM [cite: 191, 366]

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

export interface User {
  id: string;
  name: string;
  email: string;
  salary: number;
  emergency_reserve: number;
  payday: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
