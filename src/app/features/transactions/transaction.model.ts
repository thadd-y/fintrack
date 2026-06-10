export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}