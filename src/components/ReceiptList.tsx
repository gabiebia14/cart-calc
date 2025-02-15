
import { Receipt } from "@/types/receipt";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { EditReceiptModal } from "./EditReceiptModal";

interface ReceiptListProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
}

export const ReceiptList = ({ receipts, onDelete }: ReceiptListProps) => {
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  const handleUpdate = (updatedReceipt: Receipt) => {
    // O componente pai irá buscar os recibos novamente após a atualização
    setEditingReceipt(null);
  };

  return (
    <div className="space-y-3">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id} 
          className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-medium text-gray-800">{receipt.mercado}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(receipt.data_compra), "dd 'de' MMMM", { locale: ptBR })} • {receipt.items?.length || 0} itens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-purple-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.total)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingReceipt(receipt)}
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

      {editingReceipt && (
        <EditReceiptModal
          receipt={editingReceipt}
          isOpen={!!editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};
