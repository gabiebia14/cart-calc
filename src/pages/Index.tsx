import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TotalExpenses } from "@/components/TotalExpenses";
import { Expense } from "@/types/expense";
import { Bell, ShoppingBag, Building2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#1A1F2C] pb-20 font-inter">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Olá!
            </h1>
            <p className="text-sm text-gray-400">
              Controle seus gastos de forma simples
            </p>
          </div>
          <button className="p-2 relative">
            <Bell className="text-gray-400" size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#9b87f5] rounded-full"></span>
          </button>
        </div>

        {/* Card Total */}
        <div className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Total de Gastos</p>
          <TotalExpenses expenses={expenses} />
        </div>

        {/* Mercado Mais Frequentado */}
        <Card className="mb-6 bg-[#242937] border-[#303644]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-white">Mercado Mais Frequentado</h2>
                <p className="text-sm text-gray-400">Últimos 30 dias</p>
              </div>
              <Building2 className="text-[#9b87f5]" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#9b87f5]">{topMarket.name}</span>
                <span className="text-sm bg-[#303644] text-[#9b87f5] px-3 py-1 rounded-full">
                  {topMarket.visits} visitas
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Gasto</p>
                  <p className="text-lg font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topMarket.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ticket Médio</p>
                  <p className="text-lg font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topMarket.avgTicket)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Mais Comprados */}
        <Card className="mb-6 bg-[#242937] border-[#303644]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-white">Produtos Mais Comprados</h2>
                <p className="text-sm text-gray-400">Este mês</p>
              </div>
              <ShoppingBag className="text-[#9b87f5]" size={20} />
            </div>
            <div className="h-64">
              <ChartContainer config={{}}>
                <BarChart data={productData}>
                  <XAxis dataKey="name" stroke="#9b87f5" />
                  <YAxis stroke="#9b87f5" />
                  <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
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