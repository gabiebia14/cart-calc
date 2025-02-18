
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
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Mock data - replace with real data later
  const priceHistory = [
    { date: '2024-01', price: 5.99 },
    { date: '2024-02', price: 6.49 },
    { date: '2024-03', price: 5.79 },
    { date: '2024-04', price: 6.29 },
  ];

  const purchaseHistory = [
    { date: '2024-04-01', price: 6.29, market: 'Mercado A', quantity: 2 },
    { date: '2024-03-15', price: 5.79, market: 'Mercado B', quantity: 1 },
    { date: '2024-02-28', price: 6.49, market: 'Mercado C', quantity: 3 },
  ];

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
          // Extrair todos os nomes de produtos únicos dos recibos
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
          {products.length > 0 && searchTerm.length >= 3 && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <ul className="py-2">
                {products.map((product, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 hover:bg-secondary cursor-pointer"
                    onClick={() => {
                      setSearchTerm(product);
                      // TODO: Implementar seleção do produto
                    }}
                  >
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Product Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Menor Preço</h3>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">R$ 5,79</p>
                <p className="text-sm text-muted-foreground">15/03/2024 - Mercado B</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Maior Preço</h3>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600">R$ 6,49</p>
                <p className="text-sm text-muted-foreground">28/02/2024 - Mercado C</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Total Gasto</h3>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-purple-600">R$ 32,45</p>
                <p className="text-sm text-muted-foreground">6 unidades</p>
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
                  <XAxis dataKey="date" stroke="hsl(var(--primary))" />
                  <YAxis stroke="hsl(var(--primary))" />
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
        <Card className="shadow-sm mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Histórico de Compras</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Mercado</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory.map((purchase, index) => (
                  <TableRow key={index}>
                    <TableCell>{purchase.date}</TableCell>
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
                      }).format(purchase.price * purchase.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Product Category */}
        <Card className="shadow-sm mb-20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Categoria do Produto</h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                Alimentos
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                Básicos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductAnalysis;
