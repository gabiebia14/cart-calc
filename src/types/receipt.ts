
export interface Receipt {
  id: string;
  data_compra: string;
  mercado: string;
  items: ReceiptItem[];
  total: number;
  created_at?: string;
  user_id?: string;
}

export interface ReceiptItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  validFormat?: boolean;
}
