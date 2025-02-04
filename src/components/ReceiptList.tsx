import { Receipt } from "@/types/receipt";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptListProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
}

export const ReceiptList = ({ receipts, onDelete }: ReceiptListProps) => {
  return (
    <div className="space-y-3">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id} 
          className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <img 
              src={receipt.imageUrl} 
              alt={`Recibo ${receipt.storeName}`}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-gray-800">{receipt.storeName}</h3>
              <p className="text-sm text-gray-500">
                {format(receipt.date, "dd 'de' MMMM", { locale: ptBR })} • {receipt.itemCount} itens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-purple-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.total)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {/* TODO: Implement edit */}}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => onDelete(receipt.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};