import { Badge, badgeVariants } from "@/components/ui/badge";
export const DistributionStatusBadge = (code: string, value: string) => {
  const statusConfig = {
    ON_HAND: {
      variant: "default" as const,
      class: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
    },
    Distributed: {
      variant: "secondary" as const,
      class: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
    },
    Returned: {
      variant: "destructive" as const,
      class: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
    },
    on_hand: {
      variant: "default" as const,
      class: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
    },
    distributed: {
      variant: "secondary" as const,
      class: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
    },
    returned: {
      variant: "destructive" as const,
      class: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
    },
  };

  const config = statusConfig[code] || { variant: "outline", class: "" };

  return (
    <Badge variant={config.variant} className={`${config.class} font-medium`}>
      {value}
    </Badge>
  );
};
