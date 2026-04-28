import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PurchaseOrderClientsAdjusments from "@/components/ui/PurchaseOrderClientsAdjusments";
import PurchaseOrderClientWarehouseDetail from "@/components/ui/PurchaseOrderClientWarehouseDetail";
import { useLocation } from "react-router-dom";

export default function ProductManageFixingOrderClients() {
  const location = useLocation();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Perbaikan Pesanan Klien
          </h1>
          <p className="text-muted-foreground">
            Perbaikan Pesanan Klien adalah pesanan klien yang meminta Refund,
            Retur dan lainnya dari pihak klien.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <PurchaseOrderClientsAdjusments
        purchase_order_client_id={location?.state?.purchase_order_client_id}
        client_name={location?.state?.client_name}
      />
    </div>
  );
}
