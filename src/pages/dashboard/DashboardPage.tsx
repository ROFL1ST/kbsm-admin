import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Warehouse,
  ShoppingCart,
  ChevronRight,
  PackageCheck,
  ClipboardList,
  Truck,
  Receipt,
  UserCheck,
  ChevronLeft,
  Filter,
  Users,
  Calendar,
  Clock,
  RefreshCw,
  Eye,
  MoreVertical,
  Download,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Box,
  TruckIcon,
  User,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/Auth.Context";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { useFinance } from "@/contexts/Finance.context";
import { useProducts } from "@/contexts/Products.Context";
import { useNavigate } from "react-router-dom";
import {
  DialogContent,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RestockDialogContent from "./actions/DashboardModal";
import API from "@/config/API";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { VariantProps } from "class-variance-authority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getStatusBadge } from "@/components/ui/StatusBadge";
import { DistributionStatusBadge } from "@/components/ui/distributionStatusBadge";

const iconMap = {
  "Total Pembelian Produk": Package,
  "Total Penjualan Produk": ShoppingCart,
  "Total Pemasukan": DollarSign,
  "Total Pengeluaran": DollarSign,
  "Total Pajak": Receipt,
  "Penjualan Saya": UserCheck,
};

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  success: "bg-green-500/20 text-green-500 border-green-500/30",
  failed: "bg-red-500/20 text-red-500 border-red-500/30",
  processing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  delivered: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  "dalam proses": "bg-blue-500/20 text-blue-500 border-blue-500/30",
  selesai: "bg-green-500/20 text-green-500 border-green-500/30",
  dibatalkan: "bg-red-500/20 text-red-500 border-red-500/30",
  menunggu: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    user,
    fetchPurchaseOrderClient,
    dataPOClients,
    adminPagination,
    filterProgressType,
    filterStatusTrx,
    filterTypeTrx,
  } = useAuth();
  const hasResponsibility = (code: string) =>
    user?.responsibilities?.some((r) => r.code === code);

  const {
    getPurchaseOrderDeliveryHistories,
    getAllPurchaseOrderClientProblemProduct,
    purchaseOrderProblem,
    deliveryHistories,
  } = usePurchaseOrderClients();
  const [dataSales, setDataPOSales] = useState([]);
  const [paramsAnalytic, setParamsAnalytic] = useState({
    start_date: "",
    end_date: "",
  });
  const [request, setRequest] = useState({
    page: 1,
    size: 5,
    search: "",
    progress_type_code: "FOLLOW_UP",
    status_trx_code: "",
    payment_method_code: "",
    start_date: "",
    end_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setRequest((prev) => ({ ...prev, page: newPage }));
  };

  const [requestRestock, setRequestRestock] = useState({
    page: 1,
    size: 5,
    search: "",
  });

  const {
    getFinance,
    listFinance,
    categoryCode,
    getAnalytic,
    analytic,
    statusCode,
  } = useFinance();

  const fetchPurchaseOrderClientSales = async (params) => {
    try {
      const { data } = await API.get(
        `/purchase-order/clients/sales?page=${params.page}&size=${params.size}&progress_type_code=${params.progress_type_code}&status_trx_code=${params.status_trx_code}&search=${params.search}&payment_method_code=${params.payment_method_code}&start_date=${params.start_date}&end_date=${params.end_date}`,
      );
      console.log(data.data?.data);
      setDataPOSales(data?.data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data purchase order:", error);
      setDataPOSales([]);
    }
  };

  const fetchAdmin = async (params) => {
    try {
      await fetchPurchaseOrderClient(params);
    } catch (error) {
      console.error("Error mengambil data admin:", error);
    }
  };

  useEffect(() => {
    fetchAdmin(request);
  }, [request]);

  const {
    getProductDistributions,
    productDistributions,
    paginationRestock,
    getRestock,
    restock,
  } = useProducts();

  const handlePageChangeRestock = (newPage: number) => {
    setRequestRestock((prev) => ({ ...prev, page: newPage }));
  };
  const [restockPreview, setRestockPreview] = useState([]);

  useEffect(() => {
    getRestock(requestRestock);
  }, [requestRestock]);

  const [load, setLoad] = useState(false);
  const [loadingAnalytic, setLoadingAnalytic] = useState(false);

  const fetchAnalyticData = async (params) => {
    try {
      setLoadingAnalytic(true);
      await getAnalytic(params);
      setLoadingAnalytic(false);
    } catch (error) {
      console.error("Error mengambil data analitik:", error);
      setLoadingAnalytic(false);
    }
  };

  useEffect(() => {
    fetchAnalyticData(paramsAnalytic);
  }, [paramsAnalytic]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      getAllPurchaseOrderClientProblemProduct({ adjustment_type: null });

      await Promise.all([
        getProductDistributions({
          size: 5,
          page: 1,
          search: "",
          start_date: paramsAnalytic.start_date,
          end_date: paramsAnalytic.end_date,
        }),
        getFinance({
          size: 5,
          page: 1,
          search: "",
          finance_code: "",
          start_date: paramsAnalytic.start_date,
          end_date: paramsAnalytic.end_date,
        }),
        getPurchaseOrderDeliveryHistories({
          size: 3,
          page: 1,
          search: "",
          start_date: paramsAnalytic.start_date,
          end_date: paramsAnalytic.end_date,
        }),
        (async () => {
          const restockData = await getRestock({
            page: 1,
            size: 5,
            search: "",
          });
          setRestockPreview(restockData.data?.products?.slice(0, 3) || []);
        })(),
        fetchPurchaseOrderClientSales({
          page: 1,
          size: 5,
          search: "",
          progress_type_code: "",
          status_trx_code: "",
          payment_method_code: "",
          start_date: paramsAnalytic.start_date,
          end_date: paramsAnalytic.end_date,
        }),
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error mengambil data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paramsAnalytic]);

  const userResponsibilities = {
    ADMIN: hasResponsibility("ADMIN"),
    SALES: hasResponsibility("SALES"),
    DRIVER: hasResponsibility("DRIVER"),
    FINANCE: hasResponsibility("FINANCE"),
    WAREHOUSE: hasResponsibility("WAREHOUSE"),
    PURCHASING: hasResponsibility("PURCHASING"),
  };

  const responsibilityCount =
    Object.values(userResponsibilities).filter(Boolean).length;

  const getGridLayout = () => {
    if (responsibilityCount === 0) return "grid-cols-1";
    switch (responsibilityCount) {
      case 1:
        return "grid-cols-1 lg:grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4";
      case 5:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return `Rp ${amount?.toLocaleString("id-ID")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format date short
  const formatDateShort = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  // Chart data untuk overview keuangan
  const getChartData = () => {
    const recentFinance = listFinance?.slice(0, 7) || [];
    if (recentFinance.length === 0) {
      return Array.from({ length: 7 }).map((_, i) => ({
        name: `Hari ${i + 1}`,
        pemasukan: 0,
        pengeluaran: 0,
        tanggal: `-`,
      }));
    }

    return recentFinance.map((item, index) => ({
      name: `Hari ${index + 1}`,
      pemasukan: item.finance_code === "INCOME" ? item.total : 0,
      pengeluaran: item.finance_code === "EXPENSE" ? item.total : 0,
      tanggal: formatDateShort(item.input_date),
    }));
  };

  // Data distribusi status pesanan untuk pie chart
  const getStatusDistribution = () => {
    if (!dataPOClients || dataPOClients.length === 0) {
      return [{ name: "Tidak Ada Data", value: 1, color: "#9ca3af" }];
    }

    const distribution = {
      "dalam proses": 0,
      selesai: 0,
      dibatalkan: 0,
      menunggu: 0,
    };

    dataPOClients.forEach((po) => {
      const status = po.type?.toLowerCase();
      if (distribution.hasOwnProperty(status)) {
        distribution[status]++;
      } else {
        distribution["menunggu"]++;
      }
    });

    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color:
          name === "selesai"
            ? "#22c55e"
            : name === "dalam proses"
              ? "#3b82f6"
              : name === "dibatalkan"
                ? "#ef4444"
                : "#f59e0b",
      }));
  };
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Dashboard Analitik
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Selamat datang kembali, {user?.name || "Pengguna"}! Berikut
                ringkasan bisnis Anda
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <DatePickerWithRange
            value={
              paramsAnalytic.start_date || paramsAnalytic.end_date
                ? {
                    from: paramsAnalytic.start_date
                      ? new Date(paramsAnalytic.start_date)
                      : undefined,
                    to: paramsAnalytic.end_date
                      ? new Date(paramsAnalytic.end_date)
                      : undefined,
                  }
                : undefined
            }
            onChange={(range) => {
              const formatDate = (d?: Date) =>
                d ? d.toLocaleDateString("sv-SE") : "";
              setParamsAnalytic({
                ...paramsAnalytic,
                start_date: formatDate(range?.from),
                end_date: formatDate(range?.to),
              });
              setRequest({
                ...request,
                start_date: formatDate(range?.from),
                end_date: formatDate(range?.to),
              });
            }}
          />

          <Button
            variant="outline"
            className="gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => {
              setParamsAnalytic({ start_date: "", end_date: "" });
              setRequest({ ...request, start_date: "", end_date: "" });
            }}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Reset
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-4 ${getGridLayout()}`}>
        {loadingAnalytic
          ? Array.from({ length: Math.max(3, responsibilityCount * 2) }).map(
              (_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ),
            )
          : analytic.map((item, i) => {
              const Icon = iconMap[item.label] || TrendingUp;

              return (
                <Card
                  key={i}
                  className="group cursor-pointer border hover:border-primary/50 transition-all duration-200"
                  onClick={() => item?.navigate && navigate(item.navigate)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-muted-foreground">
                        {item.label}
                      </CardTitle>
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="items-baseline gap-2">
                      <div className="text-2xl font-bold text-foreground">
                        {item.value}
                      </div>
                      {item.description && (
                        <div className={`flex items-center text-xs`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Lihat detail</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Charts & Finance */}
        {userResponsibilities.FINANCE && (
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Keuangan */}
            {userResponsibilities.FINANCE && (
              <Card className="border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Overview Keuangan
                      </CardTitle>
                      <CardDescription>
                        Pemasukan vs Pengeluaran
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem>Export Data</DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => navigate("/finance")}>
                          Lihat Detail
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="tanggal"
                          className="text-xs fill-muted-foreground"
                        />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Jumlah",
                          ]}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="pemasukan"
                          stackId="1"
                          stroke="#22c55e"
                          fill="url(#colorPemasukan)"
                          fillOpacity={0.8}
                        />
                        <Area
                          type="monotone"
                          dataKey="pengeluaran"
                          stackId="1"
                          stroke="#ef4444"
                          fill="url(#colorPengeluaran)"
                          fillOpacity={0.8}
                        />
                        <defs>
                          <linearGradient
                            id="colorPemasukan"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#22c55e"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c55e"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorPengeluaran"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaksi Terbaru */}
            {userResponsibilities.FINANCE && (
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Transaksi Terbaru
                  </CardTitle>
                  <CardDescription>Aktivitas keuangan terkini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listFinance?.length > 0 ? (
                      listFinance.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => {
                            if (item.finance_code === "INCOME") {
                              if (
                                item.source_table === "purchase_order_clients"
                              ) {
                                navigate(`/review-order-client`, {
                                  state: {
                                    purchase_order_client_id: item?.source_id,
                                  },
                                });
                              } else {
                                navigate(`/finance-in/detail`, {
                                  state: {
                                    finance_id: item.id,
                                    type: "INCOME",
                                    statusCode: statusCode,
                                    status_code: item.status_code,
                                    categoryCode: categoryCode,
                                    category_code: item.category_code,
                                    path: item.path,
                                    description: item.description,
                                    total: item.total,
                                    input_date: item.input_date,
                                  },
                                });
                              }
                            } else {
                              if (
                                item.source_table === "purchase_order_vendors"
                              ) {
                                navigate(`/po-vendors/edit`, {
                                  state: item?.source_id,
                                });
                              } else {
                                navigate(`/finance-out/detail`, {
                                  state: {
                                    finance_id: item.id,
                                    type: "EXPENSE",
                                    statusCode: statusCode,
                                    status_code: item?.status_code,
                                    categoryCode: categoryCode,
                                    category_code: item?.category_code,
                                    source_id: item?.source_id,
                                    source_table: item?.source_table,
                                    path: item.path,
                                    description: item.description,
                                    total: item.total,
                                    input_date: item.input_date,
                                  },
                                });
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                item.finance_code === "INCOME"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-red-500/20 text-red-500"
                              }`}
                            >
                              {item.finance_code === "INCOME" ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {item.category}{" "}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(item.input_date)}
                              </p>
                              <div className="h-3" />
                              {getStatusBadge(item.type, item?.type_badge)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                item.finance_code === "INCOME"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {formatCurrency(item.total)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Tidak ada transaksi terbaru</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Distribusi Status Pesanan */}

          {/* Alert Stok Menipis */}
          {(userResponsibilities.ADMIN ||
            userResponsibilities.PURCHASING ||
            userResponsibilities.FINANCE) && (
            <Card className="border border-yellow-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="h-5 w-5" />
                  Stok Menipis
                </CardTitle>
                <CardDescription className="">
                  Produk yang perlu segera direstock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {restockPreview.length > 0 ? (
                  <>
                    {restockPreview.map((item) => (
                      <div
                        onClick={() => {
                          navigate("/stock-list/edit", {
                            state: item?.product_unit_id,
                          });
                        }}
                        key={item.product_unit_id}
                        className="flex items-center justify-between p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/10 cursor-pointer transition-all"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.name} {item?.unit_code}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-yellow-500">
                              Stok: {item.total_quantity}
                            </span>
                            <Progress
                              value={Math.min(
                                (item.total_quantity / 10) * 100,
                                100,
                              )}
                              className="w-24 h-2 bg-yellow-500/20"
                              // indicatorClassName="bg-yellow-500"
                            />
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${
                            item.total_quantity < 4
                              ? "bg-red-500/20 text-red-500 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                          }`}
                        >
                          {item.total_quantity < 4 ? "Kritis" : "Menipis"}
                        </Badge>
                      </div>
                    ))}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                          size="sm"
                        >
                          Lihat Semua ({paginationRestock?.total_data || 0})
                        </Button>
                      </DialogTrigger>
                      <RestockDialogContent
                        handlePageChangeRestock={handlePageChangeRestock}
                        requestRestock={requestRestock}
                        pagination={paginationRestock}
                        restock={restock}
                        navigate={navigate}
                        onClose={() => setIsDialogOpen(false)}
                      />
                    </Dialog>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <PackageCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Semua stok aman</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aksi Cepat */}
          {!userResponsibilities.PURCHASING && (
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Aksi Cepat</CardTitle>
                <CardDescription>Operasi yang sering digunakan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {userResponsibilities.SALES && (
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2 hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => navigate("/po-clients")}
                    >
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Pesanan Baru</span>
                    </Button>
                  )}
                  {userResponsibilities.FINANCE && (
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2 border-muted hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => navigate("/finance-in")}
                    >
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">
                        Tambah Pemasukan
                      </span>
                    </Button>
                  )}
                  {userResponsibilities.WAREHOUSE && (
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2 border-muted hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => navigate("/incoming")}
                    >
                      <Warehouse className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Stok Masuk</span>
                    </Button>
                  )}
                  {userResponsibilities.ADMIN && (
                    <>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col gap-2 border-muted hover:border-primary hover:bg-primary/10 transition-all"
                        onClick={() => navigate("/users")}
                      >
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium">
                          Kelola Pengguna
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col gap-2 border-muted hover:border-primary hover:bg-primary/10 transition-all"
                        onClick={() => navigate("/settings")}
                      >
                        <Settings className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium">Pengaturan</span>
                      </Button>
                    </>
                  )}
                  {userResponsibilities.DRIVER && (
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-2 border-muted hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => navigate("/activity-driver")}
                    >
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">
                        Aktivitas Pengiriman
                      </span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Grid - Tabel Berdasarkan Role */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pesanan Terbaru untuk ADMIN */}
        {userResponsibilities.ADMIN && (
          <Card className="border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Pesanan Terbaru
                  </CardTitle>
                  <CardDescription>
                    Pesanan terbaru dari pelanggan
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/purchase-order-client")}
                >
                  Lihat Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dataPOClients?.length > 0 ? (
                <div className="overflow-hidden rounded-lg border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-accent">
                        <TableRow>
                          <TableHead className="font-semibold">Klien</TableHead>
                          <TableHead className="font-semibold">
                            Tanggal
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataPOClients.slice(0, 5).map((po) => (
                          <TableRow
                            key={po.id}
                            className="hover:bg-accent cursor-pointer"
                            onClick={() =>
                              navigate(`/review-order-client`, {
                                state: { purchase_order_client_id: po?.id },
                              })
                            }
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <span>{po.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(po.input_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(po.type, po.type_badge)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(po.final_total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-center">Tidak ada pesanan terbaru</p>
                  <p className="text-sm text-center mt-1">
                    Semua pesanan telah diproses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Aktivitas Pengiriman untuk DRIVER */}
        {userResponsibilities.DRIVER && (
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-green-500" />
                Aktivitas Pengiriman
              </CardTitle>
              <CardDescription>Update pengiriman terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliveryHistories?.length > 0 ? (
                  deliveryHistories.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                          <TruckIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.name || item.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.travel_code}</span>
                            <span>•</span>
                            <span>{item.driver_name}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="capitalize bg-green-500/20 text-green-500 border-green-500/30"
                      >
                        {item.progress_type?.toLowerCase() || "dalam proses"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada aktivitas pengiriman</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aktivitas Gudang */}
        {userResponsibilities.WAREHOUSE && (
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-orange-500" />
                Aktivitas Gudang
              </CardTitle>
              <CardDescription>Pergerakan stok terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productDistributions?.length > 0 ? (
                  productDistributions.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        if (item.quantity >= 0) {
                          navigate("/incoming");
                        } else {
                          navigate("/outgoing");
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            item.quantity >= 0
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {item.quantity >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.code} • {Math.abs(item.quantity)}{" "}
                            {item.unit_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {DistributionStatusBadge(
                            item?.status_distribution_code,
                            item.status_distribution,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada aktivitas gudang</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pesanan untuk SALES */}
        {/* {userResponsibilities.SALES && (
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Pesanan Saya
              </CardTitle>
              <CardDescription>Pesanan terbaru dari klien Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSales?.length > 0 ? (
                  dataSales.map((po) => (
                    <div
                      key={po?.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(`/po-clients/edit`, {
                          state: po?.id,
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/20 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{po.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {po.purchase_order_client_code} •{" "}
                            {formatDateShort(po.input_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(po.final_total)}
                        </p>
                        {getStatusBadge(po.type, po.type_badge)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada pesanan terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}
