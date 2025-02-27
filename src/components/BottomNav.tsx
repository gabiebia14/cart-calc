import { Home, BarChart2, Upload, List } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground hover:text-primary";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </Link>
        <Link to="/products" className={`flex flex-col items-center ${isActive('/products')}`}>
          <BarChart2 size={24} />
          <span className="text-xs mt-1">Produtos</span>
        </Link>
        <Link to="/receipts" className={`flex flex-col items-center ${isActive('/receipts')}`}>
          <Upload size={24} />
          <span className="text-xs mt-1">Recibos</span>
        </Link>
        <Link to="/shopping-list" className={`flex flex-col items-center ${isActive('/shopping-list')}`}>
          <List size={24} />
          <span className="text-xs mt-1">Lista</span>
        </Link>
      </div>
    </nav>
  );
};