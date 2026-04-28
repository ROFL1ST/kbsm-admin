import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse, Pagination } from "@/types";

interface Vendors {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: string;
  long?: string;
}
interface VendorUpdate {
  vendor_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: string;
  long?: string;
}
export interface RequestList {
  size: number;
  page: number;
  search?: string;
}
export interface DetailVendor {
  vendor_id: number;
}
interface VendorsPagination {
  total_data: number;
  total_page: number;
}

interface VendorsContextType {
  vendors: Vendors[];
  pagination: Pagination;
  getVendors: (params: RequestList) => Promise<ApiResponse>;
  createVendors: (params: Omit<Vendors, "id">) => Promise<Vendors | null>;
  updateVendors: (params: VendorUpdate) => Promise<ApiResponse>;
  deleteVendor: (params: DetailVendor) => Promise<ApiResponse>;
}

const VendorsContext = createContext<VendorsContextType | undefined>(undefined);
export const useVendors = () => {
  const context = useContext(VendorsContext);
  if (!context) {
    throw new Error("useVendors must be used within a VendorsProvider");
  }
  return context;
};

export const VendorsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [vendors, setVendors] = useState<Vendors[]>([]);
  const [pagination, setPagination] = useState<VendorsPagination>({
    total_data: 10,
    total_page: 1,
  });
  const { toast } = useToast();
  const getVendors = async (params: RequestList): Promise<ApiResponse> => {
    try {
      const response = await API.get("/vendors", { params: params });
      setVendors(response?.data?.data?.data);
      setPagination({
        total_data: response.data.data.total_data,
        total_page: response.data.data.total_page,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const createVendors = async (
    data: Omit<Vendors, "id">,
  ): Promise<Vendors | null> => {
    try {
      const response = await API.post("/vendors", data);
      if (response?.data?.status) {
        toast({
          title: "Berhasil!",
          description: "vendor berhasil ditambahkan.",
        });
        const newVendors = response.data.data;
        setVendors((prev) => [...prev, newVendors]);
        location.reload();
        return newVendors;
      } else {
        toast({
          title: "Gagal!",
          description: "Gagal menambahkan vendor.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating client:", error);
      return null;
    }
  };
  const updateVendors = async (params: VendorUpdate): Promise<ApiResponse> => {
    try {
      const response = await API.patch("/vendors", params);

      if (response?.data?.status) {
        toast({
          title: "Berhasil!",
          description: "vendor berhasil diperbaharui.",
        });
        const newVendors = response.data.data;
        location.reload();
        return newVendors;
      } else {
        toast({
          title: "Gagal!",
          description: response?.data?.messages || "Gagal perbaharui vendor.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating client:", error);
      return null;
    }
  };

  const deleteVendor = async (params: DetailVendor): Promise<ApiResponse> => {
    try {
      const res = await API.delete(`/vendors`, {
        params: params,
      });
      return res.data;
    } catch (error) {
      console.error("Error deleting client page:", error);
      throw error;
    }
  };

  const value: VendorsContextType = {
    vendors,
    pagination,
    getVendors,
    createVendors,
    updateVendors,
    deleteVendor,
  };

  return (
    <VendorsContext.Provider value={value}>{children}</VendorsContext.Provider>
  );
};
