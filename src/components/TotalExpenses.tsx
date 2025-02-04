import { Expense } from "@/types/expense";

interface TotalExpensesProps {
  expenses: Expense[];
}

export const TotalExpenses = ({ expenses }: TotalExpensesProps) => {
  const total = expenses.reduce((acc, expense) => acc + expense.total, 0);

  return (
    <div className="flex items-baseline">
      <span className="text-3xl font-bold">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
      </span>
      <span className="text-sm ml-2 opacity-75">este mês</span>
    </div>
  );
};