import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { ReceiptList } from "@/components/ReceiptList";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { useState } from "react";
import { Receipt } from "@/types/receipt";

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      date: new Date('2024-03-15'),
      storeName: 'Carrefour',
      total: 156.78,
      itemCount: 12,
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      date: new Date('2024-03-10'),
      storeName: 'Extra',
      total: 89.90,
      itemCount: 8,
      imageUrl: '/placeholder.svg'
    }
  ]);

  const handleDelete = (id: string) => {
    setReceipts(receipts.filter(receipt => receipt.id !== id));
  };

  const handleUpload = async (file: File) => {
    // Here we would normally process the image with OCR
    // For now, we'll just add a dummy receipt
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      date: new Date(),
      storeName: 'Novo Mercado',
      total: 0,
      itemCount: 0,
      imageUrl: URL.createObjectURL(file)
    };
    setReceipts([newReceipt, ...receipts]);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-md mx-auto p-4">
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
            <ReceiptList receipts={receipts} onDelete={handleDelete} />
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Receipts;