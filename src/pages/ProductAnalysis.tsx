
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

const ProductAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<{
    lowestPrice: { price: number; date: string; market: string } | null;
    highestPrice: { price: number; date: string; market: string } | null;
    totalSpent: number;
    totalQuantity: number;
  }>({
    lowestPrice: null,
    highestPrice: null,
    totalSpent: 0,
    totalQuantity: 0
  });
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchProductHistory = async (productName: string) => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .order('data_compra', { ascending: true });

      if (error) throw error;

      const history: any[] = [];
      const purchases: any[] = [];
      let lowestPrice = { price: Infinity, date: '', market: '' };
      let highestPrice = { price: -Infinity, date: '', market: '' };
      let totalSpent = 0;
      let totalQuantity = 0;

      receipts?.forEach(receipt => {
        const items = receipt.items as any[];
        items.forEach(item => {
          if (item.productName.toLowerCase() === productName.toLowerCase()) {
            const quantity = Number(item.quantity);
            const total = Number(item.total);
            const pricePerUnit = total / quantity; // Calcula o preço por unidade baseado no total
            const date = new Date(receipt.data_compra).toISOString().split('T')[0];

            // Adicionar ao histórico de preços (usando preço por unidade para o gráfico)
            history.push({
              date,
              price: pricePerUnit
            });

            // Adicionar ao histórico de compras
            purchases.push({
              date,
              price: pricePerUnit,
              market: receipt.mercado,
              quantity,
              total
            });

            // Atualizar menor preço (agora usando o preço por unidade real)
            if (pricePerUnit < lowestPrice.price) {
              lowestPrice = {
                price: pricePerUnit,
                date,
                market: receipt.mercado
              };
            }

            // Atualizar maior preço (agora usando o preço por unidade real)
            if (pricePerUnit > highestPrice.price) {
              highestPrice = {
                price: pricePerUnit,
                date,
                market: receipt.mercado
              };
            }

            // Acumula o total gasto e quantidade
            totalSpent += total;
            totalQuantity += quantity;
          }
        });
      });

      setPriceHistory(history);
      setPurchaseHistory(purchases);
      setProductStats({
        lowestPrice: lowestPrice.price !== Infinity ? lowestPrice : null,
        highestPrice: highestPrice.price !== -Infinity ? highestPrice : null,
        totalSpent,
        totalQuantity
      });

    } catch (error) {
      console.error('Error fetching product history:', error);
    }
  };

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearch.length < 3) {
        setProducts([]);
        return;
      }

      try {
        const { data: receipts, error } = await supabase
          .from('receipts')
          .select('items')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        if (receipts) {
          const allProducts = new Set<string>();
          receipts.forEach(receipt => {
            const items = receipt.items as any[];
            items.forEach(item => {
              if (item.productName.toLowerCase().includes(debouncedSearch.toLowerCase())) {
                allProducts.add(item.productName);
              }
            });
          });

          setProducts(Array.from(allProducts));
        }
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Análise de Produtos
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe os preços e histórico de compras
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Input 
              placeholder="Buscar produtos..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Search Results */}
          {products.length > 0 && searchTerm.length >= 3 && !selectedProduct && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <ul className="py-2">
                {products.map((product, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 hover:bg-secondary cursor-pointer"
                    onClick={() => {
                      setSearchTerm(product);
                      setSelectedProduct(product);
                      fetchProductHistory(product);
                    }}
                  >
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {selectedProduct && (
          <>
            {/* Product Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Menor Preço</h3>
                  <div className="space-y-1">
                    {productStats.lowestPrice && (
                      <>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(productStats.lowestPrice.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(productStats.lowestPrice.date).toLocaleDateString('pt-BR')} - {productStats.lowestPrice.market}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Maior Preço</h3>
                  <div className="space-y-1">
                    {productStats.highestPrice && (
                      <>
                        <p className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(productStats.highestPrice.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(productStats.highestPrice.date).toLocaleDateString('pt-BR')} - {productStats.highestPrice.market}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Total Gasto</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-600">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(productStats.totalSpent)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {productStats.totalQuantity} unidades
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Variation Chart */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Variação de Preço</h3>
                <div className="h-64">
                  <ChartContainer config={{}}>
                    <LineChart data={priceHistory}>
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--primary))"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      />
                      <YAxis 
                        stroke="hsl(var(--primary))"
                        tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                      <ChartTooltip />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Purchase History Table */}
            <Card className="shadow-sm mb-20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Histórico de Compras</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Mercado</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistory.map((purchase, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(purchase.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{purchase.market}</TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(purchase.price)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(purchase.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductAnalysis;
