"use client";

import EditPurchaseOrderClientDetail from "@/components/ui/EditPurchaseOrderClientDetail";
import { HistoryCollectionClient } from "@/components/ui/HistoryCollectionClient";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileOutput, Package, Receipt, Truck } from "lucide-react";
import PurchaseOrderClientDeliveryDetail from "@/components/ui/PurchaseOrderClientDeliveryDetail";
import PurchaseOrderClientWarehouseDetail from "@/components/ui/PurchaseOrderClientWarehouseDetail";
import ProductManageFixingOrderClients from "../../ManageProblem/ProductManageFixingOrderClients";
import PurchaseOrderClientsAdjusments from "@/components/ui/PurchaseOrderClientsAdjusments";

export default function ReviewPurchaseOrderClientDetail() {
  const location = useLocation();
  const [activeView, setActiveView] = useState<
    "DETAIL" | "COLLECTION" | "DELIVERY" | "ADJUSTMENT"
  >(location?.state?.page || "DETAIL");

  const tabs = [
    {
      id: "DETAIL" as const,
      label: "Detail Pesanan",
      icon: Package,
      component: (
        <EditPurchaseOrderClientDetail
          purchase_order_client_id={location?.state?.purchase_order_client_id}
        />
      ),
    },
    {
      id: "COLLECTION" as const,
      label: "History Tagihan",
      icon: Receipt,
      component: (
        <HistoryCollectionClient
          purchase_order_client_id={location?.state?.purchase_order_client_id}
        />
      ),
    },
    {
      id: "DELIVERY" as const,
      label: "Logistik",
      icon: Truck,
      component: (
        <PurchaseOrderClientWarehouseDetail
          purchase_order_client_id={location?.state?.purchase_order_client_id}
        />
      ),
    },
    // {
    //   id: "ADJUSTMENT" as const,
    //   label: "Pengebalian",
    //   icon: FileOutput,
    //   component: (
    //     <PurchaseOrderClientsAdjusments
    //       purchase_order_client_id={location?.state?.purchase_order_client_id}
    //       is_warehouse={true}
    //     />
    //   ),
    // },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Segmented Control */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg p-1 shadow-sm border mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all min-w-0 ${
                  activeView === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm whitespace-nowrap hidden sm:block">
                  {tab.label}
                </span>
                <span className="font-medium text-sm whitespace-nowrap sm:hidden">
                  {tab.label.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            {tabs.find((tab) => tab.id === activeView)?.component}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
