
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface ExpenseChartsProps {
  monthlyData: Array<{ name: string; value: number }>;
  marketDistribution: Array<{ name: string; value: number }>;
}

export function ExpenseCharts({ monthlyData, marketDistribution }: ExpenseChartsProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Linha - Gastos Mensais */}
          <div className="h-[300px]">
            <h3 className="font-semibold mb-4">Gastos Mensais</h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Gráfico de Pizza - Distribuição por Mercado */}
          <div className="h-[300px]">
            <h3 className="font-semibold mb-4">Distribuição por Mercado</h3>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
