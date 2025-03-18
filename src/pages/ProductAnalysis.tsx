import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { TopProductsList } from "@/components/TopProductsList";
import { MonthFilter } from "@/components/MonthFilter";
import { toast } from "sonner";
import { getNormalizedProducts, getProductHistory } from "@/services/productService";

const ProductAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [normalizedProducts, setNormalizedProducts] = useState<Array<{id: string, normalized_name: string}>>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  const fetchTopProducts = async () => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filteredReceipts = filterByMonth(receipts, 'data_compra');

      const productMap = new Map<string, { quantity: number; total: number }>();

      filteredReceipts?.forEach(receipt => {
        const items = receipt.items as any[];
        items.forEach(item => {
          const currentProduct = productMap.get(item.productName) || { quantity: 0, total: 0 };
          const quantity = Number(item.quantity);
          const total = Number(item.total);

          if (!isNaN(quantity) && !isNaN(total) && quantity > 0) {
            productMap.set(item.productName, {
              quantity: currentProduct.quantity + quantity,
              total: currentProduct.total + total
            });
          }
        });
      });

      const sortedProducts = Array.from(productMap.entries())
        .map(([name, stats]) => ({
          name,
          quantity: stats.quantity,
          total: stats.total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const loadProductHistory = async (productId: string, productName: string) => {
    try {
      setIsSearching(true);
      
      const result = await getProductHistory(productId);
      
      setPriceHistory(result.priceHistory);
      setPurchaseHistory(result.purchaseHistory);
      setProductStats(result.productStats);
      setSelectedProductId(productId);
      setSelectedProductName(productName);
      
      setIsSearching(false);
    } catch (error) {
      console.error('Error loading product history:', error);
      toast.error('Erro ao carregar histórico do produto');
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      loadProductHistory(selectedProductId, selectedProductName || '');
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchTopProducts();
  }, [selectedMonth]);

  useEffect(() => {
    const searchNormalizedProducts = async () => {
      setIsSearching(true);
      setShowResults(false);
      
      try {
        if (debouncedSearch.length < 2) {
          setNormalizedProducts([]);
          setIsSearching(false);
          return;
        }

        console.log('Searching for normalized products with term:', debouncedSearch);
        
        const products = await getNormalizedProducts(debouncedSearch);
        
        console.log('Found normalized products:', products);
        setNormalizedProducts(products);
        
        if (debouncedSearch.length >= 2) {
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching normalized products:', error);
        toast.error('Erro ao buscar produtos');
      } finally {
        setIsSearching(false);
      }
    };

    searchNormalizedProducts();
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);
    
    // Reset selected product when search term changes
    if (selectedProductName && value !== selectedProductName) {
      setSelectedProductId(null);
      setSelectedProductName(null);
    }
    
    // Show search results when typing
    if (value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
      setNormalizedProducts([]);
    }
  };

  const handleProductSelect = (productId: string, productName: string) => {
    console.log('Product selected:', productId, productName);
    setSearchTerm(productName);
    loadProductHistory(productId, productName);
    setShowResults(false); // Hide results after selection
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setSelectedProductId(null);
    setSelectedProductName(null);
    setNormalizedProducts([]);
    setShowResults(false);
  };

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

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input 
              placeholder="Buscar produtos..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            {searchTerm && (
              <button 
                onClick={handleSearchClear}
                className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
          <MonthFilter
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
          />
          
          {/* Search Results */}
          {normalizedProducts.length > 0 && showResults && !selectedProductId && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <ul className="py-2">
                {normalizedProducts.map((product, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 hover:bg-secondary cursor-pointer"
                    onClick={() => handleProductSelect(product.id, product.normalized_name)}
                  >
                    {product.normalized_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {isSearching && searchTerm.length >= 2 && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <div className="px-4 py-2 text-sm text-muted-foreground">Buscando produtos...</div>
            </div>
          )}
          
          {normalizedProducts.length === 0 && searchTerm.length >= 2 && !isSearching && !selectedProductId && showResults && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <div className="px-4 py-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>
            </div>
          )}
        </div>

        {selectedProductId ? (
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
                      <TableHead>Nome Original</TableHead>
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
                        <TableCell>{purchase.productName}</TableCell>
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
        ) : (
          <div className="mb-20">
            <TopProductsList products={topProducts} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductAnalysis;
