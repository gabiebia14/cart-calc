import { Home, CreditCard, PieChart, User } from "lucide-react";
import { Link } from "react-router-dom";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link to="/" className="flex flex-col items-center text-purple-600">
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
          <CreditCard size={24} />
          <span className="text-xs mt-1">Gastos</span>
        </Link>
        <Link to="/stats" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
          <PieChart size={24} />
          <span className="text-xs mt-1">Estatísticas</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-purple-600">
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  );
};