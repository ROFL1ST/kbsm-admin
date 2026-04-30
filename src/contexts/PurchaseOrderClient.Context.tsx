import API from "@/config/API";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse, Pagination } from "@/types";
import React, { createContext, useContext, useState } from "react";

/** ===================== INTERFACES ===================== */
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  lat: string;
  long: string;
  path: null;
  type: string;
  type_value: string;
  active: null;
  created_at: Date;
  created_by: string;
  updated_at: null;
  updated_by: null;
  deleted_at: null;
  deleted_by: null;
}
export interface AdjustmentProduct {
  product_unit_id: number;
  adjustment_type: string;
  adjustment_quantity: string;
  reason: string;
  reason_warehouse?: string | null;
  reason_finance?: string | null;
  solve_adjustment_date?: "Y" | "N";
}

export interface UpdateProblemProductsRequest {
  purchase_order_client_id: string;
  received_warehouse_proof: string;
  send_to_client_date: string;
  driver_id: string;
  assignment_by: string;
}

export interface PurchaseOrderCollectionFeedbackKey {
  purchase_order_collection_client_id: number;
  type: number;
  finance_callback_reason: string;
}
export interface PurchaseOrderClientCollectionFormState {
  purchase_order_collection_client_id: number | null;
  purchase_order_client_id: string;
  payment_type: string;
  transaction_code: string;
  path: string;
  price: number;
}
export interface VerificationPurchaseOrderClientCollectionFormState {
  purchase_order_collection_client_id: number;
  payment_type: string;
  path: string;
  price: number;
}
export interface PurchaseOrderCollectionKey {
  purchase_order_collection_client_id: number;
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
  price_percentage_up: string;
  price_amount_up: number;
}

export interface FormStatePurchaseOrderClient {
  purchase_order_client_id: string;
  client_id: number;
  total: number;
  status_trx_code: string;
  input_date: string;
  due_date: string;
  send_date: string;
  progress_type_code: string;
  payment_method_code: string;
  items: Item[];
}
export interface PurchaseOrderClientDetailKey {
  purchase_order_client_id: string;
  purchase_order_client_problem_id?: string;
}
export interface PurchaseOrderClientRefundKey {
  purchase_order_client_id: string;
  path: string;
  payment_type: string;
}
interface CreatePurchaseOrderClientProblemItemKey {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  adjustment_type: string;
  adjustment_quantity: number;
  reason: string;
}
export interface CreatePurchaseOrderClientProblemKey {
  purchase_order_client_id: string;
  problem_product_take_by: string;
  items: CreatePurchaseOrderClientProblemItemKey[];
}
export interface UpdatePurchaseOrderClientProblemKey {
  purchase_order_client_id: string;
  problem_product_take_by: string;
  purchase_order_client_problem_id: string;
  pick_up_by?: string | null;
  received_warehouse_proof: string | null;
  items: CreatePurchaseOrderClientProblemItemKey[];
}
export interface GetDetailPurchaseOrderClientProblemKey {
  purchase_order_client_id: string;
  purchase_order_client_problem_id: string;
}
export interface GetAllPurchaseOrderClientProblemKey {
  adjustment_type: string;
  is_finance_out_page?: boolean;
  size?: number;
  page?: number;
}
export interface PurchaseOrderClientProductsKey {
  purchase_order_client_id: string;
  product_id: number;
  product_detail_id: number;
}
export interface DeliveryUpdateStatus {
  purchase_order_client_id: string;
  purchase_order_client_problem_id?: string;
  progress_type_code: string;
  path: string;
}
export interface PurchaseOrderClientDeliveryHistoriesKey {
  size: number;
  page: number;
  search: string;
  start_date?: string;
  end_date?: string;
}
export interface DeliveryHistories {
  travel_code: string;
  purchase_order_client_problem_id: string;
  purchase_order_client_id: string;
  purchase_order_client_code: string;
  payment_method: string;
  progress_type: string;
  progress_type_code: string;
  name: string;
  driver_name: string;
  is_return: string;
  phone: string;
  lat: string;
  long: string;
  request_send_date: string;
}
export interface DeliveryHistoryDetail {
  travel_code: string;
  distribution_status: string;
  driver_name: string;
  phone: string;
  path: string;
  created_at: string;
}

export interface PrintTravelDocumentKey {
  purchase_order_client_id: string;
  purchase_order_client_problem_id?: string;
  driver_id: string;
  description: string;
}

export interface PurchaseOrderClientDetail {
  id: string;
  client_id: number;
  name: string;
  email: string;
  purchase_order_client_code: string;
  payment_type: string;
  progress_type_code: string;
  input_date: string;
  address: string;
  due_date: string;
  send_date: string;
  ongkir: number;
  total: number;
  final_total: number;
  type: string;
  problem_product_take_by: string;
  is_problem_products: string;
  type_badge: string;
  payment_method_code: string;
  status_trx_code: string;
  status_trx: string;
  lat: string;
  long: string;
  phone: string;
  status_trx_badge: string;
  created_by: string;
  exx: number;
  products: PurchaseOrderProductDetail[];
  refund: { total_refund: number };
  return: PurchaseOrderProblem;
  shipping: PurchaseOrderShipping;
}

export interface PurchaseOrderProductDetail {
  id: number;
  purchase_order_client_id: string;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
  ppn_percentage: number;
  ppn_amount: number;
  discount_percentage: number;
  discount_amount: number;
  price_percentage_up: number;
  price_amount_up: number;
  unit_code: string;
  price: number;
  total: number;
  adjustment_quantity: string; // new
  reason_finance: string;
  reason_warehouse: string;
  adjustment_type: string;
  reason: string;
  updated_at_finance: string;
  updated_at_warehouse: string;
  quantity_distribution: number;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  product_name: string;
  description: string;
}
interface PurchaseOrderShipping {
  id: number;
  purchase_order_client_id: string;
  delivery: string;
  ongkir: number;
  code: string;
  service: string;
  description: string;
  etd: string;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  address: string;
  label: string;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  resi: string | null;
}

export interface PurchaseOrderProblem {
  id: string;
  purchase_order_client_id: string;
  is_return: string;
  is_take_out: string;
  is_refund: string;
  travel_code: string | null;
  received_warehouse_date: string | null;
  received_warehouse_by: string | null;
  received_warehouse_proof: string | null;
  problem_product_take_by_name: string | null;
  progress_delivery_return: string | null;
  trx_code: string | null;
  send_to_client_date: string | null;
  client_name: string | null;
  total_refund: number | null;
  path: string | null;
  reference: string | null;
  created_by_name: string | null;
  assignment_date: string | null;
  assignment_by: string | null;
  problem_product_take_by: string | null;
  driver_id: string | null;
  finish_date: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}
interface AssetsResponse {
  products: any[]; // ganti ke Product[] kalau sudah punya interface Product
  clients: any[]; // ganti ke Product[] kalau sudah punya interface Product
}
interface TravelDocumentDescription {
  description: string; // ganti ke Product[] kalau sudah punya interface Product
}

/** ===================== CONTEXT TYPE ===================== */
interface PurchaseOrderClientsContextType {
  clients: Client[] | null;
  products: any[] | null;
  isLoading: boolean;
  detailPurchaseOrderClient: PurchaseOrderClientDetail | null;
  purchaseOrderProblem: PurchaseOrderProblem[];
  getClients: () => Promise<ApiResponse<Client[]> | null>;
  printTravelDocument: (
    params: PrintTravelDocumentKey,
  ) => Promise<ApiResponse<any>>;
  getAssets: () => Promise<ApiResponse<AssetsResponse> | any>;

  createClient: (data: Partial<Client>) => Promise<ApiResponse<Client> | null>;

  getPurchaseOrderClients: () => Promise<ApiResponse<any> | null>;
  getPurchaseOrderDeliveryHistories: (
    params: PurchaseOrderClientDeliveryHistoriesKey,
  ) => Promise<ApiResponse>;
  pagination: Pagination;
  deliveryHistories: DeliveryHistories[];
  createPurchaseOrderClient: (
    data: FormStatePurchaseOrderClient,
  ) => Promise<ApiResponse<any> | null>;
  handleDetailPurchaseOrderClient: (
    data: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse | null>;
  getValidationStockByID: (
    data: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse | null>;
  updatePurchaseOrderClient: (
    data: FormStatePurchaseOrderClient,
  ) => Promise<ApiResponse<any> | null>;
  deletePurchaseOrderClient: (
    params: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse<any> | null>;
  getOnePurchaseOrderClient: (id: number) => Promise<ApiResponse<any> | null>;
  getPurchaseOrderDeliveryHistoryDetail: (
    params: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse>;
  updatePurchaseOrderDeliveryHistoryDetail: (
    params: DeliveryUpdateStatus,
  ) => Promise<ApiResponse>;
  deliveryHistoryDetail: DeliveryHistoryDetail | null;
  deletePurchaseOrderCollections: (
    params: PurchaseOrderCollectionKey,
  ) => Promise<ApiResponse>;
  updatePurchaseOrderCollections: (
    params: PurchaseOrderClientCollectionFormState,
  ) => Promise<ApiResponse>;
  createPurchaseOrderCollections: (
    params: PurchaseOrderClientCollectionFormState,
  ) => Promise<ApiResponse>;
  getPurchaseOrderCollections: (
    params: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse>;
  feedbackOrderClientCollection: (
    params: PurchaseOrderCollectionFeedbackKey,
  ) => Promise<ApiResponse>;
  purchaseOrderClientProblemProducts: (
    params: UpdateProblemProductsRequest,
  ) => Promise<ApiResponse>;
  getPurchaseOrderClientProblemProduct: (
    params: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse>;
  deletePurchaseOrderClientProblemProduct: (
    params: PurchaseOrderClientDetailKey,
  ) => Promise<ApiResponse>;
  updatePurchaseOrderClientRefundProduct: (
    params: PurchaseOrderClientRefundKey,
  ) => Promise<ApiResponse>;
  getPurchaseOrderClientProducts: (
    params: PurchaseOrderClientProductsKey,
  ) => Promise<ApiResponse>;
  createPurchaseOrderClientProblemProduct: (
    params: CreatePurchaseOrderClientProblemKey,
  ) => Promise<ApiResponse>;
  updatePurchaseOrderClientProblemProduct: (
    params: UpdatePurchaseOrderClientProblemKey,
  ) => Promise<ApiResponse>;
  getPurchaseOrderClientProblemProductDetail: (
    params: GetDetailPurchaseOrderClientProblemKey,
  ) => Promise<ApiResponse>;
  getAllPurchaseOrderClientProblemProduct: (
    params: GetAllPurchaseOrderClientProblemKey,
  ) => void;
}

/** ===================== CONTEXT INIT ===================== */
const PurchaseOrderClientsContext = createContext<
  PurchaseOrderClientsContextType | undefined
>(undefined);

export const usePurchaseOrderClients = () => {
  const context = useContext(PurchaseOrderClientsContext);
  if (!context) {
    throw new Error(
      "usePurchaseOrderClients must be used within a PurchaseOrderClientsProvider",
    );
  }
  return context;
};

/** ===================== PROVIDER ===================== */
export const PurchaseOrderClientsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [clients, setClients] = useState<Client[] | null>([]);
  const [products, setProducts] = useState<any[] | null>([]);
  const [pagination, setPagination] = useState<Pagination>(null);
  const [purchaseOrderProblem, setPurchaseOrderProblem] = useState<
    PurchaseOrderProblem[]
  >([]);
  const [deliveryHistories, setDeliveryHistories] = useState<
    DeliveryHistories[]
  >([]);
  const [deliveryHistoryDetail, setDeliveryHistoryDetail] =
    useState<DeliveryHistoryDetail>();
  const [isLoading, setIsLoading] = useState(false);

  const [detailPurchaseOrderClient, setdetailPurchaseOrderClient] =
    useState<PurchaseOrderClientDetail | null>(null);

  /** ========== CLIENTS CRUD ========== */
  const getClients = async (): Promise<ApiResponse<Client[]> | null> => {
    try {
      const response = await API.get<ApiResponse<Client[]>>("/clients");
      if (response?.data?.status) {
        setClients(response?.data?.data);
        return response.data;
      } else {
        setClients([]);
      }
      return response.data;
    } catch (error) {
      setClients([]);
      console.error("Error fetching clients:", error);
      return null;
    }
  };

  const printTravelDocument = async (
    params: PrintTravelDocumentKey,
  ): Promise<ApiResponse> => {
    // buka window nanti saja setelah validasi berhasil
    try {
      setIsLoading(true);
      const response = await API.get(
        "/purchase-order/clients/travel-document",
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
        "/purchase-order/clients/assets",
      );

      if (response?.data?.status) {
        setProducts(response.data.data.products || []);
        setClients(response?.data?.data?.clients);
      } else {
        setProducts([]);
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      setProducts([]);
      return null;
    }
  };
  const getValidationStockByID = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/clients/description/travel-document",
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

  const createClient = async (
    data: Partial<Client>,
  ): Promise<ApiResponse<Client> | null> => {
    try {
      const response = await API.post<ApiResponse<Client>>(
        "/purchase-order/clients",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      return null;
    }
  };

  /** ========== PURCHASE ORDER CLIENTS CRUD ========== */
  const getPurchaseOrderClients =
    async (): Promise<ApiResponse<any> | null> => {
      try {
        const response = await API.get<ApiResponse<any>>(
          "/purchase-order-clients",
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching purchase order clients:", error);
        return null;
      }
    };

  const createPurchaseOrderClient = async (
    data: FormStatePurchaseOrderClient,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.post<ApiResponse<any>>(
        "/purchase-order/clients",
        data,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating purchase order client:", error);
      return null;
    }
  };
  const handleDetailPurchaseOrderClient = async (
    data: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/clients/detail",
        { params: data, withCredentials: true },
      );
      setdetailPurchaseOrderClient(response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client detail:", error);
      return null;
    }
  };
  const updatePurchaseOrderClient = async (
    data: FormStatePurchaseOrderClient,
  ): Promise<ApiResponse<any> | null> => {
    try {
      console.log(data, "req");
      const response = await API.patch<ApiResponse<any>>(
        "/purchase-order/clients",
        data,
      );
      console.log(response.data, "res");
      return response.data;
    } catch (error) {
      console.error("Error updating purchase order client:", error);
      return null;
    }
  };
  const deletePurchaseOrderClient = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.delete<ApiResponse<any>>(
        `/purchase-order/clients`,
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

  const getOnePurchaseOrderClient = async (
    id: number,
  ): Promise<ApiResponse<any> | null> => {
    try {
      const response = await API.get<ApiResponse<any>>(
        `/purchase-order-clients/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
      return null;
    }
  };
  const getPurchaseOrderDeliveryHistories = async (
    params: PurchaseOrderClientDeliveryHistoriesKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        `/purchase-order/clients/delivery-histories`,
        { params: params },
      );
      setPagination({
        total_data: response.data.data.total_data,
        total_page: response.data.data.total_page,
      });
      setDeliveryHistories(response.data.data.task);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const getPurchaseOrderDeliveryHistoryDetail = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        `/purchase-order/clients/delivery-history/detail`,
        { params: params },
      );
      console.log(response, "sibal");
      setDeliveryHistoryDetail(response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const updatePurchaseOrderDeliveryHistoryDetail = async (
    params: DeliveryUpdateStatus,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        `/purchase-order/clients/delivery-history/detail`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const deletePurchaseOrderCollections = async (
    params: PurchaseOrderCollectionKey,
  ): Promise<ApiResponse> => {
    try {
      setIsLoading(true);

      const response = await API.delete<ApiResponse>(
        `/purchase-order/clients/collection`,
        { params: params },
      );
      setIsLoading(false);

      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const updatePurchaseOrderCollections = async (
    params: PurchaseOrderClientCollectionFormState,
  ): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      const response = await API.patch<ApiResponse>(
        `/purchase-order/clients/collection`,
        params,
      );
      setIsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const createPurchaseOrderCollections = async (
    params: PurchaseOrderClientCollectionFormState,
  ): Promise<ApiResponse> => {
    try {
      setIsLoading(true);

      const response = await API.post<ApiResponse>(
        `/purchase-order/clients/collection`,
        params,
      );
      setIsLoading(false);

      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const getPurchaseOrderCollections = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        `/purchase-order/clients/collection`,
        { params: params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase order client:", error);
    }
  };
  const feedbackOrderClientCollection = async (
    params: PurchaseOrderCollectionFeedbackKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        "/purchase-order/clients/collection-verification",
        params,
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const purchaseOrderClientProblemProducts = async (
    params: UpdateProblemProductsRequest,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.post<ApiResponse>(
        "/purchase-order/clients/problem-product",
        params,
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const getPurchaseOrderClientProblemProduct = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/clients/problem-products",
        { params: params },
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const deletePurchaseOrderClientProblemProduct = async (
    params: PurchaseOrderClientDetailKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.delete<ApiResponse>(
        "/purchase-order/clients/problem-product",
        { params: params },
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const createPurchaseOrderClientProblemProduct = async (
    params: CreatePurchaseOrderClientProblemKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.post<ApiResponse>(
        "/purchase-order/clients/problem-product",
        params,
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const updatePurchaseOrderClientProblemProduct = async (
    params: UpdatePurchaseOrderClientProblemKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.patch<ApiResponse>(
        "/purchase-order/clients/problem-product",
        params,
      );
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const updatePurchaseOrderClientRefundProduct = async (
    params: PurchaseOrderClientRefundKey,
  ): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await API.patch<ApiResponse>(
        "/purchase-order/clients/refund",
        params,
      );
      setIsLoading(false);
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const getPurchaseOrderClientProducts = async (
    params: PurchaseOrderClientProductsKey,
  ): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/clients/products",
        { params: params },
      );
      setIsLoading(false);
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const getPurchaseOrderClientProblemProductDetail = async (
    params: GetDetailPurchaseOrderClientProblemKey,
  ): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await API.get<ApiResponse>(
        "/purchase-order/clients/problem-product/detail",
        { params: params },
      );
      setIsLoading(false);
      return response.data;
    } catch (e) {
      console.error("Error fetching purchase order client:", e);
      return null;
    }
  };
  const getAllPurchaseOrderClientProblemProduct = async (
    params: GetAllPurchaseOrderClientProblemKey,
  ) => {
    try {
      setIsLoading(true);
      const res = await API.get(
        `/purchase-order/clients/problem-products/all`,
        { params: params },
      );
      setIsLoading(false);
      setPurchaseOrderProblem(res.data.data);
    } catch (error) {
      console.error("Error fetching analytic data:", error);
      throw error;
    }
  };

  /** ========== CONTEXT VALUE ========== */
  const value: PurchaseOrderClientsContextType = {
    clients,
    isLoading,
    products,
    detailPurchaseOrderClient,
    deliveryHistories,
    pagination,
    deliveryHistoryDetail,
    purchaseOrderProblem,
    getClients,
    printTravelDocument,
    getValidationStockByID,
    getAssets,
    createClient,
    getPurchaseOrderClients,
    handleDetailPurchaseOrderClient,
    createPurchaseOrderClient,
    updatePurchaseOrderClient,
    deletePurchaseOrderClient,
    getOnePurchaseOrderClient,
    getPurchaseOrderDeliveryHistories,
    getPurchaseOrderDeliveryHistoryDetail,
    updatePurchaseOrderDeliveryHistoryDetail,
    deletePurchaseOrderCollections,
    updatePurchaseOrderCollections,
    createPurchaseOrderCollections,
    getPurchaseOrderCollections,
    feedbackOrderClientCollection,
    purchaseOrderClientProblemProducts,
    getPurchaseOrderClientProblemProduct,
    deletePurchaseOrderClientProblemProduct,
    updatePurchaseOrderClientRefundProduct,
    getPurchaseOrderClientProducts,
    createPurchaseOrderClientProblemProduct,
    updatePurchaseOrderClientProblemProduct,
    getPurchaseOrderClientProblemProductDetail,
    getAllPurchaseOrderClientProblemProduct,
  };

  return (
    <PurchaseOrderClientsContext.Provider value={value}>
      {children}
    </PurchaseOrderClientsContext.Provider>
  );
};
