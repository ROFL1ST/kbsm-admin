import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Filter, Pagination } from "@/types";

export interface CategoryCode {
  value: string;
  lookup_value_id: number;
  lookup_value_code: string;
  lookup_code: string;
  type: string;
  description: string;
  total: number;
}

export interface FormStateCategoryCode {
  value: string;
  description: string;
  lookup_code: string;
  lookup_value_code: string;
}
export interface CategoryCodeKeyDetail extends FormStateCategoryCode {
  lookup_value_id: number;
}
export interface Finance {
  status: boolean;
  code: number;
  data: Data;
  messages: null;
}

export interface Data {
  total_data: number;
  total_page: number;
  status_code: Code[];
  category_code: Code[];
  data: FinanceDataList[];
}

export interface Code {
  lookup_value_code: string;
  value: string;
}

export interface FinanceFilter {
  page: number;
  size: number;
  search: string;
  category_code?: string;
  status_code?: string;
  finance_code: string;
  start_date?: string;
  end_date?: string;
}

export interface FinanceDataList {
  id: number;
  type: string;
  category: string;
  status: string;
  type_badge: string;
  category_badge: string;
  status_badge: string;
  finance_code: string;
  category_code: string;
  status_code: string;
  source_id: string;
  source_table: string;
  total: number;
  reference?: string;
  path: null;
  description: string;
  input_date: Date;
  created_at: Date;
  exx: number;
}

export interface FormStateFinanceInOut {
  finance_code: string | null;
  category_code: string | null;
  status_code: string | null;
  total: number;
  description: string;
  path: string | null;
  source_id: string | null;
  source_table: string | null;
  input_date: string;
}

export interface Analytic {
  label: string;
  value: number;
  navigate: number;
  description: string;
}

export interface FormStateFinanceEdit extends FormStateFinanceInOut {
  finance_id: number;
}

interface FinanceContextType {
  getFinance: (filter: FinanceFilter) => Promise<ApiResponse>;
  createFinance: (data: FormStateFinanceInOut) => Promise<ApiResponse<any>>;
  updateFinance: (data: FormStateFinanceEdit) => Promise<ApiResponse<any>>;
  deleteFinance: (id: number) => Promise<ApiResponse<any>>;
  getCategoryCode: (params: {
    size: number;
    page: number;
    lookup_code: string;
  }) => Promise<ApiResponse<any>>;
  addCategoryCode: (code: FormStateCategoryCode) => Promise<ApiResponse<any>>;
  updateCategoryCode: (
    code: CategoryCodeKeyDetail
  ) => Promise<ApiResponse<any>>;
  deleteCategoryCode: (params) => Promise<ApiResponse<any>>;
  getAnalytic: (params) => Promise<ApiResponse<any>>;
  listFinance: FinanceDataList[];
  pagination: Pagination;
  statusCode: Code[];
  categoryCode: CategoryCode[];
  analytic: Analytic[];
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [listFinance, setListFinance] = useState<FinanceDataList[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);
  const [categoryCode, setCategoryCode] = useState<CategoryCode[]>([]);
  const [statusCode, setStatusCode] = useState<Code[]>([]);
  const [analytic, setAnalytic] = useState<Analytic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFinance = async (
    filter: FinanceFilter
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await API.get(
        `/finance?page=${filter.page}&size=${filter.size}&search=${
          filter.search
        }${
          filter.category_code ? `&category_code=${filter.category_code}` : ""
        }${
          filter.status_code ? `&status_code=${filter.status_code}` : ""
        }&finance_code=${filter.finance_code}${
          filter.start_date ? `&start_date=${filter.start_date}` : ""
        }${filter.end_date ? `&end_date=${filter.end_date}` : ""}`
      );

      if (response?.data?.status) {
        setPagination({
          total_page: response?.data?.data?.total_page,
          total_data: response?.data?.data?.total_data,
        });
        setListFinance(response.data.data?.data);
        setStatusCode(response.data.data?.status_code);
        console.log(response.data.data.status_code);
        return response.data;
      } else {
        setListFinance([]);
        return null;
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
      setListFinance([]);
      return null;
    }
  };

  const createFinance = async (
    data: FormStateFinanceInOut
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await API.post("/finance", data);
      return response.data;
    } catch (error) {
      console.error("Error creating finance record:", error);
      throw error;
    }
  };

  const updateFinance = async (
    data: FormStateFinanceEdit
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await API.patch("/finance", data);
      return response.data;
    } catch (error) {
      console.error("Error updating finance record:", error);
      throw error;
    }
  };

  const deleteFinance = async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await API.delete(`/finance?finance_id=${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting finance record:", error);
      throw error;
    }
  };

  const getCategoryCode = async (params): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get(
        `parameter/lookup-values?size=${params.size}&page=${params.page}&lookup_code=${params.lookup_code}`
      );
      setCategoryCode(res.data.data);
      console.log("Category Code:", res.data.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching category code:", error);
      throw error;
    }
  };

  const addCategoryCode = async (
    code: FormStateCategoryCode
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.post("parameter/lookup-values", code);
      return res.data;
    } catch (error) {
      console.error("Error adding category code:", error);
      throw error;
    }
  };

  const updateCategoryCode = async (
    code: CategoryCodeKeyDetail
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.patch("parameter/lookup-values", code);
      return res.data;
    } catch (error) {
      console.error("Error updating category code:", error);
      throw error;
    }
  };

  const deleteCategoryCode = async (params): Promise<ApiResponse> => {
    try {
      const res = await API.delete(
        `parameter/lookup-values?lookup_value_id=${params}`
      );
      return res.data;
    } catch (error) {
      console.log("Error handling delete category : ", error);
      throw error;
    }
  };

  const getAnalytic = async (params): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get(
        `/finance/global-analynic?start_date=${params.start_date}&end_date=${params.end_date}`
      );
      console.log("Analytic Data:", res);
      setAnalytic(res.data.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching analytic data:", error);
      throw error;
    }
  };

  const value: FinanceContextType = {
    getFinance,
    createFinance,
    updateFinance,
    deleteFinance,
    getCategoryCode,
    addCategoryCode,
    updateCategoryCode,
    deleteCategoryCode,
    getAnalytic,
    listFinance,
    pagination,
    statusCode,
    categoryCode,
    analytic,
    isLoading,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};
