import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ProductAnalysis = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-primary p-4">
        <h1 className="text-xl font-semibold mb-4 text-primary-foreground">Produtos</h1>
        <div className="relative">
          <Input 
            placeholder="Buscar produtos..."
            className="w-full pl-10 bg-white/10 border-none text-primary-foreground placeholder:text-primary-foreground/60"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-foreground/60" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Most Bought Products */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">Produtos Mais Comprados</h2>
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
                    R$ {product.totalSpent.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price History */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">Histórico de Preços</h2>
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
                        R$ {item.oldPrice.toFixed(2)}
                      </span>
                      <span className="text-foreground">
                        → R$ {item.currentPrice.toFixed(2)}
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