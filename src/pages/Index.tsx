import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TotalExpenses } from "@/components/TotalExpenses";
import { Expense } from "@/types/expense";
import { Bell, TrendingUp, ShoppingBag, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Dados de exemplo para o gráfico
  const productData = [
    { name: 'Arroz', value: 250 },
    { name: 'Feijão', value: 200 },
    { name: 'Leite', value: 180 },
    { name: 'Café', value: 150 },
  ];

  // Dados do mercado mais frequentado
  const topMarket = {
    name: 'Carrefour',
    totalSpent: 1200,
    visits: 8,
    avgTicket: 150,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20 font-inter">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Olá!
            </h1>
            <p className="text-sm text-gray-600">
              Controle seus gastos de forma simples
            </p>
          </div>
          <button className="p-2 relative">
            <Bell className="text-gray-600" size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Card Total */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Total de Gastos</p>
          <TotalExpenses expenses={expenses} />
        </div>

        {/* Mercado Mais Frequentado */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">Mercado Mais Frequentado</h2>
                <p className="text-sm text-gray-500">Últimos 30 dias</p>
              </div>
              <Building2 className="text-purple-500" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">{topMarket.name}</span>
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {topMarket.visits} visitas
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Gasto</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topMarket.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket Médio</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topMarket.avgTicket)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Mais Comprados */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">Produtos Mais Comprados</h2>
                <p className="text-sm text-gray-500">Este mês</p>
              </div>
              <ShoppingBag className="text-purple-500" size={20} />
            </div>
            <div className="h-64">
              <ChartContainer config={{}}>
                <BarChart data={productData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <ChartTooltip />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;