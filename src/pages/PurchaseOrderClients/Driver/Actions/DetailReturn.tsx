"use client";

import { useLocation } from "react-router-dom";
import PurchaseOrderClientDeliveryDetailReturn from "@/components/ui/PurchaseOrderClientDeliveryDetailReturn";

export default function DeliveryHistoryDetailReturn() {
  const location = useLocation();
  return (
    <div className="space-y-6">
      <PurchaseOrderClientDeliveryDetailReturn
        purchase_order_client_id={location?.state?.purchase_order_client_id}
        purchase_order_client_problem_id={
          location?.state?.purchase_order_client_problem_id
        }
      />
    </div>
  );
}
