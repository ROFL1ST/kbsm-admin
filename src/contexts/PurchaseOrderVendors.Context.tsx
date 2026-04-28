import API from "@/config/API";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types";
import { StripTypeScriptTypesOptions } from "module";
import React, { createContext, useContext, useState } from "react";

/** ===================== INTERFACES ===================== */
export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
}
export interface UpdateDataDeliveryDetail {
  purchase_order_vendor_id: string;
  driver_info: {
    driver_name: string;
    driver_phone: string;
    driver_photo: string | File;
  };
  items: {
    product_id: number;
    product_detail_id: number;
    product_unit_id: number;
    quantity: number;
  }[];
}

export interface Item {
  product_id: number | null;
  product_detail_id: number | null;
  name: string;
  description: string;
  quantity: number | null; // null biar input bisa kosong
  is_ppn: boolean;
  unit_code: string;
  price: number | null; // null biar input bisa kosong
  line_total?: number; // opsional
  discount_percentage: string;
  discount_amount: number;
}
export interface ItemDelivery {
  received_quantity: number;
  quantity: number;
  name: string;
  description: string;
  code: string;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  received_quantity_fix: number;
}

export interface FormStatePurchaseOrderVendor {
  purchase_order_vendor_id: string;
  vendor_id: number;
  total: number;
  status_trx_code: string;
  input_date: string;
  due_date: string;
  send_date: string;
  progress_type_code: string;
  payment_method_code: string;
  items: Item[];
}
export interface FormStatePurchaseOrderDeliveryVendor {
  purchase_order_vendor_id: string;
  purchase_order_vendor_delivery_id?: string;
  name: string;
  vendor_id: number;
  total: number;
  status_trx_code: string;
  input_date: string;
  due_date: string;
  send_date: string;
  progress_type_code: string;
  payment_method_code: string;
  products: ItemDelivery[];
}
export interface PurchaseOrderVendorDetailKey {
  purchase_order_vendor_id: string;
}
export interface PurchaseOrderVendorDeliveryKey {
  purchase_order_vendor_delivery_id: string;
}
export interface PurchaseOrderVendorDetailCodeKey {
  purchase_order_vendor_code: string;
}

export interface PurchaseOrderVendorDocumentKey {
  purchase_order_vendor_id: string;
  description: string;
}
export interface PurchaseOrderVendorDeliveryReceivedKey {
  purchase_order_vendor_id: string;
  purchase_order_vendor_delivery_id: string;
  description: string;
}

export interface PurchaseOrderVendorFeedbackKey {
  purchase_order_vendor_id: string;
  progress_type_code: string;
  finance_callback_reason: string;
}

export interface PurchaseOrderVendorDetail {
  id: string;
  vendor_id: number;
  name: string;
  purchase_order_client_code: string;
  progress_type_code: string;
  finance_callback_reason: string;
  finance_callback_at: string;
  finance_callback_by: string;
  input_date: string;
  due_date: string;
  send_date: string;
  total: number;
  type: string;
  type_badge: string;
  payment_method_code: string;
  status_trx_code: string;
  status_trx: string;
  status_trx_badge: string;
  created_by: string;
  exx: number;
  products: PurchaseOrderProductDetail[];
}

export interface PurchaseOrderProductDetail {
  id: number;
  purchase_order_vendor_id: string;
  product_id: number;
  product_detail_id: number;
  quantity: number;
  ppn_percentage: number;
  ppn_amount: number;
  discount_percentage: number;
  discount_amount: number;
  unit_code: string;
  price: number;
  total: number;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  product_name: string;
  description: string;
}

interface AssetsResponse {
  products: any[]; // ganti ke Product[] kalau sudah punya interface Product
  vendors: any[]; // ganti ke Product[] kalau sudah punya interface Product
}
interface TravelDocumentDescription {
  description: string; // ganti ke Product[] kalau sudah punya interface Product
}

export interface PurchaseOrderVendorHistory {
  id: string;
  name: string;
  vendor_id: number;
  status_trx_code: string;
  purchase_order_vendor_code: string;
  progress_type_code: string;
  send_date: Date;
  payment_method_code: string;
  input_date: Date;
  due_date: number;
  total: number;
  type: string;
  type_badge: string;
  payment_type: string;
  status_trx: string;
  status_trx_badge: string;
  created_by: string;
  exx: number;
  driver: Driver[];
}

export interface Driver {
  code: any;
  id: string;
  purchase_order_vendor_delivery_code: string;
  purchase_order_vendor_id: string;
  driver_name: string;
  driver_phone: string;
  path: string;
  created_at: Date;
  created_by: string;
  updated_at: null;
  updated_by: null;
  deleted_at: null;
  deleted_by: null;
  detail: Detail[];
}

export interface Detail {
  quantity: number;
  received_quantity: number;
  name: string;
  description: string;
  code: string;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  received_quantity_fix: number;
}
export interface PurchaseOrderVendorCollectionKey {
  purchase_order_collection_vendor_id: number;
}
export interface PurchaseOrderVendorCollectionFormState {
  purchase_order_vendor_id: string;
  purchase_order_collection_vendor_id: number | null;
  payment_type: string;
  path: string;
  price: number;
}
export interface ProductAssets {
  id: number;
  name: string;
}
/** ===================== CONTEXT TYPE ===================== */
interface PurchaseOrderVendorsContextType {
  vendors: Vendor[] | null;
  products: ProductAssets[] | null;
  isLoading: boolean;
  detailPurchaseOrderVendor: PurchaseOrderVendorDetail | null;
  printTravelDocument: (
    params: PurchaseOrderVendorDocumentKey,
  ) => Promise<ApiResponse<any>>;
  printProofReceivedProducts: (
    params: PurchaseOrderVendorDeliveryReceivedKey,
  ) => Promise<ApiResponse<any>>;
  getAssets: () => Promise<ApiResponse<AssetsResponse> | any>;

  createVendor: (data: Partial<Vendor>) => Promise<ApiResponse<Vendor> | null>;

  getPurchaseOrderVendors: () => Promise<ApiResponse<any> | null>;
  createPurchaseOrderVendor: (
    data: FormStatePurchaseOrderVendor,
  ) => Promise<ApiResponse<any> | null>;
  handleDetailPurchaseOrderVendor: (
    data: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse | null>;
  getValidationStockByID: (
    data: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse | null>;
  updatePurchaseOrderVendor: (
    data: FormStatePurchaseOrderVendor,
  ) => Promise<ApiResponse<any> | null>;
  deletePurchaseOrderVendor: (
    params: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse<any> | null>;
  createOnePurchaseOrderVendorDeliveryReceived: (
    params: UpdateDataDeliveryDetail,
  ) => Promise<ApiResponse>;
  getPurchaseOrderProductDeliveryVendor: (
    params: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse>;
  getHistoryPurchaseOrderVendor: (
    params: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse | null>;
  feedbackOrderVendor: (
    params: PurchaseOrderVendorFeedbackKey,
  ) => Promise<ApiResponse>;
  patchOnePurchaseOrderVendorDeliveryReceived: (
    data: UpdateDataDeliveryDetail,
  ) => Promise<ApiResponse>;
  deleteHistoryPurchaseOrderVendor: (
    params: PurchaseOrderVendorDeliveryKey,
  ) => Promise<ApiResponse<any> | null>;
  createPurchaseOrderCollections: (
    params: PurchaseOrderVendorCollectionFormState,
  ) => Promise<ApiResponse>;
  getPurchaseOrderCollections: (
    params: PurchaseOrderVendorDetailKey,
  ) => Promise<ApiResponse>;
  deletePurchaseOrderCollections: (
    params: PurchaseOrderVendorCollectionKey,
  ) => Promise<ApiResponse>;
  updatePurchaseOrderCollections: (
    params: PurchaseOrderVendorCollectionFormState,
  ) => Promise<ApiResponse>;
  detailPurchaseOrderVendorDelivery: FormStatePurchaseOrderDeliveryVendor;
  purchaseOrderVendorHistory: PurchaseOrderVendorHistory | null;
}

/** ===================== CONTEXT INIT ===================== */
const PurchaseOrderVendorsContext = createContext<
  PurchaseOrderVendorsContextType | undefined
>(undefined);

export const usePurchaseOrderVendors = () => {
  const context = useContext(PurchaseOrderVendorsContext);
  if (!context) {
    throw new Error(
      "usePurchaseOrderVendors must be used within a PurchaseOrderVendorsProvider",
    );
  }
  return context;
};

/** ===================== PROVIDER ===================== */
export const PurchaseOrderVendorsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[] | null>([]);
  const [products, setProducts] = useState<any[] | null>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [detailPurchaseOrderVendor, setdetailPurchaseOrderVendor] =
    useState<PurchaseOrderVendorDetail | null>(null);
  const [
    detailPurchaseOrderVendorDelivery,
    setdetailPurchaseOrderVendorDelivery,
  ] = useState<FormStatePurchaseOrderDeliveryVendor | null>(null);
  const [purchaseOrderVendorHistory, setPurchaseOrderVendorHistory] =
    useState<PurchaseOrderVendorHistory | null>(null);
  /** ========== CLIENTS CRUD ========== */

  const printTravelDocument = async (
    params: PurchaseOrderVendorDocumentKey,
  ): Promise<ApiResponse> => {
    // buka window nanti saja setelah validasi berhasil
    try {
      setIsLoading(true);
      const response = await API.get(
        "/purchase-order/vendors/travel-document",
        {
          params,
          responseType: "blob",
        },
      );
      setIsLoading(false);
      const blob = response.data;
      const text = await new Response(blob).text();

      try {
        const json = JSON.parse(text);
        if (json.status === false) {
          return {
            status: false,
            messages: json.messages || "Gagal mencetak dokumen.",
            data: null,
          };
        }
      } catch {
        // kalau bukan JSON, berarti PDF
        const newWindow = window.open("", "_blank");
        const fileURL = window.URL.createObjectURL(blob);
        newWindow.location.href = fileURL;

        return { status: true, messages: "Success", data: null };
      }
    } catch (error) {
      return {
        status: false,
        messages: "Terjadi kesalahan koneksi.",
        data: null,
      };
    }
  };
  const feedbackOrderVendor = async (
    params: PurchaseOrderVendorFeedbackKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        "/purchase-order/vendors/feedback/request-order",
        params,
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const printProofReceivedProducts = async (
    params: PurchaseOrderVendorDeliveryReceivedKey,
  ): Promise<ApiResponse> => {
    // buka window nanti saja setelah validasi berhasil
    try {
      setIsLoading(true);
      const response = await API.get(
        "/purchase-order/vendors/received/delivery/export",
        {
          params,
          responseType: "blob",
        },
      );
      setIsLoading(false);
      const blob = response.data;
      const text = await new Response(blob).text();

      try {
        const json = JSON.parse(text);
        if (json.status === false) {
          return {
            status: false,
            messages: json.messages || "Gagal mencetak dokumen.",
            data: null,
          };
        }
      } catch {
        // kalau bukan JSON, berarti PDF
        const newWindow = window.open("", "_blank");
        const fileURL = window.URL.createObjectURL(blob);
        newWindow.location.href = fileURL;

        return { status: true, messages: "Success", data: null };
      }
    } catch (error) {
      return {
        status: false,
        messages: "Terjadi kesalahan koneksi.",
        data: null,
      };
    }
  };

  const getAssets = async (): Promise<ApiResponse<AssetsResponse> | null> => {
    try {
      const response = await API.get<ApiResponse<AssetsResponse>>(
        "/purchase-order/vendors/assets",
      );

      if (response?.data?.status) {
        setProducts(response.data.data.products || []);
        setVendors(response.data.data.vendors || []);
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      setProducts([]);
      return null;
    }
  };
  const getValidationStockByID = async (
    params: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/vendors/description/travel-document",
        {
          params: params,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };

  const createVendor = async (
    data: Partial<Vendor>,
  ): Promise<ApiResponse<Vendor> | null> => {
    try {
      const response = await API.post<ApiResponse<Vendor>>(
        "/purchase-order/vendors",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      return null;
    }
  };

  /** ========== PURCHASE ORDER CLIENTS CRUD ========== */
  const getPurchaseOrderVendors =
    async (): Promise<ApiResponse<any> | null> => {
      try {
        const response = await API.get<ApiResponse<any>>(
          "/purchase-order-vendors",
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching purchase order vendors:", error);
        return null;
      }
    };

  const createPurchaseOrderVendor = async (
    data: FormStatePurchaseOrderVendor,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.post<ApiResponse<any>>(
        "/purchase-order/vendors",
        data,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating purchase order client:", error);
      return null;
    }
  };
  const handleDetailPurchaseOrderVendor = async (
    data: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/vendors/detail",
        { params: data, withCredentials: true },
      );
      setdetailPurchaseOrderVendor(response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client detail:", error);
      return null;
    }
  };
  const updatePurchaseOrderVendor = async (
    data: FormStatePurchaseOrderVendor,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.patch<ApiResponse<any>>(
        "/purchase-order/vendors",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating purchase order client:", error);
      return null;
    }
  };
  const deletePurchaseOrderVendor = async (
    params: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.delete<ApiResponse<any>>(
        `/purchase-order/vendors`,
        {
          params: params,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting purchase order client:", error);
      return null;
    }
  };

  const createOnePurchaseOrderVendorDeliveryReceived = async (
    params: UpdateDataDeliveryDetail,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.post<ApiResponse>(
        `/purchase-order/vendors/delivery/received`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
      return null;
    }
  };

  const patchOnePurchaseOrderVendorDeliveryReceived = async (
    data: UpdateDataDeliveryDetail,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        `/purchase-order/vendors/delivery/received`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
      return null;
    }
  };

  const getPurchaseOrderProductDeliveryVendor = async (
    params: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        `/purchase-order/vendors/delivery/received`,
        { params: params },
      );
      setdetailPurchaseOrderVendorDelivery(response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
      return null;
    }
  };

  const getHistoryPurchaseOrderVendor = async (
    params: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse | null> => {
    try {
      const res = await API.get<ApiResponse>(
        `/purchase-order/vendors/receiveds/delivery?purchase_order_vendor_id=${params.purchase_order_vendor_id}`,
      );

      setPurchaseOrderVendorHistory(res.data.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching purchase order client history:", error);
      return null;
    }
  };

  const deleteHistoryPurchaseOrderVendor = async (
    params: PurchaseOrderVendorDeliveryKey,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.delete<ApiResponse<any>>(
        `/purchase-order/vendors/delivery/received?purchase_order_vendor_delivery_id=${params.purchase_order_vendor_delivery_id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting purchase order client history:", error);
      return null;
    }
  };
  const createPurchaseOrderCollections = async (
    params: PurchaseOrderVendorCollectionFormState,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.post<ApiResponse>(
        `/purchase-order/vendors/collection`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const getPurchaseOrderCollections = async (
    params: PurchaseOrderVendorDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        `/purchase-order/vendors/collection`,
        { params: params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const deletePurchaseOrderCollections = async (
    params: PurchaseOrderVendorCollectionKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.delete<ApiResponse>(
        `/purchase-order/vendors/collection`,
        { params: params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const updatePurchaseOrderCollections = async (
    params: PurchaseOrderVendorCollectionFormState,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        `/purchase-order/vendors/collection`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  /** ========== CONTEXT VALUE ========== */
  const value: PurchaseOrderVendorsContextType = {
    vendors,
    isLoading,
    products,
    detailPurchaseOrderVendor,
    detailPurchaseOrderVendorDelivery,
    printTravelDocument,
    printProofReceivedProducts,
    getValidationStockByID,
    getAssets,
    createVendor,
    getPurchaseOrderVendors,
    handleDetailPurchaseOrderVendor,
    createPurchaseOrderVendor,
    updatePurchaseOrderVendor,
    deletePurchaseOrderVendor,
    createOnePurchaseOrderVendorDeliveryReceived,
    getPurchaseOrderProductDeliveryVendor,
    getHistoryPurchaseOrderVendor,
    patchOnePurchaseOrderVendorDeliveryReceived,
    deleteHistoryPurchaseOrderVendor,
    feedbackOrderVendor,
    createPurchaseOrderCollections,
    getPurchaseOrderCollections,
    deletePurchaseOrderCollections,
    updatePurchaseOrderCollections,
    purchaseOrderVendorHistory,
  };

  return (
    <PurchaseOrderVendorsContext.Provider value={value}>
      {children}
    </PurchaseOrderVendorsContext.Provider>
  );
};
