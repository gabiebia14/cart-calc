
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  completed: boolean;
}

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const { toast } = useToast();

  // Buscar itens da lista
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar itens",
        description: "Não foi possível carregar sua lista de compras."
      });
    }
  };

  // Carregar itens ao iniciar
  useEffect(() => {
    fetchItems();
  }, []);

  // Adicionar novo item
  const addItem = async () => {
    if (!newItemName.trim()) {
      toast({
        variant: "destructive",
        description: "Digite o nome do item"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          name: newItemName.trim(),
          quantity: newItemQuantity.trim() || "1",
          completed: false
        });

      if (error) throw error;

      setNewItemName("");
      setNewItemQuantity("");
      fetchItems();
      
      toast({
        description: "Item adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item à lista."
      });
    }
  };

  // Atualizar status do item
  const toggleItemStatus = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;

      fetchItems();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar item",
        description: "Não foi possível atualizar o status do item."
      });
    }
  };

  // Remover item
  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchItems();
      toast({
        description: "Item removido com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover item",
        description: "Não foi possível remover o item da lista."
      });
    }
  };

  const pendingItems = items.filter(item => !item.completed).length;

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Lista de Compras
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize suas compras
            </p>
          </div>
        </div>

        {/* Add Item */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <Input 
                placeholder="Nome do item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItem();
                  }
                }}
              />
              <div className="flex gap-2">
                <Input 
                  placeholder="Quantidade (opcional)"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem();
                    }
                  }}
                />
                <button 
                  onClick={addItem}
                  className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopping List */}
        <Card className="shadow-sm mb-20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Itens da Lista</h2>
                <p className="text-sm text-muted-foreground">{pendingItems} itens pendentes</p>
              </div>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.completed ? 'bg-secondary/50' : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleItemStatus(item.id, item.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        item.completed 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-primary'
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:opacity-70 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Sua lista está vazia. Adicione alguns itens!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingList;
