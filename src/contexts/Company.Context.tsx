import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse } from "@/types";

/* =======================
   TYPES
======================= */

export interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  image: string;
  pic_name: string;
  active: boolean;
  subdomain: string;
  npwp: string;
  nib: string;
  created_at: Date;
  companyBilling: CompanyBilling;
}
export interface CompanyBilling {
  company_id: string;
  billing_cycle: string;
  package: string;
  due_date: string;
  ppn_percentage: number;
  percentage_amount: number;
  price: number;
  total: number;
}

interface FormStateCompany {
  company_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  image: string;
  pic_name: string;
  subdomain: string;
  npwp: string;
  nib: string;
}

interface CompanyContextType {
  company?: Company;
  getDetailCompany: () => Promise<void>;
  updateCompanyPage: (data: FormStateCompany) => Promise<ApiResponse<any>>;
}

/* =======================
   CONTEXT
======================= */

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

/* =======================
   PROVIDER
======================= */

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [company, setCompany] = useState<Company>();

  /* =======================
     API FUNCTIONS
  ======================= */

  const getDetailCompany = async (): Promise<void> => {
    const res = await API.get("/company");

    setCompany(res.data.data);
  };

  const updateCompanyPage = async (
    data: FormStateCompany
  ): Promise<ApiResponse> => {
    const res = await API.patch("/company", data);
    return res.data;
  };

  /* =======================
     CONTEXT VALUE
  ======================= */

  const value: CompanyContextType = {
    company,
    getDetailCompany,
    updateCompanyPage,
  };

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
};
