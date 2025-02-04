import { useState } from "react";
import { Plus } from "lucide-react";
import { Expense } from "@/types/expense";

interface AddExpenseFormProps {
  onAdd: (expense: Expense) => void;
}

export const AddExpenseForm = ({ onAdd }: AddExpenseFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      quantity,
      price,
      total: quantity * price
    };

    onAdd(newExpense);
    setName("");
    setQuantity(1);
    setPrice(0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Item
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            placeholder="Nome do item"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Preço
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Adicionar Item
        </button>
      </div>
    </form>
  );
};