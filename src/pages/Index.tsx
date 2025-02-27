
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Calendar } from "lucide-react";
import { ExpenseHighlightCard } from "@/components/ExpenseHighlightCard";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { TopProductsList } from "@/components/TopProductsList";
import { MonthFilter } from "@/components/MonthFilter";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/types/receipt";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [totalExpenses, setTotalExpenses] = useState({
    value: 0,
    purchases: 0
  });
  const [mostBoughtProduct, setMostBoughtProduct] = useState({
    name: "",
    quantity: 0,
    total: 0
  });
  const [monthlyData, setMonthlyData] = useState<Array<{name: string, value: number}>>([]);
  const [marketDistribution, setMarketDistribution] = useState<Array<{name: string, value: number}>>([]);
  const [topProducts, setTopProducts] = useState<Array<{name: string, quantity: number, total: number}>>([]);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    processData(allReceipts);
  }, [selectedMonth, allReceipts]);

  const fetchData = async () => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .order('data_compra', { ascending: false });

      if (error) throw error;

      if (receipts) {
        // Converter os dados para o formato correto antes de atribuir ao estado
        const formattedReceipts: Receipt[] = receipts.map(receipt => ({
          ...receipt,
          items: (receipt.items as any[]).map(item => ({
            productName: item.productName,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
            validFormat: Boolean(item.validFormat)
          }))
        }));
        setAllReceipts(formattedReceipts);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const filterReceiptsByMonth = (receipts: Receipt[]) => {
    if (selectedMonth === "all") return receipts;

    return receipts.filter((receipt) => {
      const receiptDate = parseISO(receipt.data_compra);
      const receiptMonth = format(receiptDate, "MM-yyyy");
      return receiptMonth === selectedMonth;
    });
  };

  const processData = (receipts: Receipt[]) => {
    const filteredReceipts = filterReceiptsByMonth(receipts);

    // Calcular total de gastos
    const total = filteredReceipts.reduce((acc, receipt) => acc + Number(receipt.total), 0);
    setTotalExpenses({
      value: total,
      purchases: filteredReceipts.length
    });

    // Extrair e processar itens dos recibos
    const allItems = filteredReceipts.flatMap(receipt => receipt.items);

    // Encontrar produto mais comprado
    const productCount: { [key: string]: number } = {};
    const productTotals: { [key: string]: number } = {};
    
    allItems.forEach(item => {
      if (!productCount[item.productName]) {
        productCount[item.productName] = 0;
        productTotals[item.productName] = 0;
      }
      productCount[item.productName] += Number(item.quantity);
      productTotals[item.productName] += Number(item.total);
    });

    const mostBought = Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostBought) {
      setMostBoughtProduct({
        name: mostBought[0],
        quantity: mostBought[1],
        total: productTotals[mostBought[0]]
      });
    }

    // Gerar dados para o gráfico mensal
    const monthlyExpenses = receipts.reduce((acc: { [key: string]: number }, receipt) => {
      const month = format(parseISO(receipt.data_compra), "MMM", { locale: ptBR });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(receipt.total);
      return acc;
    }, {});

    setMonthlyData(Object.entries(monthlyExpenses).map(([name, value]) => ({
      name,
      value
    })));

    // Gerar distribuição por mercado
    const marketTotals = filteredReceipts.reduce((acc: { [key: string]: number }, receipt) => {
      if (!acc[receipt.mercado]) acc[receipt.mercado] = 0;
      acc[receipt.mercado] += Number(receipt.total);
      return acc;
    }, {});

    setMarketDistribution(Object.entries(marketTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5));

    // Gerar top produtos
    const productList = Object.entries(productCount)
      .map(([name, quantity]) => ({
        name,
        quantity,
        total: productTotals[name]
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopProducts(productList);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá!
            </h1>
            <p className="text-sm text-muted-foreground">
              Controle seus gastos de forma simples
            </p>
          </div>
          <div className="flex items-center gap-4">
            <MonthFilter
              selectedMonth={selectedMonth}
              onMonthSelect={setSelectedMonth}
            />
            <button className="p-2 relative">
              <Bell className="text-muted-foreground" size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Cards de Destaque */}
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <ExpenseHighlightCard
            type="total"
            title="Total de Gastos"
            mainValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses.value)}
            subtitle={selectedMonth === "all" ? "Total" : "Este mês"}
            secondaryValue={`${totalExpenses.purchases} compras`}
            icon="bag"
          />
          <ExpenseHighlightCard
            type="mostBought"
            title="Produto Mais Comprado"
            mainValue={mostBoughtProduct.name || "Nenhum produto"}
            subtitle={`${mostBoughtProduct.quantity} unidades`}
            secondaryValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mostBoughtProduct.total)}
            icon="package"
          />
        </div>

        {/* Gráficos */}
        <div className="mb-6">
          <ExpenseCharts
            monthlyData={monthlyData}
            marketDistribution={marketDistribution}
          />
        </div>

        {/* Lista de Produtos */}
        <div className="mb-20">
          <TopProductsList products={topProducts} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
