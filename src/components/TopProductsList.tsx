import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export const TopProductsList = ({ products }: TopProductsListProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-lg text-foreground">Produtos Mais Comprados</h2>
            <p className="text-sm text-muted-foreground">Top 5 produtos</p>
          </div>
          <Package className="text-primary" size={20} />
        </div>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary w-6">{index + 1}</span>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                </div>
              </div>
              <span className="font-medium text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.total)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};