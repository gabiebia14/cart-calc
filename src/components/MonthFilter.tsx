
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MonthFilterProps {
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
}

export function MonthFilter({ selectedMonth, onMonthSelect }: MonthFilterProps) {
  const [monthRange, setMonthRange] = useState<Date[]>([]);

  useEffect(() => {
    fetchDateRange();
  }, []);

  const fetchDateRange = async () => {
    try {
      // Buscar a data mais antiga e mais recente dos recibos
      const { data: oldestReceipt } = await supabase
        .from('receipts')
        .select('data_compra')
        .order('data_compra', { ascending: true })
        .limit(1)
        .single();

      const { data: newestReceipt } = await supabase
        .from('receipts')
        .select('data_compra')
        .order('data_compra', { ascending: false })
        .limit(1)
        .single();

      if (oldestReceipt && newestReceipt) {
        const startDate = startOfMonth(parseISO(oldestReceipt.data_compra));
        const endDate = endOfMonth(parseISO(newestReceipt.data_compra));

        const months = eachMonthOfInterval({
          start: startDate,
          end: endDate,
        });

        setMonthRange(months);
      }
    } catch (error) {
      console.error('Erro ao buscar intervalo de datas:', error);
    }
  };

  return (
    <Select value={selectedMonth} onValueChange={onMonthSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o mês" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os meses</SelectItem>
        {monthRange.map((month) => (
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
