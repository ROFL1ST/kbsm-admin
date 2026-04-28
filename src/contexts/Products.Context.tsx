import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Filter, Pagination } from "@/types";

interface ProductDetails {
  id: number;
  product_id: number;
  description: string;
}
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
interface RequestStock {
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
  name: string;
  exist: number;
}
interface ProductsFollowUP {
  product_detail_id: number;
  product_unit_id: number;
  unit_code: string;
  name: string;
  quantity: number;
  total_quantity: number;
}

export interface RequestPurchaseOrderStock {
  purchase_order_client_id: string;
  request: RequestStock[];
}
export interface ProductUnitID {
  product_unit_id: number;
}
export interface ProductsInventoryKey {
  search: string;
  type: number;
  vendor_id?: number;
  size: number;
  page: number;
}
export interface ProductsByVendorID {
  vendor_id: number;
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
  vendor_id: number;
}
export interface CreateProductsInventoryKey {
  name: string;
  description: string;
  unit_code: string;
  total_quantity: number;
  hpp: number;
  price: number;
  vendor_id: number;
}
export interface ProductUnitIDInventoryKey {
  product_unit_id: number;
}
export interface ProductsInventoryField {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  name: string;
  product_name: string;
  product_description: string;
  code: number;
  margin: number;
  total_quantity: number;
  unit_code: string;
}
export interface ProductsInventoryDetailField {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  product_name: string;
  name: string;
  hpp: number;
  price: number;
  product_description: string;
  code: number;
  total_quantity: number;
  unit_code: string;
  vendor_id: number;
}

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

interface ProductsContextType {
  productDetail: ProductDetails[];
  productDistributions: ProductDistributions[];
  productDistributionFilter: ProductDistributionFilter;
  pagination: Pagination;
  productsFollowUP: ProductsFollowUP[] | [];
  restock: Restock[];
  productsInventory: ProductsInventoryField[] | [];
  paginationRestock: Pagination;
  getProductDetails: (productId: number) => Promise<any>;
  getProductsFollowUP: () => Promise<ApiResponse>;
  getProductsFollowUPDetail: (
    productUnitID: ProductUnitID,
  ) => Promise<ApiResponse>;
  requestPurchaseOrderStock: (
    data: RequestPurchaseOrderStock,
  ) => Promise<ApiResponse>;
  getProductDistributions: (
    data: ProductDistributionsKey,
  ) => Promise<ApiResponse>;
  createProductDistributions: (
    data: ProductDistributionsStoreKey,
  ) => Promise<ApiResponse>;
  getInventory: (data: ProductsInventoryKey) => Promise<ApiResponse>;
  getProductsByVendorID: (data: ProductsByVendorID) => Promise<ApiResponse>;
  updateInventory: (data: UpdateProductsInventoryKey) => Promise<ApiResponse>;
  createInventory: (data: CreateProductsInventoryKey) => Promise<ApiResponse>;
  deleteInventory: (data: ProductUnitIDInventoryKey) => Promise<ApiResponse>;
  getInventoryDetail: (data: ProductUnitIDInventoryKey) => Promise<ApiResponse>;
  getRestock: (params: {
    search: string;
    page: number;
    size: number;
  }) => Promise<ApiResponse<any>>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [productDetail, setProductDetail] = useState<ProductDetails[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);
  const [productsInventory, setProductsInventory] = useState<
    ProductsInventoryField[]
  >([]);
  const [productsFollowUP, setProductsFollowUP] = useState<ProductsFollowUP[]>(
    [],
  );
  const [productDistributions, setProductDistributions] = useState<
    ProductDistributions[]
  >([]);
  const [productDistributionFilter, setProductDistributionFilter] =
    useState<ProductDistributionFilter>(null);
  const [restock, setRestock] = useState<Restock[]>([]);
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

  const getProductDistributions = async (
    params: ProductDistributionsKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.get("/products/distributions", {
        params: params,
      });
      if (response?.data?.status) {
        setPagination({
          total_page: response?.data?.data?.total_page,
          total_data: response?.data?.data?.total_data,
        });
        setProductDistributionFilter({
          status_distribution_code:
            response?.data?.data?.status_distribution_code,
          transaction_code: response?.data?.data?.transaction_code,
        });
        setProductDistributions(response.data.data.products);
        return response?.data;
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDistributions([]);
    }
  };
  const createProductDistributions = async (
    params: ProductDistributionsStoreKey,
  ): Promise<ApiResponse> => {
    try {
      const response = await API.post("/products/distribution", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };
  const requestPurchaseOrderStock = async (
    params: RequestPurchaseOrderStock,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.post<ApiResponse>("/products/request", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const getProductsFollowUP = async (): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/follow-up");
      setProductsFollowUP(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const getProductsFollowUPDetail = async (
    params: ProductUnitID,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>(
        "/products/follow-up/detail",
        { params: params },
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const getInventory = async (
    params: ProductsInventoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products", {
        params: params,
      });
      setPagination({
        total_data: response?.data?.data?.total_data,
        total_page: response?.data?.data?.total_page,
      });
      setProductsInventory(response?.data?.data?.products);
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const getProductsByVendorID = async (
    params: ProductsByVendorID,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/vendor", {
        params: params,
      });
      setProductsInventory(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const updateInventory = async (
    params: UpdateProductsInventoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.patch<ApiResponse>("/products", params);
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const createInventory = async (
    params: CreateProductsInventoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.post<ApiResponse>("/products", params);
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const deleteInventory = async (
    params: ProductUnitIDInventoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/products", {
        params: params,
      });
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };
  const getInventoryDetail = async (
    params: ProductUnitIDInventoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/detail", {
        params: params,
      });
      return response?.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      return null;
    }
  };

  const [paginationRestock, setPaginationRestock] = useState<Pagination>(null);
  const getRestock = async (params: {
    search: string;
    page: number;
    size: number;
  }): Promise<ApiResponse<any>> => {
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

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
