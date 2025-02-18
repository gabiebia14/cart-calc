
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
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-semibold text-base text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Icon className="text-primary" size={16} />
        </div>
        <div className="space-y-1">
          <span className="text-xl font-bold text-primary">{mainValue}</span>
          {secondaryValue && (
            <p className="text-xs text-muted-foreground">{secondaryValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
