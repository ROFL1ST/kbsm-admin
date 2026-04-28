import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Filter, Pagination } from "@/types";

export interface ValueCode {
  value: string;
  lookup_value_id: number;
  lookup_value_code: string;
  lookup_code: string;
  type: string;
  description: string;
  total: number;
}

export interface FormStateValueCode {
  value: string;
  description: string;
  lookup_code: string;
  lookup_value_code: string;
}
export interface ValueCodeKeyDetail extends FormStateValueCode {
  lookup_value_id: number;
}

export interface Code {
  lookup_value_code: string;
  value: string;
}

interface ParameterContextType {
  getValueCode: (params: {
    size: number;
    page: number;
    lookup_code: string;
  }) => Promise<ApiResponse<any>>;
  addValueCode: (code: FormStateValueCode) => Promise<ApiResponse<any>>;
  updateValueCode: (code: ValueCodeKeyDetail) => Promise<ApiResponse<any>>;
  deleteValueCode: (params) => Promise<ApiResponse>;
  valueCode: ValueCode[];
}

const ParameterContext = createContext<ParameterContextType | undefined>(
  undefined
);

export const useParameter = () => {
  const context = useContext(ParameterContext);
  if (!context) {
    throw new Error("useParameter must be used within a ParameterProvider");
  }
  return context;
};

export const ParameterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [valueCode, setValuesCode] = useState<ValueCode[]>([]);

  const getValueCode = async (params): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get(
        `parameter/lookup-values?size=${params.size}&page=${params.page}&lookup_code=${params.lookup_code}`
      );
      setValuesCode(res.data.data);
      console.log("Value Code:", res.data.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching category code:", error);
      throw error;
    }
  };

  const addValueCode = async (
    code: FormStateValueCode
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.post("parameter/lookup-values", code);
      return res.data;
    } catch (error) {
      console.error("Error adding category code:", error);
      throw error;
    }
  };

  const updateValueCode = async (
    code: ValueCodeKeyDetail
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.patch("parameter/lookup-values", code);
      return res.data;
    } catch (error) {
      console.error("Error updating category code:", error);
      throw error;
    }
  };

  const deleteValueCode = async (params): Promise<ApiResponse> => {
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

  const value: ParameterContextType = {
    getValueCode,
    addValueCode,
    updateValueCode,
    deleteValueCode,
    valueCode,
  };

  return (
    <ParameterContext.Provider value={value}>
      {children}
    </ParameterContext.Provider>
  );
};
