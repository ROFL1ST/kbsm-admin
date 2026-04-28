import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const getStatusBadge = (status: string, color: BadgeVariant) => {
  return <Badge variant={color}>{status}</Badge>;
};
