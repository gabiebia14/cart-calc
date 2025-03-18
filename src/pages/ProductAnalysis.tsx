
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
import { TopProductsList } from "@/components/TopProductsList";
import { MonthFilter } from "@/components/MonthFilter";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { normalizeProductName, isSameProduct, groupSimilarProducts } from "@/utils/productSimilarity";

const ProductAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<string[]>([]);
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

  const filterByMonth = (data: any[], dateField: string) => {
    if (selectedMonth === 'all') return data;
    return data.filter(item => {
      const itemDate = parseISO(item[dateField]);
      const itemMonth = format(itemDate, "MM-yyyy");
      return itemMonth === selectedMonth;
    });
  };

  const calculateUnitPrice = (total: number, quantity: number) => {
    return quantity > 0 ? total / quantity : 0;
  };

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

  const fetchProductHistory = async (productName: string) => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .order('data_compra', { ascending: false });

      if (error) throw error;

      const filteredReceipts = filterByMonth(receipts, 'data_compra');

      const history: any[] = [];
      const purchases: any[] = [];
      let lowestPrice = { price: Infinity, date: '', market: '' };
      let highestPrice = { price: -Infinity, date: '', market: '' };
      let totalSpent = 0;
      let totalQuantity = 0;

      // Primeiro, buscamos todos os produtos similares ao selecionado
      const allSimilarProducts = [productName, ...similarProducts];
      console.log('Buscando histórico para produtos similares:', allSimilarProducts);

      filteredReceipts?.forEach(receipt => {
        const items = receipt.items as any[];
        items.forEach(item => {
          // Verifica se este item corresponde a qualquer um dos produtos similares
          const isSimilar = allSimilarProducts.some(
            similarProduct => isSameProduct(item.productName, similarProduct)
          );

          if (isSimilar) {
            const quantity = Number(item.quantity);
            const total = Number(item.total);
            const date = new Date(receipt.data_compra).toISOString().split('T')[0];
            const unitPrice = calculateUnitPrice(total, quantity);

            console.log('Produto similar encontrado:', {
              original: productName,
              found: item.productName,
              quantity,
              total,
              calculatedUnitPrice: unitPrice,
              date,
              market: receipt.mercado
            });

            if (quantity > 0 && total > 0) {
              history.push({
                date,
                price: unitPrice
              });

              purchases.push({
                date,
                price: unitPrice,
                market: receipt.mercado,
                quantity,
                total,
                productName: item.productName
              });

              if (unitPrice < lowestPrice.price) {
                lowestPrice = {
                  price: unitPrice,
                  date,
                  market: receipt.mercado
                };
              }

              if (unitPrice > highestPrice.price) {
                highestPrice = {
                  price: unitPrice,
                  date,
                  market: receipt.mercado
                };
              }

              totalSpent += total;
              totalQuantity += quantity;
            }
          }
        });
      });

      const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const sortedPurchases = purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPriceHistory(sortedHistory);
      setPurchaseHistory(sortedPurchases);
      setProductStats({
        lowestPrice: lowestPrice.price !== Infinity ? lowestPrice : null,
        highestPrice: highestPrice.price !== -Infinity ? highestPrice : null,
        totalSpent,
        totalQuantity
      });

    } catch (error) {
      console.error('Error fetching product history:', error);
      toast.error('Erro ao buscar histórico do produto');
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchProductHistory(selectedProduct);
    }
  }, [selectedProduct, selectedMonth, similarProducts]);

  useEffect(() => {
    fetchTopProducts();
  }, [selectedMonth]);

  useEffect(() => {
    const searchProducts = async () => {
      setIsSearching(true);
      setShowResults(false);
      
      try {
        if (debouncedSearch.length < 3) {
          setProducts([]);
          setIsSearching(false);
          return;
        }

        console.log('Searching for products with term:', debouncedSearch);
        
        const { data: receipts, error } = await supabase
          .from('receipts')
          .select('items');

        if (error) {
          console.error('Error fetching products:', error);
          toast.error('Erro ao buscar produtos');
          return;
        }

        if (receipts) {
          const allProductNames = new Set<string>();
          
          receipts.forEach(receipt => {
            const items = receipt.items as any[];
            items.forEach(item => {
              if (item.productName) {
                allProductNames.add(item.productName);
              }
            });
          });

          // Filtra produtos por similaridade com o termo de busca
          const productArray = Array.from(allProductNames);
          const normalizedSearch = normalizeProductName(debouncedSearch);
          
          const filteredProducts = productArray.filter(productName => {
            const normalizedProduct = normalizeProductName(productName);
            // Verifica se o nome normalizado contém o termo de busca
            return normalizedProduct.includes(normalizedSearch) || 
                   calculateSimilarity(normalizedProduct, normalizedSearch) > 0.5;
          });

          console.log('Found products:', filteredProducts);
          setProducts(filteredProducts);
          
          if (debouncedSearch.length >= 3) {
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Erro ao buscar produtos');
      } finally {
        setIsSearching(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);
    
    // Reset selected product when search term changes
    if (selectedProduct && value !== selectedProduct) {
      setSelectedProduct(null);
      setSimilarProducts([]);
    }
    
    // Show search results when typing
    if (value.length >= 3) {
      setShowResults(true);
    } else {
      setShowResults(false);
      setProducts([]);
    }
  };

  const handleProductSelect = (product: string) => {
    console.log('Product selected:', product);
    setSearchTerm(product);
    setSelectedProduct(product);
    setShowResults(false);
    
    // Encontrar produtos similares
    findSimilarProducts(product);
  };

  const findSimilarProducts = async (productName: string) => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('items');

      if (error) throw error;

      if (receipts) {
        const allProductNames = new Set<string>();
        
        receipts.forEach(receipt => {
          const items = receipt.items as any[];
          items.forEach(item => {
            if (item.productName) {
              allProductNames.add(item.productName);
            }
          });
        });
        
        // Encontra produtos similares ao selecionado
        const productArray = Array.from(allProductNames);
        const similar = productArray.filter(name => 
          name !== productName && isSameProduct(name, productName)
        );

        console.log('Produtos similares encontrados:', similar);
        setSimilarProducts(similar);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos similares:', error);
    }
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    setSimilarProducts([]);
    setProducts([]);
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
          {products.length > 0 && showResults && !selectedProduct && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <ul className="py-2">
                {products.map((product, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 hover:bg-secondary cursor-pointer"
                    onClick={() => handleProductSelect(product)}
                  >
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {isSearching && searchTerm.length >= 3 && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <div className="px-4 py-2 text-sm text-muted-foreground">Buscando produtos...</div>
            </div>
          )}
          
          {products.length === 0 && searchTerm.length >= 3 && !isSearching && !selectedProduct && showResults && (
            <div className="mt-2 absolute z-10 w-full max-w-md bg-background border rounded-md shadow-lg">
              <div className="px-4 py-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>
            </div>
          )}
        </div>

        {selectedProduct ? (
          <>
            {/* Product Information */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{selectedProduct}</h2>
              {similarProducts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Produtos similares incluídos na análise:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {similarProducts.map((similar, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 bg-secondary/50 text-xs rounded-md"
                      >
                        {similar}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                      <TableHead>Nome do Produto</TableHead>
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
                        <TableCell>
                          {purchase.productName === selectedProduct ? (
                            <span className="font-medium">{purchase.productName}</span>
                          ) : (
                            <span className="text-muted-foreground">{purchase.productName}</span>
                          )}
                        </TableCell>
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
