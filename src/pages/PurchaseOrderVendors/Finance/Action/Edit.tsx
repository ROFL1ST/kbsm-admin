"use client";

import EditPurchaseOrderClientDetail from "@/components/ui/EditPurchaseOrderClientDetail";
import { HistoryCollectionClient } from "@/components/ui/HistoryCollectionClient";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Receipt } from "lucide-react";
import EditPurchaseOrderVendor from "@/components/ui/EditPurchaseOrderVendorDetail";
import HistoryCollectionVendor from "@/components/ui/HistoryCollectionVendor";

export default function ReviewPurchaseOrderVendorDetail() {
  const location = useLocation();
  const [activeView, setActiveView] = useState<"detail" | "tagihan">("detail");

  return (
    <div className="">
      {/* Header Section */}
      <div className="">
        <div className="container mx-auto px-4 py-8">
          {/* Two Big Button Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant={activeView === "detail" ? "default" : "outline"}
              onClick={() => setActiveView("detail")}
              className={`flex items-center gap-3 px-8 py-6 text-lg font-semibold transition-all ${
                activeView === "detail"
                  ? "bg-primary hover:bg-primary shadow-lg"
                  : "border-2 border-primary hover:border-primary-500 hover:bg-primary-50"
              }`}
            >
              <Package className="w-6 h-6" />
              Detail Pesanan
            </Button>

            <Button
              variant={activeView === "tagihan" ? "default" : "outline"}
              onClick={() => setActiveView("tagihan")}
              className={`flex items-center gap-3 px-8 py-6 text-lg font-semibold transition-all ${
                activeView === "tagihan"
                  ? "bg-primary hover:bg-primary shadow-lg"
                  : "border-2 border-primary hover:border-primary-500 hover:bg-primary-50"
              }`}
            >
              <Receipt className="w-6 h-6" />
              History Tagihan
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {activeView === "detail" && (
              <EditPurchaseOrderVendor
                purchase_order_vendor_id={location?.state}
              />
            )}

            {activeView === "tagihan" && (
              <HistoryCollectionVendor
                purchase_order_vendor_id={location?.state}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
