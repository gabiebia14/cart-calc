import { BottomNav } from "@/components/BottomNav";

const Receipts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Recibos</h1>
        <div className="space-y-6">
          {/* Placeholder para os componentes futuros */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-500">Upload de recibos em desenvolvimento...</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Receipts;