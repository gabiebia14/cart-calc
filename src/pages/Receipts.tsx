
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptList } from "@/components/ReceiptList";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { ReceiptsHeader } from "@/components/ReceiptsHeader";
import { MonthFilter } from "@/components/MonthFilter";
import { useState, useEffect } from "react";
import { Receipt } from "@/types/receipt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchReceiptsList, deleteReceipt, uploadReceiptImage, processReceipt, saveReceipt } from "@/services/receiptService";
import { validateReceiptData } from "@/utils/receiptUtils";
import { format, parseISO } from "date-fns";

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [selectedMonth, receipts]);

  const filterReceipts = () => {
    if (selectedMonth === "all") {
      setFilteredReceipts(receipts);
      return;
    }

    const filtered = receipts.filter((receipt) => {
      const receiptDate = parseISO(receipt.data_compra);
      const receiptMonth = format(receiptDate, "MM-yyyy");
      return receiptMonth === selectedMonth;
    });

    setFilteredReceipts(filtered);
  };

  const fetchReceipts = async () => {
    try {
      setError(null);
      const data = await fetchReceiptsList();
      setReceipts(data);
      setFilteredReceipts(data);
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
      
      await deleteReceipt(id);
      toast.success('Recibo excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast.error('Erro ao excluir recibo. Tente novamente.');
      setError('Não foi possível excluir o recibo. Tente novamente.');
      await fetchReceipts();
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);
      setProcessedCount(prev => prev + 1);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Você precisa estar logado para enviar recibos');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, envie apenas arquivos de imagem');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('O arquivo é muito grande. Tamanho máximo: 5MB');
      }

      await uploadReceiptImage(file);
      
      const receiptData = await processReceipt(file);
      
      let parsedData;
      try {
        parsedData = JSON.parse(receiptData);
        console.log('Parsed receipt data:', parsedData);
      } catch (e) {
        console.error('Error parsing receipt data:', e);
        throw new Error('Erro ao processar dados do recibo');
      }

      const { items, storeName, purchaseDate } = validateReceiptData(parsedData);
      
      const newReceipt = await saveReceipt(items, storeName, session.user.id, purchaseDate);
      setReceipts(prev => [newReceipt, ...prev]);

      toast.success(`Recibo ${processedCount} de ${totalToProcess} processado com sucesso! ${items.length} itens encontrados.`);

      if (processedCount >= totalToProcess) {
        setProcessedCount(0);
        setTotalToProcess(0);
        setIsProcessing(false);
      }

    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      setError(error.message || 'Erro ao processar recibo');
      toast.error(error.message || 'Erro ao enviar recibo');
      await fetchReceipts();
      setIsProcessing(false);
      setProcessedCount(0);
      setTotalToProcess(0);
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-md mx-auto p-4 pb-20">
        <ReceiptsHeader />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <ReceiptUploader onUpload={handleUpload} isProcessing={isProcessing} />

        <Card className="shadow-sm mt-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-foreground">Recibos Processados</h2>
                  <p className="text-sm text-muted-foreground">Filtrar por mês</p>
                </div>
              </div>
              <MonthFilter
                selectedMonth={selectedMonth}
                onMonthSelect={setSelectedMonth}
              />
            </div>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <ReceiptList receipts={filteredReceipts} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Receipts;
