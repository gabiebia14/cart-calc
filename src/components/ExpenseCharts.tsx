import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981'];

interface ExpenseData {
  name: string;
  value: number;
}

interface ExpenseChartsProps {
  monthlyData: ExpenseData[];
  marketDistribution: ExpenseData[];
}

export const ExpenseCharts = ({ monthlyData, marketDistribution }: ExpenseChartsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="font-semibold text-lg text-foreground">Gastos Mensais</h2>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          <div className="h-64">
            <ChartContainer config={{}}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" stroke="hsl(var(--primary))" />
                <YAxis stroke="hsl(var(--primary))" />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <ChartTooltip />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="font-semibold text-lg text-foreground">Distribuição por Mercado</h2>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </div>
          <div className="h-64">
            <ChartContainer config={{}}>
              <PieChart>
                <Pie
                  data={marketDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {marketDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};