import { useState } from "react";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { TotalExpenses } from "@/components/TotalExpenses";
import { Expense } from "@/types/expense";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gray-50 p-4 font-inter">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Controle de Gastos
        </h1>
        
        <TotalExpenses expenses={expenses} />
        <AddExpenseForm onAdd={handleAddExpense} />
        
        {expenses.length > 0 ? (
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Nenhum item adicionado ainda
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;