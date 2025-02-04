import { useState } from "react";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { TotalExpenses } from "@/components/TotalExpenses";
import { BottomNav } from "@/components/BottomNav";
import { Expense } from "@/types/expense";
import { toast } from "sonner";
import { Bell } from "lucide-react";

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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
            <span className="block text-sm font-medium text-gray-800">Adicionar Gasto</span>
            <span className="text-xs text-gray-500">Registre suas despesas</span>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
            <span className="block text-sm font-medium text-gray-800">Ver Relatório</span>
            <span className="text-xs text-gray-500">Análise detalhada</span>
          </button>
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