import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ProductAnalysis = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Produtos
            </h1>
            <p className="text-sm text-muted-foreground">
              Análise seus gastos por produto
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Input 
            placeholder="Buscar produtos..."
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Most Bought Products */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Produtos Mais Comprados</h2>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: "Leite", quantity: 12, totalSpent: 89.88 },
                { name: "Pão", quantity: 8, totalSpent: 32.00 },
                { name: "Café", quantity: 6, totalSpent: 120.00 },
              ].map((product) => (
                <div 
                  key={product.name}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity}x comprado</p>
                  </div>
                  <p className="text-primary font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.totalSpent)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price History */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Histórico de Preços</h2>
                <p className="text-sm text-muted-foreground">Variação de preços</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Arroz 5kg", oldPrice: 21.90, currentPrice: 19.90, difference: -9.13 },
                { name: "Feijão 1kg", oldPrice: 6.90, currentPrice: 7.50, difference: 8.70 },
              ].map((item) => (
                <div 
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.oldPrice)}
                      </span>
                      <span className="text-foreground">
                        → {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.currentPrice)}
                      </span>
                    </div>
                  </div>
                  <p className={`font-medium ${item.difference < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.difference > 0 ? '+' : ''}{item.difference.toFixed(2)}%
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

export default ProductAnalysis;