"use client";

import { useLocation } from "react-router-dom";
import PurchaseOrderClientDeliveryDetail from "@/components/ui/PurchaseOrderClientDeliveryDetail";

export default function DeliveryHistoryDetail() {
  const location = useLocation();
  return (
    <div className="space-y-6">
      <PurchaseOrderClientDeliveryDetail
        purchase_order_client_id={location?.state}
      />
    </div>
  );
}
