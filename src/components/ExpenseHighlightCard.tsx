import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, TrendingUp, Package } from "lucide-react";

interface ExpenseHighlightProps {
  type: 'total' | 'highest' | 'mostBought';
  title: string;
  mainValue: string;
  subtitle: string;
  secondaryValue?: string;
  icon?: 'bag' | 'trending' | 'package';
}

const icons = {
  bag: ShoppingBag,
  trending: TrendingUp,
  package: Package,
};

export const ExpenseHighlightCard = ({
  type,
  title,
  mainValue,
  subtitle,
  secondaryValue,
  icon = 'bag'
}: ExpenseHighlightProps) => {
  const Icon = icons[icon];
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-lg text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Icon className="text-primary" size={20} />
        </div>
        <div className="space-y-2">
          <span className="text-2xl font-bold text-primary">{mainValue}</span>
          {secondaryValue && (
            <p className="text-sm text-muted-foreground">{secondaryValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};