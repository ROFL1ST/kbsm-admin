import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PurchaseOrderClientWarehouseDetail from "@/components/ui/PurchaseOrderClientWarehouseDetail";
import { useLocation } from "react-router-dom";

export default function ProductFixingOrderClientDetail() {
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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderClientWarehouseDetail
            purchase_order_client_id={location?.state?.purchase_order_client_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
