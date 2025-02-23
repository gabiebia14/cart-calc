
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Receipt } from "@/types/receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditReceiptModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedReceipt: Receipt) => void;
}

export const EditReceiptModal = ({ receipt, isOpen, onClose, onUpdate }: EditReceiptModalProps) => {
  const [items, setItems] = useState(receipt.items || []);
  const [mercado, setMercado] = useState(receipt.mercado);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'productName' ? value : Number(value)
    };

    // Recalcula o total do item apenas se mudar quantidade ou preço unitário
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
    }

    // Se mudar o total diretamente, atualiza o preço unitário mantendo a quantidade
    if (field === 'total') {
      newItems[index].total = Number(value);
      newItems[index].unitPrice = Number(value) / Number(newItems[index].quantity);
    }

    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      // Calcula o novo total do recibo
      const total = items.reduce((acc: number, item: any) => {
        if (item.validFormat && item.total) {
          return acc + Number(item.total);
        }
        return acc;
      }, 0);

      const updatedReceipt = {
        ...receipt,
        mercado,
        items,
        total
      };

      const { error } = await supabase
        .from('receipts')
        .update({ ...updatedReceipt, items: JSON.parse(JSON.stringify(items)) })
        .eq('id', receipt.id);

      if (error) throw error;

      onUpdate(updatedReceipt);
      toast.success('Recibo atualizado com sucesso');
      onClose();
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('Erro ao atualizar recibo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recibo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Estabelecimento</label>
            <Input
              value={mercado}
              onChange={(e) => setMercado(e.target.value)}
              placeholder="Nome do estabelecimento"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Itens</h3>
            {items.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Produto</label>
                  <Input
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Quantidade</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Preço Unit.</label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Total</label>
                  <Input
                    type="number"
                    value={item.total}
                    onChange={(e) => handleItemChange(index, 'total', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
