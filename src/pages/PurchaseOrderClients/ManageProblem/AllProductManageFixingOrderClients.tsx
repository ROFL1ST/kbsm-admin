import PurchaseOrderFixing from "@/components/ui/PurchaseOrderFixing";
import { useFinance } from "@/contexts/Finance.context";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AllProductManageFixingOrderClients() {
  const location = useLocation();
  const { getAllPurchaseOrderClientProblemProduct } = usePurchaseOrderClients();
  const { getFinance } = useFinance();
  const fetchData = async () => {
    await getFinance({
      size: 5,
      page: 1,
      search: "",
      finance_code: "",
      start_date: "",
      end_date: "",
    });
    getAllPurchaseOrderClientProblemProduct({ adjustment_type: null });
  };
  useEffect(() => {
    fetchData();
  }, []);
  return <PurchaseOrderFixing />;
}
