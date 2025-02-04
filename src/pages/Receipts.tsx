import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

const Receipts = () => {
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
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload de Recibos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Arraste e solte seus recibos aqui ou clique para selecionar
              </p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Selecionar Arquivo
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Recibos Recentes</h2>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { store: "Carrefour", date: "2024-02-15", total: 156.78 },
                { store: "Extra", date: "2024-02-10", total: 89.90 },
                { store: "Assaí", date: "2024-02-05", total: 234.56 },
              ].map((receipt) => (
                <div 
                  key={receipt.store + receipt.date}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">{receipt.store}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(receipt.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-primary font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Receipts;