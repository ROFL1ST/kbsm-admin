import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  from?: Date;
  to?: Date;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: DateRange;
  onChange?: (val: DateRange | undefined) => void;
}) {
  // handle pilih tanggal
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!value?.from) {
      onChange?.({ from: date, to: undefined });
      return;
    }

    if (!value?.to) {
      let from = value.from;
      let to = date;

      if (to < from) [from, to] = [to, from];

      onChange?.({ from, to });
      return;
    }

    onChange?.({ from: date, to: undefined });
  };

  // highlight rentang
  const modifiers = React.useMemo(() => {
    if (value?.from && value?.to) {
      const from = value.from < value.to ? value.from : value.to;
      const to = value.to > value.from ? value.to : value.from;
      return { selectedRange: { from, to }, from, to };
    }
    if (value?.from) return { from: value.from };
    return {};
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[300px] justify-start text-left ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from && value?.to
            ? `${value.from.toLocaleDateString(
                "id-ID"
              )} - ${value.to.toLocaleDateString("id-ID")}`
            : value?.from
            ? value.from.toLocaleDateString("id-ID")
            : "Pilih rentang tanggal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value?.to ?? value?.from}
          onSelect={handleSelect}
          numberOfMonths={2}
          modifiers={modifiers}
          modifiersStyles={{
            selectedRange: {
              backgroundColor: "hsl(var(--primary) / 0.2)",
              borderRadius: 0,
            },
            from: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              borderRadius: "6px",
            },
            to: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              borderRadius: "6px",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
