import { Expense } from "@/types/expense";

interface TotalExpensesProps {
  expenses: Expense[];
}

export const TotalExpenses = ({ expenses }: TotalExpensesProps) => {
  const total = expenses.reduce((acc, expense) => acc + expense.total, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Total de Gastos</h2>
      <p className="text-2xl font-bold text-purple-600">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
      </p>
    </div>
  );
};