export type TxType = 'income' | 'expense';

export interface Transaction {
  id: number;
  name: string;
  cat: string;
  type: TxType;
  amount: number;
  date: string; // e.g. "วันนี้", "เมื่อวาน", "22 ก.ย.", or "2026-09-24"
  rawDate?: string; // ISO date string YYYY-MM-DD for precise filtering
  note?: string;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  icon: string;
  deadline?: string; // e.g. "30 วัน", "ธ.ค. 2569", or date
  targetDays?: number; // target days to reach goal
}

export interface CategoryInfo {
  id?: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  color?: string;
}

export interface BudgetMap {
  [category: string]: number;
}

export type PageId =
  | 'dashboard'
  | 'transactions'
  | 'analysis'
  | 'goals'
  | 'budget'
  | 'categories'
  | 'ai'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserSettings {
  userName: string;
  currencySymbol: string;
  monthlySavingsTarget: number;
  enableAlerts: boolean;
}
