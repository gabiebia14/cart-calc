import { useState } from "react";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { TotalExpenses } from "@/components/TotalExpenses";
import { BottomNav } from "@/components/BottomNav";
import { Expense } from "@/types/expense";
import { toast } from "sonner";
import { Bell, TrendingUp, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    toast.success("Item adicionado com sucesso!");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast.success("Item removido com sucesso!");
  };

  // Dados de exemplo para os gráficos
  const marketData = [
    { name: 'Carrefour', value: 1200 },
    { name: 'Extra', value: 800 },
    { name: 'Assaí', value: 600 },
    { name: 'Dia', value: 400 },
  ];

  const productData = [
    { name: 'Arroz', value: 250 },
    { name: 'Feijão', value: 200 },
    { name: 'Leite', value: 180 },
    { name: 'Café', value: 150 },
  ];

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

        {/* Análise de Mercados */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">Mercados Mais Frequentados</h2>
                <p className="text-sm text-gray-500">Últimos 30 dias</p>
              </div>
              <TrendingUp className="text-purple-500" size={20} />
            </div>
            <div className="h-64">
              <ChartContainer config={{}}>
                <BarChart data={marketData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <ChartTooltip />
                </BarChart>
              </ChartContainer>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Adicionar Gasto</span>
              <ArrowUpRight className="text-purple-500" size={16} />
            </div>
            <span className="text-xs text-gray-500">Registre suas despesas</span>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Ver Relatório</span>
              <ArrowUpRight className="text-purple-500" size={16} />
            </div>
            <span className="text-xs text-gray-500">Análise detalhada</span>
          </Card>
        </div>

        <AddExpenseForm onAdd={handleAddExpense} />
        
        {expenses.length > 0 ? (
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Nenhum item adicionado ainda
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;