export interface Receipt {
  id: string;
  data_compra: string;
  mercado: string;
  items: any;
  total: number;
  created_at?: string;
  user_id?: string;
}