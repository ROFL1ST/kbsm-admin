import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useAuth } from "@/contexts/Auth.Context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import FinanceInPage from "./pages/Finance/FinanceInPage";
import FinanceOutPage from "./pages/Finance/FinanceOutPage";
import UsersPage from "./pages/UserManagements/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import PurchaseOrderClients from "./pages/PurchaseOrderClients/Sales/PurchaseOrderSales";
import CreatePurchaseOrderClient from "./pages/PurchaseOrderClients/Sales/Action/Create";
import { AppProviders } from "./contexts";
import { useEffect, useState } from "react";
import ReviewPurchaseOrderClients from "./pages/PurchaseOrderClients/Admin/PurchaseOrder";
import ReviewPurchaseOrderClientDetail from "./pages/PurchaseOrderClients/Admin/Actions/Detail";
import EditPurchaseOrderClient from "./pages/PurchaseOrderClients/Sales/Action/Edit";
import ProductDistributions from "./pages/Products/ProductDistributions";
import ReviewUserDetail from "./pages/UserManagements/Actions/Detail";
import CreateUser from "./pages/UserManagements/Actions/Create";
import PurchaseOrderVendors from "./pages/PurchaseOrderVendors/Purchasing/PurchaseOrderVendor";
import CreatePurchaseOrderVendor from "./pages/PurchaseOrderVendors/Purchasing/Action/Create";
import EditPurchaseOrderVendor from "./pages/PurchaseOrderVendors/Finance/Action/Edit";
import ProductsIn from "./pages/Products/ProductsIn";
import ProductOuts from "./pages/Products/ProductOuts";
import DeliveryHistories from "./pages/PurchaseOrderClients/Driver/DeliveryHistories";
import DeliveryHistoryDetail from "./pages/PurchaseOrderClients/Driver/Actions/Detail";
import PurchaseOrderLoading from "./pages/Products/ProductsLoading";
import ProductsLoadingDetail from "./pages/Products/ProductsLoadingDetail";
import CreateFinanceInOutPage from "./pages/Finance/Actions/Create";
import EditFinanceInOutPage from "./pages/Finance/Actions/Edit";
import PurchaseOrderReceived from "./pages/Products/ProductsReceived";
import ProductsReceivedDetail from "./pages/Products/ProductsReceivedDetail";
import StockList from "./pages/InventoryProducts/StockList";
import EditInventoryStock from "./pages/InventoryProducts/Action/Edit";
import CreateInventoryStock from "./pages/InventoryProducts/Action/Create";
import ManageCategories from "./pages/InventoryProducts/ManageCategories";
import ClientsPage from "./pages/Clients/Clients";
import CreateClientPage from "./pages/Clients/Actions/CreatePage";
import EditClientPage from "./pages/Clients/Actions/EditPage";
import PurchaseOrderVendorsReceived from "./pages/PurchaseOrderVendors/Finance/PurchaseOrderVendorsReceived";
import EditPurchaseOrderVendorPurchasing from "./pages/PurchaseOrderVendors/Purchasing/Action/Edit";
import PurchaseOrderClientCollection from "./pages/PurchaseOrderClients/Collection/PurchaseOrderCollection";
import PurchaseOrderClientCollectionDetail from "./pages/PurchaseOrderClients/Collection/Action/detail";
import VendorsPage from "./pages/Vendors/Vendors";
import ReviewPurchaseOrderVendorDetail from "./pages/PurchaseOrderVendors/Finance/Action/Edit";
import ScrollToTop from "./components/ui/ScrollToTop";
import ProductFixingOrderClients from "./pages/Products/ProductFixingOrderClients";
import ProductFixingOrderClientDetail from "./pages/Products/ProductFixingOrderClientDetail";
import ProductManageFixingOrderClients from "./pages/PurchaseOrderClients/ManageProblem/ProductManageFixingOrderClients";
import CreateProductManageFixingOrderClient from "./pages/PurchaseOrderClients/ManageProblem/Action/Create";
import UpdateProductManageFixingOrderClient from "./pages/PurchaseOrderClients/ManageProblem/Action/Update";
import VerificationProductManageFixingOrderClient from "./pages/PurchaseOrderClients/ManageProblem/Action/Verification";
import DetailClientPage from "./components/ui/DetailClient";
import AllProductManageFixingOrderClients from "./pages/PurchaseOrderClients/ManageProblem/AllProductManageFixingOrderClients";
import DeliveryHistoryDetailReturn from "./pages/PurchaseOrderClients/Driver/Actions/DetailReturn";
import Finance from "./pages/Finance/Finance";
import ManageBanks from "./pages/Finance/ManageBanks";
import ManageDiscounts from "./pages/InventoryProducts/ManageDiscounts";
import ProductsPreparationPacking from "./pages/Products/ProductsPreparationPacking";

const queryClient = new QueryClient();

const routeResponsibilities: Record<string, string[]> = {
  // ðŸ“Š Main (tidak divalidasi)
  "/dashboard": [],
  "/stock-list": [],
  "/profile": [],
  "/settings": [],
  "/notifications": [],

  // ðŸ§‘â€ðŸ’¼ Admin
  "/users": ["ADMIN"],
  "/users/edit": ["ADMIN"],
  "/users/generate-user": ["ADMIN"],
  "/order-clients": ["ADMIN"],
  "/review-order-client": ["ADMIN", "FINANCE"],
  "/reports": ["ADMIN"],

  // ðŸ’° Finance
  "/finance-in": ["FINANCE"],
  "/finance-out": ["FINANCE"],
  "/manage-banks": ["FINANCE"],
  "/po-vendors-received": ["FINANCE"],
  "/po-vendors-received/edit": ["FINANCE"],

  // ðŸ’° Purchasing
  "/po-vendors": ["PURCHASING"],
  "/po-vendors/edit": ["PURCHASING"],
  "/po-vendors/generate-po": ["PURCHASING"],
  "/vendors": ["PURCHASING"],
  "/vendors/edit": ["PURCHASING"],
  "/vendors/create": ["PURCHASING"],

  // ðŸ§¾ Sales
  "/po-clients": ["SALES"],
  "/po-clients/edit": ["SALES"],
  "/po-clients/generate-po": ["SALES"],

  // ðŸ§¾ Collection
  "/po-client-collections": ["COLLECTION", "SALES"],

  // ðŸšš Warehouse / Logistik
  "/incoming": ["WAREHOUSE"],
  "/outgoing": ["WAREHOUSE"],
  "/preparation-packing": ["WAREHOUSE"],
  "/product-distributions": ["WAREHOUSE"],

  // driver
  "/activity-driver": ["DRIVER"],
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuth();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(true);

  const validate = async () => {
    try {
      const currentUser = await checkAuth();

      if (!currentUser) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      const path = location.pathname;
      const required = routeResponsibilities[path] || [];

      // Dashboard dll tidak perlu validasi
      if (required.length === 0) {
        setHasAccess(true);
        return;
      }

      const userRoles =
        currentUser.responsibilities?.map((r: any) => r.code) || [];

      const allowed = required.some((role) => userRoles.includes(role));
      setHasAccess(allowed);
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    validate();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return <NotFound />;
  }

  return <>{children}</>;
};
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const validate = async () => {
    try {
      const currentUser = await checkAuth();
      setIsAuthenticated(!!currentUser);
    } catch {
      setIsAuthenticated(false);
    }
  };
  useEffect(() => {
    validate();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Jika user sudah login, arahkan ke dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="supply-dashboard-theme">
      <AppProviders>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="stock-list" element={<StockList />} />
                <Route
                  path="stock-list/edit"
                  element={<EditInventoryStock />}
                />
                <Route
                  path="stock-list/create"
                  element={<CreateInventoryStock />}
                />
                <Route
                  path="stock-list/manage-categories"
                  element={<ManageCategories />}
                />
                <Route
                  path="stock-list/manage-discounts"
                  element={<ManageDiscounts />}
                />
                <Route path="outgoing" element={<ProductOuts />} />
                <Route path="finance-in" element={<FinanceInPage />} />
                <Route path="finance" element={<Finance />} />
                <Route path="manage-banks" element={<ManageBanks />} />
                <Route path="finance-out" element={<FinanceOutPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="po-clients" element={<PurchaseOrderClients />} />
                <Route
                  path="po-client-collections"
                  element={<PurchaseOrderClientCollection />}
                />

                <Route
                  path="po-client-collection/detail"
                  element={<PurchaseOrderClientCollectionDetail />}
                />
                <Route path="po-vendors" element={<PurchaseOrderVendors />} />
                <Route
                  path="po-vendors-received"
                  element={<PurchaseOrderVendorsReceived />}
                />
                <Route path="activity-driver" element={<DeliveryHistories />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/create" element={<CreateClientPage />} />
                <Route path="clients/edit" element={<EditClientPage />} />
                <Route path="vendors" element={<VendorsPage />} />
                <Route path="vendors/create" element={<CreateClientPage />} />
                <Route path="vendors/edit" element={<EditClientPage />} />

                <Route
                  path="finance-in/create"
                  element={<CreateFinanceInOutPage />}
                />
                <Route
                  path="finance-out/create"
                  element={<CreateFinanceInOutPage />}
                />
                <Route
                  path="finance-in/detail"
                  element={<EditFinanceInOutPage />}
                />
                <Route
                  path="finance-out/detail"
                  element={<EditFinanceInOutPage />}
                />
                <Route
                  path="activity-driver/detail"
                  element={<DeliveryHistoryDetail />}
                />
                <Route
                  path="activity-driver/detail/return"
                  element={<DeliveryHistoryDetailReturn />}
                />
                <Route
                  path="manage-adjusment-products"
                  element={<ProductManageFixingOrderClients />}
                />
                <Route
                  path="manage-adjusment-products-analyze"
                  element={<AllProductManageFixingOrderClients />}
                />
                <Route
                  path="manage-adjusment-products/create"
                  element={<CreateProductManageFixingOrderClient />}
                />
                <Route
                  path="manage-adjusment-products/update"
                  element={<UpdateProductManageFixingOrderClient />}
                />
                <Route
                  path="incoming/loading/detail"
                  element={<ProductsLoadingDetail />}
                />
                <Route
                  path="incoming/received/detail"
                  element={<ProductsReceivedDetail />}
                />
                <Route
                  path="incoming/loading"
                  element={<PurchaseOrderLoading />}
                />
                <Route
                  path="incoming/received"
                  element={<PurchaseOrderReceived />}
                />
                <Route
                  path="preparation-packing"
                  element={<ProductsPreparationPacking />}
                />
                <Route
                  path="incoming/fixing-order-clients"
                  element={<ProductFixingOrderClients />}
                />
                <Route
                  path="incoming/fixing-order-clients/detail"
                  element={<ProductFixingOrderClientDetail />}
                />
                <Route
                  path="incoming/fixing-order-clients/detail/update"
                  element={<VerificationProductManageFixingOrderClient />}
                />
                <Route path="incoming" element={<ProductsIn />} />

                <Route
                  path="po-clients/edit"
                  element={<EditPurchaseOrderClient />}
                />
                <Route
                  path="po-vendors-received/edit"
                  element={<ReviewPurchaseOrderVendorDetail />}
                />
                <Route
                  path="po-vendors/edit"
                  element={<EditPurchaseOrderVendorPurchasing />}
                />
                <Route path="users/edit" element={<ReviewUserDetail />} />
                <Route
                  path="order-clients"
                  element={<ReviewPurchaseOrderClients />}
                />
                <Route
                  path="review-order-client"
                  element={<ReviewPurchaseOrderClientDetail />}
                />
                <Route
                  path="product-distributions"
                  element={<ProductDistributions />}
                />
                <Route
                  path="po-clients/generate-po"
                  element={<CreatePurchaseOrderClient />}
                />
                <Route
                  path="po-vendors/generate-po"
                  element={<CreatePurchaseOrderVendor />}
                />
                <Route path="users/generate-user" element={<CreateUser />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProviders>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
