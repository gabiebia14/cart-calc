import { supabase } from "@/integrations/supabase/client";
import { Receipt, ReceiptItem } from "@/types/receipt";
import { validateReceiptData } from "@/utils/receiptUtils";
import { Json } from "@/integrations/supabase/types";
import { normalizeProductName } from "./productService";

export const fetchReceiptsList = async () => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (data) {
    return data.map(receipt => ({
      ...receipt,
      items: (receipt.items as any[]).map(item => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        validFormat: Boolean(item.validFormat)
      }))
    })) as Receipt[];
  }

  return [];
};

export const deleteReceipt = async (id: string) => {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const uploadReceiptImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (error) throw error;

  return filePath;
};

export const processReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const functionResponse = await supabase.functions.invoke('analyze-receipt', {
    body: formData,
  });

  if (functionResponse.error) {
    throw new Error('Erro ao analisar o recibo: ' + functionResponse.error.message);
  }

  // Limpa a resposta de markdown caso necessário
  const result = functionResponse.data.result;
  const cleanedResult = result.replace(/```json\n|\n```/g, '');
  return cleanedResult;
};

export const saveReceipt = async (items: any[], storeName: string, userId: string, purchaseDate?: string) => {
  // Calculate total based on corrected item totals
  const total = items.reduce((acc: number, item: any) => {
    return acc + Number(item.total);
  }, 0);

  // Convert ReceiptItem[] to a plain object array that matches Json type
  const jsonItems = items.map(item => ({
    productName: item.productName,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    total: Number(item.total),
    validFormat: Boolean(item.validFormat)
  })) as Json;

  const supabaseReceipt = {
    data_compra: purchaseDate || new Date().toISOString().split('T')[0],
    mercado: storeName,
    total: total,
    items: jsonItems,
    user_id: userId
  };

  const { error: dbError, data: receipt } = await supabase
    .from('receipts')
    .insert([supabaseReceipt])
    .select()
    .single();

  if (dbError) throw dbError;

  // After saving the receipt, normalize all product names in background
  if (receipt) {
    // Process product normalization in background without waiting for it
    setTimeout(async () => {
      try {
        if (items && items.length > 0) {
          console.log('Starting product name normalization for new receipt items');
          
          for (const item of items) {
            if (item.productName) {
              await normalizeProductName(item.productName);
            }
          }
          
          console.log('Completed product name normalization for new receipt items');
        }
      } catch (error) {
        console.error('Error normalizing product names:', error);
      }
    }, 0);

    return {
      ...receipt,
      items: (receipt.items as any[]).map(item => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        validFormat: Boolean(item.validFormat)
      }))
    } as Receipt;
  }

  throw new Error('Erro ao salvar recibo');
};
