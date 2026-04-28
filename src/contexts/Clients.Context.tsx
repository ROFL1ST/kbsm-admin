import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types";

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

interface FormStateClient {
  name?: string;
  path?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  type?: string;
  lat: string;
  long: string;
}

interface ClientPagination {
  total_data: number;
  total_page: number;
}
interface requestParams {
  limit: number;
  page: number;
  search?: string;
}

interface ClientsContextType {
  clients: Client[];
  client: Client;
  pagination: ClientPagination;
  getClients: () => Promise<Client[]>;
  createClient: (
    data: Omit<FormStateClient, "id">
  ) => Promise<FormStateClient | null>;
  createClientPage: (data: FormStateClient) => Promise<ApiResponse<any>>;
  getClientWithPagination: (params: requestParams) => Promise<ApiResponse<any>>;
  updateClientPage: (
    data: FormStateClient & { client_id: number }
  ) => Promise<ApiResponse<any>>;
  deleteClientPage: (client_id: number) => Promise<ApiResponse<any>>;
  getDetailClient: (client_id: number) => void;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);
export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
};

export const ClientsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client>();
  const [pagination, setPagination] = useState<ClientPagination>({
    total_data: 10,
    total_page: 1,
  });
  const { toast } = useToast();
  const getClients = async (): Promise<Client[]> => {
    try {
      const response = await API.get(`/clients`);

      if (response?.data?.status) {
        setClients(response.data.data);
        return response.data.data;
      } else {
        setClients([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
      return [];
    }
  };

  const getClientWithPagination = async (
    params: requestParams
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get(
        `/clients/list?page=${params.page}&size=${params.limit}&search=${
          params.search || ""
        }`
      );
      console.log("Client with pagination response:", res);
      setPagination({
        total_data: res.data.data.total_data,
        total_page: res.data.data.total_page,
      });
      setClients(res.data.data.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching clients with pagination:", error);
      throw error;
    }
  };

  const createClientPage = async (
    data: FormStateClient
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.post(`/clients`, data);
      return res.data;
    } catch (error) {
      console.error("Error creating client page:", error);
      throw error;
    }
  };

  const updateClientPage = async (
    data: FormStateClient & { client_id: number }
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.patch(`/clients`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating client page:", error);
      throw error;
    }
  };

  const deleteClientPage = async (
    client_id: number
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.delete(`/clients?client_id=${client_id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting client page:", error);
      throw error;
    }
  };
  const getDetailClient = async (client_id: number) => {
    try {
      const res = await API.get(`/clients/detail?client_id=${client_id}`);
      setClient(res.data.data);
    } catch (error) {
      console.error("Error deleting client page:", error);
      throw error;
    }
  };

  const createClient = async (
    data: Omit<FormStateClient, "id">
  ): Promise<FormStateClient | null> => {
    try {
      const response = await API.post("/clients", data);
      console.log(response);

      if (response?.data?.status) {
        toast({
          title: "Berhasil!",
          description: "Klien berhasil ditambahkan.",
        });
        const newClient = response.data.data;
        setClients((prev) => [...prev, newClient]);
        location.reload();
        return newClient;
      } else {
        toast({
          title: "Gagal!",
          description: "Masukan Minimal Data Lokasi dan Tipe Klien",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating client:", error);
      return null;
    }
  };

  const value: ClientsContextType = {
    clients,
    client,
    getClients,
    getClientWithPagination,
    createClient,
    createClientPage,
    updateClientPage,
    deleteClientPage,
    getDetailClient,
    pagination,
  };

  return (
    <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
  );
};
