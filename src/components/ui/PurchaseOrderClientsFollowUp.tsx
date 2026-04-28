import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Package,
  User,
  Hash,
  FileText,
  AlertTriangle,
  Eye,
  X,
} from "lucide-react";

interface PurchaseOrderItem {
  id: number;
  product_detail_id: number;
  request_stock: number;
  purchase_order_client_id: string;
  purchase_order_client_code: string;
  product_unit_id: number;
  created_at: string | null;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

interface ProductFollowUP {
  product_detail_id: number;
  product_unit_id: number;
  unit_code: string;
  name: string;
  quantity: number;
  total_quantity: number;
}

interface PurchaseOrderClientFollowUPProps {
  purchaseOrders?: PurchaseOrderItem[];
  productData?: ProductFollowUP;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderClientFollowUP({
  purchaseOrders = [],
  productData,
  open,
  onOpenChange,
}: PurchaseOrderClientFollowUPProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum dibuat";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Detail Purchase Order
              {purchaseOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {purchaseOrders.length} items
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Product Information Summary */}
        {productData && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">
                  {productData.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Unit</span>
                  <span className="font-medium">{productData.unit_code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Permintaan</span>
                  <span className="font-semibold text-primary">
                    {productData.quantity}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Stok Sekarang</span>
                  <span className="font-semibold text-destructive">
                    {productData.total_quantity}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Orders List */}
        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Package className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Tidak ada data follow up
                </p>
                <p className="text-sm text-center">
                  Belum ada purchase order yang perlu di-follow up untuk produk
                  ini
                </p>
              </CardContent>
            </Card>
          ) : (
            purchaseOrders.map((order, index) => (
              <Card
                key={order.id}
                className={`border-l-4 transition-all hover:shadow-md border-primary`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="font-semibold">No.{index + 1}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-500" />
                          <span className="">Jumlah Permintaan:</span>
                          <span className="font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded text-xs">
                            {order.request_stock} unit
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          <span className="">Sales :</span>
                          <span className="font-medium text-xs">
                            {order.created_by?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-primary">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Created At:</span>
                        <span className="font-medium">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="">Kode PO:</span>
                      <span className="font-medium text-xs">
                        {order.purchase_order_client_code}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer Summary */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-sm">
          <div className="text-gray-600">
            Total: <span className="font-medium">{purchaseOrders.length}</span>{" "}
            purchase order
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
