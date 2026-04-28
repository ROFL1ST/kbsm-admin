"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FormAdjustmentProducts } from "@/components/ui/FormAdjusmentProducts";

export default function UpdateProductManageFixingOrderClient() {
  const location = useLocation();
  const purchaseOrderClientId = location.state?.purchase_order_client_id || "";
  const purchaseOrderClientProblemId =
    location.state?.purchase_order_client_problem_id || "";

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1);
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {purchaseOrderClientProblemId ? "Edit" : "Buat"} Pengajuan
              Pengembalian
            </h1>
            <p className="text-muted-foreground">
              {purchaseOrderClientProblemId ? "Edit" : "Buat"} Pengajuan
              Pengembalian Produk
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <FormAdjustmentProducts
        purchase_order_client_id={purchaseOrderClientId}
        purchase_order_client_problem_id={purchaseOrderClientProblemId}
      />
    </div>
  );
}
