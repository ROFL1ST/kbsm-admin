import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Pagination } from "@/types";

export interface Category {
  id: number;
  name: string;
  path: string;
  type: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  exx: number;
}

export interface GetCategoriesKey {
  size: number;
  page: number;
  search?: string;
}

export interface CreateCategoryKey {
  name: string;
  path: File;
}

export interface UpdateCategoryKey {
  name: string;
  path?: File | null;
  category_id: number;
}

export interface DeleteCategoryKey {
  category_id: number;
}

interface CategoriesContextType {
  categories: Category[];
  pagination: Pagination;
  getCategories: (params: GetCategoriesKey) => Promise<ApiResponse | null>;
  createCategory: (params: CreateCategoryKey) => Promise<ApiResponse | null>;
  updateCategory: (params: UpdateCategoryKey) => Promise<ApiResponse | null>;
  deleteCategory: (params: DeleteCategoryKey) => Promise<ApiResponse | null>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);

  const getCategories = async (
    params: GetCategoriesKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/categories", { params });
      if (response?.data?.status) {
        setPagination({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
        setCategories(response.data.data.data);
      }
      return response?.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return null;
    }
  };

  const createCategory = async (
    params: CreateCategoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("path", params.path);
      const response = await API.post<ApiResponse>("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  };

  const updateCategory = async (
    params: UpdateCategoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("category_id", String(params.category_id));
      if (params.path) {
        formData.append("path", params.path);
      }
      const response = await API.patch<ApiResponse>("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error updating category:", error);
      return null;
    }
  };

  const deleteCategory = async (
    params: DeleteCategoryKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/categories", {
        params,
      });
      return response?.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      return null;
    }
  };

  const value: CategoriesContextType = {
    categories,
    pagination,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
