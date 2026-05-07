import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Filter, Pagination } from "@/types";

// ─── Product Detail (for /products/details endpoint) ───────────────────────
export interface ProductDetailUnit {
  id: number;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  unit_code: string;
  hpp: number;
  price: number;
  status: string;
  discount_flag: boolean;
  discount_amount: number;
  final_price: number | null;
  is_best_seller: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  vendor_id: number | null;
}
export interface ProductDetailField {
  id: number;
  description: string;
  code: string;
  product_id: number;
  units: ProductDetailUnit[];
}

// ─── Products Inventory Header ───────────────────────────────────────────────
export interface ProductsInventoryHeader {
  total_products: number;
  total_product_follow_up: number;
  total_product_price_follow_up: number;
}

// ─── Products Inventory Item (list response) ────────────────────────────────
export interface ProductsInventoryField {
  product_id: number;
  product_detail_id: number;
  category_id: number;
  category_name: string;
  product_unit_id: number;
  name: string;
  product_name: string;
  product_description: string;
  code: string;
  total_quantity: number;
  unit_code: string;
  hpp: number;
  price: number;
  discount_flag: boolean;
  discount_amount: number;
  final_price: number | null;
  is_best_seller: boolean;
  path: string;
  margin: number;
  exx: number;
}

// ─── Products Follow-Up ──────────────────────────────────────────────────────
export interface ProductsFollowUPField {
  product_detail_id: number;
  product_unit_id: number;
  unit_code: string;
  name: string;
  product_name: string;
  description: string;
  status_code: string;
  status: string;
  status_badge: string;
  quantity: number;
  hpp: number;
  price: number;
  total_quantity: number;
  product_id: number;
}

// ─── Distribution Types ──────────────────────────────────────────────────────
export interface ProductDistributionsKey {
  size: number;
  page: number;
  search: string;
  start_date?: string;
  end_date?: string;
}
export interface ProductDistributionsStoreKey {
  travel_code: string;
  type: string;
}
export interface ProductDistributionFilter {
  status_distribution_code: Filter[];
  transaction_code: Filter[];
}

interface ProductDistributions {
  code: string;
  name: string;
  product_name: string;
  exx: number;
  quantity: number;
  status_distribution: string;
  unit_code: string;
  transaction_type: string;
  status_distribution_code: string;
  transaction_type_code: string;
  transactions_id: string;
  source_table: string;
  created_at: string;
  created_by: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────
export interface ProductsInventoryKey {
  search: string;
  type?: number | string;
  category_id?: number | string;
  vendor_id?: number;
  size: number;
  page: number;
}
export interface ProductsByVendorID {
  vendor_id: number;
}
export interface ProductUnitID {
  product_unit_id: number;
}
export interface ProductUnitIDInventoryKey {
  product_unit_id: number;
}

// ─── Form / Mutation Keys ─────────────────────────────────────────────────────
export interface CreateProductsInventoryKey {
  name: string;
  description: string;
  unit_code: string;
  total_quantity: number;
  hpp: number;
  price: number;
  category_id: number;
  status?: string;
  path?: File | File[];
  is_best_seller: boolean;
}
export interface UpdateProductsInventoryKey {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  name: string;
  hpp: number;
  price: number;
  description: string;
  unit_code: string;
  quantity: number;
  category_id: number;
  status?: string;
  /** New image files to upload */
  path?: File | File[];
  /** Existing image URLs to keep — always pass as array (empty = hapus semua existing) */
  path_exst: string[];
  is_best_seller: boolean;
}

// ─── Detail form shape (used by Create/Edit pages) ───────────────────────────
export interface ProductsInventoryDetailField {
  product_id: number | null;
  product_detail_id: number | null;
  product_unit_id: number | null;
  name: string | null;
  product_name: string | null;
  product_description: string | null;
  code: string | null;
  total_quantity: number;
  unit_code: string | null;
  hpp: number;
  price: number;
  category_id: number | null;
  status?: string | null;
  path?: File | File[] | null;
  is_best_seller: boolean;
}

// ─── Restock ─────────────────────────────────────────────────────────────────
export interface Restock {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  name: string;
  product_name: string;
  product_description: string;
  code: string;
  total_quantity: number;
  unit_code: string;
}

// ─── Request Stock ────────────────────────────────────────────────────────────
interface RequestStock {
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
  name: string;
  exist: number;
}
export interface RequestPurchaseOrderStock {
  purchase_order_client_id: string;
  request: RequestStock[];
}

// ─── Context Type ─────────────────────────────────────────────────────────────
interface ProductsContextType {
  productDetail: ProductDetailField[];
  productDistributions: ProductDistributions[];
  productDistributionFilter: ProductDistributionFilter;
  pagination: Pagination;
  productsFollowUP: ProductsFollowUPField[];
  restock: Restock[];
  productsInventory: ProductsInventoryField[];
  paginationRestock: Pagination;
  getProductDetails: (productId: number) => Promise<any>;
  getProductsFollowUP: () => Promise<ApiResponse>;
  getProductsFollowUPDetail: (productUnitID: ProductUnitID) => Promise<ApiResponse>;
  requestPurchaseOrderStock: (data: RequestPurchaseOrderStock) => Promise<ApiResponse>;
  getProductDistributions: (data: ProductDistributionsKey) => Promise<ApiResponse>;
  createProductDistributions: (data: ProductDistributionsStoreKey) => Promise<ApiResponse>;
  getInventory: (data: ProductsInventoryKey) => Promise<ApiResponse>;
  getProductsByVendorID: (data: ProductsByVendorID) => Promise<ApiResponse>;
  updateInventory: (data: UpdateProductsInventoryKey) => Promise<ApiResponse>;
  createInventory: (data: CreateProductsInventoryKey) => Promise<ApiResponse>;
  deleteInventory: (data: ProductUnitIDInventoryKey) => Promise<ApiResponse>;
  getInventoryDetail: (data: ProductUnitIDInventoryKey) => Promise<ApiResponse>;
  getRestock: (params: { search: string; page: number; size: number }) => Promise<ApiResponse<any>>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productDetail, setProductDetail] = useState<ProductDetailField[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);
  const [productsInventory, setProductsInventory] = useState<ProductsInventoryField[]>([]);
  const [productsFollowUP, setProductsFollowUP] = useState<ProductsFollowUPField[]>([]);
  const [productDistributions, setProductDistributions] = useState<ProductDistributions[]>([]);
  const [productDistributionFilter, setProductDistributionFilter] = useState<ProductDistributionFilter>(null);
  const [restock, setRestock] = useState<Restock[]>([]);
  const [paginationRestock, setPaginationRestock] = useState<Pagination>(null);

  // ── GET /products/details ─────────────────────────────────────────────────
  const getProductDetails = async (productId: number): Promise<any> => {
    try {
      const response = await API.get("/products/details", {
        params: { product_id: productId },
      });
      if (response?.data?.status) {
        setProductDetail(response.data.data);
        return response.data.data;
      } else {
        setProductDetail([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDetail([]);
      return [];
    }
  };

  // ── GET /products/distributions ───────────────────────────────────────────
  const getProductDistributions = async (params: ProductDistributionsKey): Promise<ApiResponse> => {
    try {
      const response = await API.get("/products/distributions", { params });
      if (response?.data?.status) {
        setPagination({
          total_page: response?.data?.data?.total_page,
          total_data: response?.data?.data?.total_data,
        });
        setProductDistributionFilter({
          status_distribution_code: response?.data?.data?.status_distribution_code,
          transaction_code: response?.data?.data?.transaction_code,
        });
        setProductDistributions(response.data.data.products);
        return response?.data;
      }
    } catch (error) {
      console.error("Error fetching product distributions:", error);
      setProductDistributions([]);
    }
  };

  // ── POST /products/distribution ───────────────────────────────────────────
  const createProductDistributions = async (params: ProductDistributionsStoreKey): Promise<ApiResponse> => {
    try {
      const response = await API.post("/products/distribution", params);
      return response.data;
    } catch (error) {
      console.error("Error creating product distribution:", error);
    }
  };

  // ── POST /products/request ────────────────────────────────────────────────
  const requestPurchaseOrderStock = async (params: RequestPurchaseOrderStock): Promise<ApiResponse | null> => {
    try {
      const response = await API.post<ApiResponse>("/products/request", params);
      return response.data;
    } catch (error) {
      console.error("Error requesting purchase order stock:", error);
      return null;
    }
  };

  // ── GET /products/follow-up ───────────────────────────────────────────────
  const getProductsFollowUP = async (): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/follow-up");
      setProductsFollowUP(response?.data?.data ?? []);
      return response?.data;
    } catch (error) {
      console.error("Error fetching follow-up products:", error);
      return null;
    }
  };

  // ── GET /products/follow-up/detail ────────────────────────────────────────
  const getProductsFollowUPDetail = async (params: ProductUnitID): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/follow-up/detail", { params });
      return response?.data;
    } catch (error) {
      console.error("Error fetching follow-up detail:", error);
      return null;
    }
  };

  // ── GET /products (list with filters) ────────────────────────────────────
  const getInventory = async (params: ProductsInventoryKey): Promise<ApiResponse | null> => {
    try {
      const cleanParams: Record<string, any> = {};
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          cleanParams[key] = val;
        }
      });

      const response = await API.get<ApiResponse>("/products", { params: cleanParams });
      setPagination({
        total_data: response?.data?.data?.total_data,
        total_page: response?.data?.data?.total_page,
      });
      setProductsInventory(response?.data?.data?.products ?? []);
      return response?.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return null;
    }
  };

  // ── GET /products/vendor ──────────────────────────────────────────────────
  const getProductsByVendorID = async (params: ProductsByVendorID): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/vendor", { params });
      setProductsInventory(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Error fetching products by vendor:", error);
      return null;
    }
  };

  // ── PATCH /products (update) ──────────────────────────────────────────────
  const updateInventory = async (params: UpdateProductsInventoryKey): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("product_id", String(params.product_id));
      formData.append("product_detail_id", String(params.product_detail_id));
      formData.append("product_unit_id", String(params.product_unit_id));
      formData.append("name", params.name);
      formData.append("description", params.description);
      formData.append("unit_code", params.unit_code);
      formData.append("hpp", String(params.hpp));
      formData.append("price", String(params.price));
      formData.append("quantity", String(params.quantity));
      formData.append("category_id", String(params.category_id));
      formData.append("is_best_seller", String(params.is_best_seller));
      if (params.status) formData.append("status", params.status);

      // New image files
      if (params.path) {
        if (Array.isArray(params.path)) {
          params.path.forEach((file) => formData.append("path", file));
        } else {
          formData.append("path", params.path);
        }
      }

      // Existing image URLs — bracket notation supaya backend parse sebagai array.
      // Kalau kosong (hapus semua existing), kirim satu entry string kosong
      // agar field path_exst[] tetap hadir di FormData dan backend tahu harus clear.
      if (params.path_exst.length > 0) {
        params.path_exst.forEach((url) => formData.append("path_exst[]", url));
      } else {
        formData.append("path_exst[]", "");
      }

      const response = await API.patch<ApiResponse>("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });
      return response?.data;
    } catch (error) {
      console.error("Error updating inventory:", error);
      return null;
    }
  };

  // ── POST /products (create) ───────────────────────────────────────────────
  const createInventory = async (params: CreateProductsInventoryKey): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("description", params.description);
      formData.append("unit_code", params.unit_code);
      formData.append("hpp", String(params.hpp));
      formData.append("price", String(params.price));
      formData.append("total_quantity", String(params.total_quantity));
      formData.append("category_id", String(params.category_id));
      formData.append("is_best_seller", String(params.is_best_seller));
      if (params.status) formData.append("status", params.status);
      if (params.path) {
        if (Array.isArray(params.path)) {
          params.path.forEach((file) => formData.append("path", file));
        } else {
          formData.append("path", params.path);
        }
      }

      const response = await API.post<ApiResponse>("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });
      return response?.data;
    } catch (error) {
      console.error("Error creating inventory:", error);
      return null;
    }
  };

  // ── DELETE /products ──────────────────────────────────────────────────────
  const deleteInventory = async (params: ProductUnitIDInventoryKey): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/products", { params });
      return response?.data;
    } catch (error) {
      console.error("Error deleting inventory:", error);
      return null;
    }
  };

  // ── GET /products/detail (single unit detail) ─────────────────────────────
  const getInventoryDetail = async (params: ProductUnitIDInventoryKey): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/detail", { params });
      return response?.data;
    } catch (error) {
      console.error("Error fetching inventory detail:", error);
      return null;
    }
  };

  // ── GET /products/restock ─────────────────────────────────────────────────
  const getRestock = async (params: { search: string; page: number; size: number }): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get<ApiResponse>(
        `/products/restock?search=${params.search}&page=${params.page}&size=${params.size}`,
      );
      setRestock(res.data.data.products);
      setPaginationRestock({
        total_data: res?.data?.data?.total_data,
        total_page: res?.data?.data?.total_page,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching restock data:", error);
      throw error;
    }
  };

  const value: ProductsContextType = {
    pagination,
    productDetail,
    productDistributionFilter,
    productDistributions,
    productsFollowUP,
    productsInventory,
    restock,
    paginationRestock,
    getProductsFollowUP,
    getProductsFollowUPDetail,
    getProductDetails,
    requestPurchaseOrderStock,
    getProductDistributions,
    createProductDistributions,
    getInventory,
    getProductsByVendorID,
    updateInventory,
    createInventory,
    deleteInventory,
    getInventoryDetail,
    getRestock,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
