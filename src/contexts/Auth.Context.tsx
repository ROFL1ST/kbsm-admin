import API from "@/config/API";
import { ApiResponse } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "viewer";
  phone: string;
  avatar?: string;
  responsibilities?: Responsibility[];
  created_at: Date;
  path?: string;
}

interface AssetsResponse {
  users: UserProfile[];
  total: number;
}

export interface reponsible {
  id: number;
  name: string;
  code: string;
  created_at: Date;
  updated_at: null;
  deleted_at: null;
  created_by: null;
  deleted_by: null;
  updated_by: null;
}

export interface FormStateUser {
  admin_id: string | null;
  name: string;
  email: string;
  password: string;
  phone: string;
  responsibilities_code: string[];
}

export interface FormStateRecovery {
  password: string;
  conf_pass: string;
}

interface AuthContextType {
  user: User | null;
  users: UserProfile[];
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<User | null>;

  logout: () => void;
  checkAuth: () => Promise<User | null>;
  responsibleList: () => Promise<ApiResponse<any>>;
  getUserList: (params: {
    page: number;
    size: number;
    search?: string;
  }) => Promise<ApiResponse<ApiResponse> | null>;
  createUser: (data: FormStateUser) => Promise<ApiResponse<any>>;
  deleteUser: (params: UserDetailKey) => Promise<ApiResponse<any> | null>;
  accountsBooster: (params: AccountsBoosterKey) => Promise<ApiResponse>;
  booster: AccountsBooster[];
  totalUsers: number;
  totalPages: number;
  detailUser: (params: UserDetailKey) => Promise<ApiResponse<any> | null>;
  updateUser: (data: FormStateUser) => Promise<ApiResponse<any> | null>;
  recoveryPassword: (data: FormStateRecovery) => Promise<ApiResponse<any>>;
  userDetail: UserDetail;
  responsibles: reponsible[];
  fetchPurchaseOrderClient: (params: any) => Promise<ApiResponse<any | null>>;
  dataPOClients: any[];
  filterProgressType: any[];
  filterStatusTrx: any[];
  filterTypeTrx: any[];
  adminPagination: {
    total_data: number;
    total_page: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  responsibilities: string;
  path: string;
  exx: number;
}

export interface UserDetailKey {
  id: string;
}
export interface AccountsBoosterKey {
  responsibility_code: string;
  search: string;
}
export interface AccountsBooster {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserDetail {
  id: string;
  email: string;
  phone: string;
  name: string;
  type: number;
  created_at: Date;
  updated_at: null;
  deleted_at: null;
  created_by: string;
  updated_by: string;
  deleted_by: null;
  responsibilities: Responsibility[];
}

export interface Responsibility {
  code: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userDetail, setUserDetail] = useState<UserDetail>();
  const [responsibles, setResponsibles] = useState<reponsible[]>([]);
  const [booster, setBooster] = useState<AccountsBooster[]>([]);
  const [dataPOClients, setDataPOClients] = useState([]);
  const [filterProgressType, setFilterProgressType] = useState([]);
  const [filterStatusTrx, setFilterStatusTrx] = useState([]);
  const [filterTypeTrx, setFilterTypeTrx] = useState([]);
  const [adminPagination, setAdminPagination] = useState({
    total_data: 0,
    total_page: 0,
  });
  // useEffect(() => {
  //   // Check if user is stored in localStorage
  //   const storedUser = localStorage.getItem("supply-dashboard-user");
  //   if (storedUser) {
  //     try {
  //       setUser(JSON.parse(storedUser));
  //     } catch (error) {
  //       localStorage.removeItem("supply-dashboard-user");
  //     }
  //   }
  //   setIsLoading(false);
  // }, []);

  /**
   * Log in to the application.
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @param {boolean} [remember=false] - Whether to remember the user.
   * @throws {Error} - Email or password is incorrect.
   * @returns {Promise<void>} - Promise that resolves when the login is successful.
   */
  const login = async (
    email: string,
    password: string,
    remember?: boolean
  ): Promise<User | null> => {
    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data?.status) {
        const user = response.data.data;
        setUser(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const logout = async () => {
    const response = await API.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
  };
  const checkAuth = async (): Promise<User | null> => {
    setCheckingAuth(true);
    try {
      const response = await API.get("/auth/session", {
        withCredentials: true,
      });
      if (response?.data?.status) {
        setUser(response.data.data);
        return response.data.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Check auth failed:", error);
      setUser(null);
      // return null;
    } finally {
      setCheckingAuth(false);
      setAuthChecked(true);
    }
  };
  const fetchPurchaseOrderClient = async (
    params
  ): Promise<ApiResponse<any | null>> => {
    try {
      const res = await API.get(
        `/purchase-order/clients?page=${params.page}&size=${params.size}&progress_type_code=${params.progress_type_code}&status_trx_code=${params.status_trx_code}&search=${params.search}&payment_method_code=${params.payment_method_code}&start_date=${params.start_date}&end_date=${params.end_date}`
      );
      setAdminPagination({
        total_data: res.data?.data?.total_data,
        total_page: res.data?.data?.total_page,
      });
      setDataPOClients(res.data?.data?.data);
      setFilterProgressType(res.data?.data?.progressType);
      setFilterStatusTrx(res.data?.data?.statusTrx);
      setFilterTypeTrx(res.data?.data?.typeTrx);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
      throw error;
    }
  };
  const getUserList = async (params: {
    page: number;
    size: number;
    search?: string;
    responsibility_code?: string;
  }): Promise<ApiResponse<any> | null> => {
    try {
      const res = await API.get<ApiResponse<any>>(
        `/auth/accounts?page=${params.page}&size=${params.size}&search=${
          params.search
        }&responsibility_code=${params.responsibility_code || ""}`
      );
      if (res?.data.status) {
        setUsers(res?.data?.data.accounts || []);

        setTotalUsers(res?.data?.data.total_data || 0);
        setTotalPages(res?.data?.data.total_page || 0);
      } else {
        setUsers([]);
      }
      return res.data;
    } catch (error) {
      console.log("Error fetching user list : ", error);
      return null;
    }
  };

  const createUser = async (data: FormStateUser): Promise<ApiResponse<any>> => {
    try {
      const res = await API.post<ApiResponse<any>>("/auth/account", data);
      return res.data;
    } catch (error) {
      console.log("Error creating user: ", error);
      return null;
    }
  };

  const deleteUser = async (
    params: UserDetailKey
  ): Promise<ApiResponse<any> | null> => {
    try {
      const res = await API.delete<ApiResponse<any>>(
        `/auth/account/?admin_id=${params.id}`
      );
      return res.data;
    } catch (error) {
      console.log("Error deleting user: ", error);
      return null;
    }
  };
  const accountsBooster = async (
    params: AccountsBoosterKey
  ): Promise<ApiResponse> => {
    try {
      const res = await API.get<ApiResponse>(`/auth/accounts/booster`, {
        params: params,
      });
      setBooster(res.data.data);
      return res.data;
    } catch (error) {
      console.log("Error deleting user: ", error);
      return null;
    }
  };

  const detailUser = async (
    params: UserDetailKey
  ): Promise<ApiResponse<any> | null> => {
    try {
      const res = await API.get<ApiResponse<any>>(
        `/auth/account-detail?admin_id=${params.id}`
      );
      if (res.data.status) {
        setUserDetail(res.data.data || null);
        return res.data;
      } else {
        setUserDetail(null);
        return null;
      }
    } catch (error) {
      console.log("Error fetching user detail: ", error);
      return null;
    }
  };

  const updateUser = async (
    data: FormStateUser
  ): Promise<ApiResponse<any> | null> => {
    try {
      const res = await API.patch<ApiResponse<any>>("/auth/account", data);

      return res.data;
    } catch (error) {
      console.log("Error updating user detail: ", error);
      return null;
    }
  };

  // responsible list
  const responsibleList = async (): Promise<ApiResponse<any>> => {
    try {
      const res = await API.get<ApiResponse<any>>("/auth/responsibilities");
      if (res.data.status) {
        setResponsibles(res.data.data);
        return res.data;
      } else {
        setResponsibles([]);
        return null;
      }
    } catch (error) {
      console.log("Error fetching responsible list: ", error);
      return null;
    }
  };

  // recovery password
  const recoveryPassword = async (
    data: FormStateRecovery
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await API.post<ApiResponse<any>>("/auth/recovery", data);
      return res.data;
    } catch (error) {
      console.log("Error recovering password: ", error);
      return null;
    }
  };
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
    getUserList,
    deleteUser,
    responsibleList,
    detailUser,
    createUser,
    updateUser,
    recoveryPassword,
    accountsBooster,
    fetchPurchaseOrderClient,
    dataPOClients,
    filterProgressType,
    filterStatusTrx,
    filterTypeTrx,
    booster,
    userDetail,
    users,
    totalUsers,
    totalPages,
    responsibles,
    adminPagination,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
