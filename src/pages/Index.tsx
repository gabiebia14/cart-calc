
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Bell } from "lucide-react";
import { ExpenseHighlightCard } from "@/components/ExpenseHighlightCard";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { TopProductsList } from "@/components/TopProductsList";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [totalExpenses, setTotalExpenses] = useState({
    value: 0,
    purchases: 0
  });
  const [mostBoughtProduct, setMostBoughtProduct] = useState({
    name: "",
    quantity: 0,
    total: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [marketDistribution, setMarketDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*');

      if (error) throw error;

      if (receipts) {
        // Calcular total de gastos
        const total = receipts.reduce((acc, receipt) => acc + receipt.total, 0);
        setTotalExpenses({
          value: total,
          purchases: receipts.length
        });

        // Extrair e processar itens dos recibos
        const allItems = receipts.flatMap(receipt => receipt.items || []);
        
        // Encontrar produto mais comprado
        const productCount = {};
        const productTotals = {};
        
        allItems.forEach(item => {
          if (!productCount[item.productName]) {
            productCount[item.productName] = 0;
            productTotals[item.productName] = 0;
          }
          productCount[item.productName] += item.quantity;
          productTotals[item.productName] += item.total;
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
        const monthlyExpenses = receipts.reduce((acc, receipt) => {
          const month = new Date(receipt.data_compra).toLocaleString('pt-BR', { month: 'short' });
          if (!acc[month]) acc[month] = 0;
          acc[month] += receipt.total;
          return acc;
        }, {});

        setMonthlyData(Object.entries(monthlyExpenses).map(([name, value]) => ({
          name,
          value
        })));

        // Gerar distribuição por mercado
        const marketTotals = receipts.reduce((acc, receipt) => {
          if (!acc[receipt.mercado]) acc[receipt.mercado] = 0;
          acc[receipt.mercado] += receipt.total;
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
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
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
          <button className="p-2 relative">
            <Bell className="text-muted-foreground" size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>

        {/* Cards de Destaque */}
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <ExpenseHighlightCard
            type="total"
            title="Total de Gastos"
            mainValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses.value)}
            subtitle="Este mês"
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
