import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Pagination } from "@/types";

export interface Bank {
  id: number;
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetBanksKey {
  size: number;
  page: number;
  search?: string;
}

export interface CreateBankKey {
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo: File;
  is_active: boolean;
}

export interface UpdateBankKey {
  bank_id: number;
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo?: File | null;
  is_active: boolean;
}

export interface DeleteBankKey {
  bank_id: number;
}

interface BanksContextType {
  banks: Bank[];
  pagination: Pagination;
  getBanks: (params: GetBanksKey) => Promise<ApiResponse | null>;
  createBank: (params: CreateBankKey) => Promise<ApiResponse | null>;
  updateBank: (params: UpdateBankKey) => Promise<ApiResponse | null>;
  deleteBank: (params: DeleteBankKey) => Promise<ApiResponse | null>;
}

const BanksContext = createContext<BanksContextType | undefined>(undefined);

export const useBanks = () => {
  const context = useContext(BanksContext);
  if (!context) {
    throw new Error("useBanks must be used within a BanksProvider");
  }
  return context;
};

export const BanksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);

  const getBanks = async (
    params: GetBanksKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/banks", { params });
      if (response?.data?.status) {
        setPagination({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
        setBanks(response.data.data.data);
      }
      return response?.data;
    } catch (error) {
      console.error("Error fetching banks:", error);
      return null;
    }
  };

  const createBank = async (
    params: CreateBankKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("code", params.code);
      formData.append("name", params.name);
      formData.append("account_number", params.account_number);
      formData.append("account_name", params.account_name);
      formData.append("logo", params.logo);
      formData.append("is_active", String(params.is_active));
      const response = await API.post<ApiResponse>("/banks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error creating bank:", error);
      return null;
    }
  };

  const updateBank = async (
    params: UpdateBankKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("bank_id", String(params.bank_id));
      formData.append("code", params.code);
      formData.append("name", params.name);
      formData.append("account_number", params.account_number);
      formData.append("account_name", params.account_name);
      formData.append("is_active", String(params.is_active));
      if (params.logo) {
        formData.append("logo", params.logo);
      }
      const response = await API.patch<ApiResponse>("/banks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error updating bank:", error);
      return null;
    }
  };

  const deleteBank = async (
    params: DeleteBankKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/banks", { params });
      return response?.data;
    } catch (error) {
      console.error("Error deleting bank:", error);
      return null;
    }
  };

  const value: BanksContextType = {
    banks,
    pagination,
    getBanks,
    createBank,
    updateBank,
    deleteBank,
  };

  return (
    <BanksContext.Provider value={value}>{children}</BanksContext.Provider>
  );
};
