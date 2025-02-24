
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfYear, endOfYear, eachMonthOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthFilterProps {
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
}

export function MonthFilter({ selectedMonth, onMonthSelect }: MonthFilterProps) {
  const currentDate = new Date();
  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate),
  });

  return (
    <Select value={selectedMonth} onValueChange={onMonthSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o mês" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os meses</SelectItem>
        {months.map((month) => (
          <SelectItem
            key={format(month, "MM-yyyy")}
            value={format(month, "MM-yyyy")}
          >
            {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
