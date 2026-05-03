import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Pagination } from "@/types";

export interface Discount {
  id: number;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  name: string;
  category_id: number;
  image: string;
  original_price: number;
  discount_percentage: number;
  final_price: number;
  valid_until: string;
  created_at: string;
  updated_at: string;
  exx: number;
}

export interface GetDiscountsKey {
  size: number;
  page: number;
  search?: string;
}

export interface CreateDiscountKey {
  path: File;
  name: string;
  discount_percentage: number;
  original_price: number;
  final_price: number;
  category_id: number;
  product_unit_id: number;
  product_detail_id: number;
  product_id: number;
  valid_until: string;
}

export interface UpdateDiscountKey {
  discount_id: number;
  path?: File | null;
  name: string;
  discount_percentage: number;
  original_price: number;
  final_price: number;
  category_id: number;
  product_unit_id: number;
  product_detail_id: number;
  product_id: number;
  valid_until: string;
}

export interface DeleteDiscountKey {
  discount_id: number;
}

interface DiscountsContextType {
  discounts: Discount[];
  pagination: Pagination;
  getDiscounts: (params: GetDiscountsKey) => Promise<ApiResponse | null>;
  createDiscount: (params: CreateDiscountKey) => Promise<ApiResponse | null>;
  updateDiscount: (params: UpdateDiscountKey) => Promise<ApiResponse | null>;
  deleteDiscount: (params: DeleteDiscountKey) => Promise<ApiResponse | null>;
}

const DiscountsContext = createContext<DiscountsContextType | undefined>(
  undefined,
);

export const useDiscounts = () => {
  const context = useContext(DiscountsContext);
  if (!context) {
    throw new Error("useDiscounts must be used within a DiscountsProvider");
  }
  return context;
};

export const DiscountsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);

  const getDiscounts = async (
    params: GetDiscountsKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/discounts", { params });
      if (response?.data?.status) {
        setPagination({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
        setDiscounts(response.data.data.data);
      }
      return response?.data;
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return null;
    }
  };

  const createDiscount = async (
    params: CreateDiscountKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("image", params.path);
      formData.append("name", params.name);
      formData.append("discount_percentage", String(params.discount_percentage));
      formData.append("original_price", String(params.original_price));
      formData.append("final_price", String(params.final_price));
      formData.append("category_id", String(params.category_id));
      formData.append("product_unit_id", String(params.product_unit_id));
      formData.append("product_detail_id", String(params.product_detail_id));
      formData.append("product_id", String(params.product_id));
      formData.append("valid_until", params.valid_until);
      const response = await API.post<ApiResponse>("/discounts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error creating discount:", error);
      return null;
    }
  };

  const updateDiscount = async (
    params: UpdateDiscountKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("discount_id", String(params.discount_id));
      formData.append("name", params.name);
      formData.append("discount_percentage", String(params.discount_percentage));
      formData.append("original_price", String(params.original_price));
      formData.append("final_price", String(params.final_price));
      formData.append("category_id", String(params.category_id));
      formData.append("product_unit_id", String(params.product_unit_id));
      formData.append("product_detail_id", String(params.product_detail_id));
      formData.append("product_id", String(params.product_id));
      formData.append("valid_until", params.valid_until);
      if (params.path) {
        formData.append("image", params.path);
      }
      const response = await API.patch<ApiResponse>("/discounts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error updating discount:", error);
      return null;
    }
  };

  const deleteDiscount = async (
    params: DeleteDiscountKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/discounts", { params });
      return response?.data;
    } catch (error) {
      console.error("Error deleting discount:", error);
      return null;
    }
  };

  const value: DiscountsContextType = {
    discounts,
    pagination,
    getDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  };

  return (
    <DiscountsContext.Provider value={value}>
      {children}
    </DiscountsContext.Provider>
  );
};
