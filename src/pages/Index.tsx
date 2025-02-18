
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Bell } from "lucide-react";
import { ExpenseHighlightCard } from "@/components/ExpenseHighlightCard";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { TopProductsList } from "@/components/TopProductsList";

// Dados mockados para exemplo
const mockData = {
  totalExpenses: {
    value: 1250.75,
    purchases: 15
  },
  highestExpense: {
    value: 350.00,
    product: "iPhone 15 Pro",
    market: "Magazine Luiza"
  },
  mostBoughtProduct: {
    name: "Café em Grãos",
    quantity: 8,
    total: 280.00
  },
  monthlyData: [
    { name: 'Jan', value: 1200 },
    { name: 'Fev', value: 900 },
    { name: 'Mar', value: 1500 },
    { name: 'Abr', value: 1100 },
    { name: 'Mai', value: 1300 },
    { name: 'Jun', value: 1250 },
  ],
  marketDistribution: [
    { name: 'Carrefour', value: 400 },
    { name: 'Extra', value: 300 },
    { name: 'Assaí', value: 200 },
    { name: 'Dia', value: 150 },
    { name: 'Outros', value: 200 },
  ],
  topProducts: [
    { name: "Café em Grãos", quantity: 8, total: 280.00 },
    { name: "Leite Integral", quantity: 12, total: 89.88 },
    { name: "Pão Integral", quantity: 6, total: 54.00 },
    { name: "Arroz", quantity: 4, total: 95.60 },
    { name: "Azeite", quantity: 3, total: 89.97 },
  ]
};

const Index = () => {
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
            mainValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockData.totalExpenses.value)}
            subtitle="Este mês"
            secondaryValue={`${mockData.totalExpenses.purchases} compras`}
            icon="bag"
          />
          <ExpenseHighlightCard
            type="mostBought"
            title="Produto Mais Comprado"
            mainValue={mockData.mostBoughtProduct.name}
            subtitle={`${mockData.mostBoughtProduct.quantity} unidades`}
            secondaryValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockData.mostBoughtProduct.total)}
            icon="package"
          />
        </div>

        {/* Gráficos */}
        <div className="mb-6">
          <ExpenseCharts
            monthlyData={mockData.monthlyData}
            marketDistribution={mockData.marketDistribution}
          />
        </div>

        {/* Lista de Produtos */}
        <div className="mb-20">
          <TopProductsList products={mockData.topProducts} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
