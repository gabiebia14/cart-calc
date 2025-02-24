
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ProductSelectorProps {
  onAdd: (products: { name: string; quantity: string }[]) => void;
}

export const ProductSelector = ({ onAdd }: ProductSelectorProps) => {
  const [products, setProducts] = useState<{ name: string; quantity: string; selected: boolean }[]>([]);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('items')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productSet = new Set<string>();
      receipts?.forEach(receipt => {
        const items = receipt.items as any[];
        items.forEach(item => {
          productSet.add(item.productName);
        });
      });

      setProducts(Array.from(productSet).map(name => ({
        name,
        quantity: "1",
        selected: false
      })));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleSubmit = () => {
    const selectedProducts = products
      .filter(p => p.selected)
      .map(({ name, quantity }) => ({ name, quantity }));
    
    if (selectedProducts.length > 0) {
      onAdd(selectedProducts);
      setProducts(products.map(p => ({ ...p, selected: false })));
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Produtos dos Recibos</h3>
            <button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm hover:opacity-90 transition-opacity"
            >
              Adicionar Selecionados
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {products.map((product, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                <Checkbox
                  checked={product.selected}
                  onCheckedChange={(checked) => {
                    setProducts(products.map((p, i) => 
                      i === index ? { ...p, selected: !!checked } : p
                    ));
                  }}
                />
                <span className="flex-1">{product.name}</span>
                <Input
                  type="text"
                  value={product.quantity}
                  onChange={(e) => {
                    setProducts(products.map((p, i) => 
                      i === index ? { ...p, quantity: e.target.value } : p
                    ));
                  }}
                  className="w-20"
                  placeholder="Qtd."
                />
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-center text-muted-foreground py-2">
                Nenhum produto encontrado nos recibos.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
