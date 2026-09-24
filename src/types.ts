export type TxType = 'income' | 'expense';

export interface Transaction {
  id: number;
  name: string;
  cat: string;
  type: TxType;
  amount: number;
  date: string;
  note?: string;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  icon: string;
  deadline?: string;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  isDefault?: boolean;
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
  | 'v5'
  | 'ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
