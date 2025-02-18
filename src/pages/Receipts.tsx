
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptList } from "@/components/ReceiptList";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { useState, useEffect } from "react";
import { Receipt } from "@/types/receipt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const typedReceipts: Receipt[] = data.map(receipt => ({
          ...receipt,
          items: (receipt.items as any[]).map(item => ({
            productName: item.productName,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
            validFormat: item.validFormat
          }))
        }));
        setReceipts(typedReceipts);
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      setError('Não foi possível carregar os recibos. Tente novamente mais tarde.');
      toast.error('Erro ao carregar recibos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      setReceipts(receipts.filter(receipt => receipt.id !== id));
      
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) {
        await fetchReceipts();
        throw error;
      }

      toast.success('Recibo excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast.error('Erro ao excluir recibo. Tente novamente.');
      setError('Não foi possível excluir o recibo. Tente novamente.');
    }
  };

  const validateReceiptData = (data: any) => {
    if (!data.store_info || !data.items || !Array.isArray(data.items)) {
      throw new Error('Formato de dados inválido');
    }

    const validItems = data.items.filter(item => {
      return (
        item.productName &&
        typeof item.quantity === 'number' &&
        typeof item.unitPrice === 'number' &&
        typeof item.total === 'number' &&
        typeof item.validFormat === 'boolean'
      );
    });

    if (validItems.length === 0) {
      throw new Error('Nenhum item válido encontrado no recibo');
    }

    return {
      items: validItems,
      storeName: data.store_info.name || 'Estabelecimento não identificado'
    };
  };

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Você precisa estar logado para enviar recibos');
      }

      // Validação do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, envie apenas arquivos de imagem');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('O arquivo é muito grande. Tamanho máximo: 5MB');
      }

      // Upload da imagem
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
      }

      // Análise do recibo
      toast.loading('Processando recibo...');
      const formData = new FormData();
      formData.append('file', file);

      const functionResponse = await supabase.functions.invoke('analyze-receipt', {
        body: formData,
      });

      if (functionResponse.error) {
        throw new Error('Erro ao analisar o recibo: ' + functionResponse.error.message);
      }

      // Processamento dos dados
      const receiptData = functionResponse.data.result;
      let parsedData;
      try {
        parsedData = JSON.parse(receiptData);
      } catch (e) {
        console.error('Error parsing receipt data:', e);
        throw new Error('Erro ao processar dados do recibo');
      }

      // Validação dos dados
      const { items, storeName } = validateReceiptData(parsedData);

      // Cálculo do total
      const total = items.reduce((acc: number, item: any) => {
        if (item.validFormat && item.total) {
          return acc + Number(item.total);
        }
        return acc;
      }, 0);

      // Criação do recibo
      const newReceipt = {
        data_compra: new Date().toISOString(),
        mercado: storeName,
        total: total,
        items: items,
        user_id: session.user.id
      };

      const { error: dbError, data: receipt } = await supabase
        .from('receipts')
        .insert([newReceipt])
        .select()
        .single();

      if (dbError) {
        throw new Error('Erro ao salvar recibo no banco de dados');
      }

      if (receipt) {
        setReceipts([receipt, ...receipts]);
        toast.success(`Recibo processado com sucesso! ${items.length} itens encontrados.`);
      }
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      setError(error.message || 'Erro ao processar recibo');
      toast.error(error.message || 'Erro ao enviar recibo');
      
      // Tenta recuperar os recibos em caso de erro
      await fetchReceipts();
    } finally {
      setIsProcessing(false);
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        <ReceiptUploader onUpload={handleUpload} isProcessing={isProcessing} />

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
