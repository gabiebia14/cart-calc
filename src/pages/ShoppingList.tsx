import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

const ShoppingList = () => {
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
            <div className="flex gap-2">
              <Input 
                placeholder="Adicionar item..."
                className="flex-1"
              />
              <button className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Shopping List */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg text-foreground">Itens da Lista</h2>
                <p className="text-sm text-muted-foreground">3 itens pendentes</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Arroz", quantity: "2 kg", completed: false },
                { name: "Feijão", quantity: "1 kg", completed: true },
                { name: "Leite", quantity: "6 un", completed: false },
              ].map((item) => (
                <div 
                  key={item.name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.completed ? 'bg-secondary/50' : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingList;