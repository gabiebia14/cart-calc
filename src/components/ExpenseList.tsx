import { Trash2 } from "lucide-react";
import { Expense } from "@/types/expense";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList = ({ expenses, onDelete }: ExpenseListProps) => {
  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div key={expense.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">{expense.name}</h3>
            <p className="text-sm text-gray-600">
              {expense.quantity}x - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.price)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-purple-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.total)}
            </span>
            <button
              onClick={() => onDelete(expense.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};