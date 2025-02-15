
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptList } from "@/components/ReceiptList";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { useState, useEffect } from "react";
import { Receipt } from "@/types/receipt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Erro ao carregar recibos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReceipts(receipts.filter(receipt => receipt.id !== id));
      toast.success('Recibo excluído com sucesso');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Erro ao excluir recibo');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para enviar recibos');
        return;
      }

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Analyze receipt with Edge Function
      const formData = new FormData();
      formData.append('file', file);

      const functionResponse = await supabase.functions.invoke('analyze-receipt', {
        body: formData,
      });

      if (functionResponse.error) {
        throw new Error(functionResponse.error.message);
      }

      const receiptData = functionResponse.data.result;
      let parsedData;
      try {
        parsedData = JSON.parse(receiptData);
      } catch (e) {
        console.error('Error parsing receipt data:', e);
        throw new Error('Erro ao processar dados do recibo');
      }

      // Calculate total from items
      const total = parsedData.reduce((acc: number, item: any) => {
        if (item.validFormat && item.total) {
          return acc + Number(item.total);
        }
        return acc;
      }, 0);

      // Create receipt record in the database
      const newReceipt = {
        data_compra: new Date().toISOString(),
        mercado: 'Mercado Local', // Você pode customizar isso depois
        total: total,
        items: parsedData,
        user_id: session.user.id
      };

      const { error: dbError, data: receipt } = await supabase
        .from('receipts')
        .insert([newReceipt])
        .select()
        .single();

      if (dbError) throw dbError;

      if (receipt) {
        setReceipts([receipt, ...receipts]);
        toast.success('Recibo processado com sucesso!');
      }
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      toast.error(error.message || 'Erro ao enviar recibo');
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Recibos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus comprovantes
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <ReceiptUploader onUpload={handleUpload} />

        {/* Receipt List */}
        <Card className="shadow-sm mt-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Recibos Processados</h2>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <ReceiptList receipts={receipts} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Receipts;
