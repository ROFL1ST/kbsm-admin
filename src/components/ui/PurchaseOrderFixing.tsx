"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Trash2,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  FileText,
  Filter,
  Warehouse,
  BanknoteIcon,
  Search,
  Download,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Users,
  DollarSign,
  Shield,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts/Finance.context";
import { formatIDR } from "../format/IDR";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useAuth } from "@/contexts/Auth.Context";

interface Submission {
  id: string;
  purchase_order_client_id: string;
  is_return: string;
  is_take_out: string;
  is_refund: string;
  travel_code: string | null;
  received_warehouse_date: string | null;
  received_warehouse_by: string | null;
  received_warehouse_proof: string | null;
  problem_product_take_by_name: string | null;
  trx_code: string | null;
  send_to_client_date: string | null;
  client_name: string | null;
  created_by_name: string | null;
  total_refund: number | null;
  assignment_date: string | null;
  assignment_by: string | null;
  problem_product_take_by: string | null;
  driver_id: string | null;
  reference: string | null;
  finish_date: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export default function PurchaseOrderFixing() {
  const navigate = useNavigate();
  const { isLoading, categoryCode, statusCode } = useFinance();
  const { purchaseOrderProblem } = usePurchaseOrderClients();
  const { user } = useAuth();
  const isFinance = user?.responsibilities?.some(
    (role) => role.code === "FINANCE"
  );

  // State untuk filter dan pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRefundAmount: 0,
    avgProcessingTime: "2.5",
  });

  // Color palette primary - dapat disesuaikan
  const primaryColor = {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  };

  // Update statistics berdasarkan data
  useEffect(() => {
    if (purchaseOrderProblem.length > 0) {
      const pending = purchaseOrderProblem.filter(
        (s) =>
          !s.finish_date && !s.assignment_date && !s.received_warehouse_date
      ).length;
      const inProgress = purchaseOrderProblem.filter(
        (s) => s.assignment_date && !s.finish_date
      ).length;
      const completed = purchaseOrderProblem.filter(
        (s) => s.finish_date
      ).length;
      const totalRefund = purchaseOrderProblem.reduce(
        (sum, item) => sum + (item.total_refund || 0),
        0
      );

      setStatistics({
        total: purchaseOrderProblem.length,
        pending,
        inProgress,
        completed,
        totalRefundAmount: totalRefund,
        avgProcessingTime: "2.5", // Ini bisa dihitung dari data jika tersedia
      });
    }
  }, [purchaseOrderProblem]);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };
  type Props = {
    submission: Submission;
  };

  const ActionDropdown = ({ submission }: Props) => {
    const menuItems = useMemo(() => {
      const items = [
        {
          label: "Lihat Detail",
          icon: <Package className="h-4 w-4 mr-2" />,
          onClick: () =>
            navigate("/incoming/fixing-order-clients/detail/update", {
              state: {
                purchase_order_client_id: submission?.purchase_order_client_id,
                purchase_order_client_problem_id: submission?.id,
              },
            }),
        },
      ];

      if (submission?.is_refund === "Y" && isFinance) {
        items.push({
          label: "Update Refund",
          icon: <RefreshCw className="h-4 w-4 mr-2" />,
          onClick: () => {
            if (submission?.trx_code === "PENDING") {
              navigate("/finance-out/create", {
                state: {
                  type: "EXPENSE",
                  statusCode,
                  categoryCode,
                  refund: submission,
                },
              });
            } else {
              navigate("/finance-out", {
                state: {
                  search: submission?.reference,
                },
              });
            }
          },
        });
      }

      return items;
    }, [submission, isFinance]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={item.onClick}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getSubmissionStatus = (submission: Submission) => {
    if (submission.finish_date) {
      return (
        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Completed
        </Badge>
      );
    } else if (submission.assignment_date) {
      return (
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          <Truck className="mr-1.5 h-3.5 w-3.5" />
          In Progress
        </Badge>
      );
    } else if (submission.received_warehouse_date) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
          <Warehouse className="mr-1.5 h-3.5 w-3.5" />
          Warehouse Received
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-50  px-3 py-1 rounded-full">
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Pending
        </Badge>
      );
    }
  };

  const getSubmissionTypeBadges = (submission: Submission) => {
    return (
      <div className="flex gap-2">
        {submission.is_return === "Y" && (
          <Badge variant="destructive">Return</Badge>
        )}
        {submission.is_take_out === "Y" && (
          <Badge variant="default">Take Out</Badge>
        )}
        {submission.is_refund === "Y" && <Badge variant="yellow">Refund</Badge>}
      </div>
    );
  };
  const getSubmissionStatusTrxBadges = (submission: Submission) => {
    return (
      <div className="flex gap-2">
        {submission.trx_code === "PENDING" && (
          <Badge variant="yellow">Belum Lunas</Badge>
        )}
        {submission.trx_code === "PAID" && (
          <Badge variant="green">Sudah Lunas</Badge>
        )}
      </div>
    );
  };

  // Filter submissions berdasarkan pencarian dan filter
  const filteredSubmissions = purchaseOrderProblem.filter((submission) => {
    const matchesSearch =
      searchQuery === "" ||
      submission.client_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.travel_code
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.created_by_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending" &&
        !submission.finish_date &&
        !submission.assignment_date &&
        !submission.received_warehouse_date) ||
      (selectedStatus === "warehouse" &&
        submission.received_warehouse_date &&
        !submission.assignment_date) ||
      (selectedStatus === "in-progress" &&
        submission.assignment_date &&
        !submission.finish_date) ||
      (selectedStatus === "completed" && submission.finish_date);

    const matchesType =
      selectedType === "all" ||
      (selectedType === "refund" && submission.is_refund === "Y") ||
      (selectedType === "return" && submission.is_return === "Y") ||
      (selectedType === "take-out" && submission.is_take_out === "Y");

    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500">Memuat data pengajuan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Refund & Returns Management</h1>
            <p className="text-gray-500 mt-2">
              Kelola pengajuan refund, return, dan pengambilan produk
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {showFilters ? (
                <ChevronDown className="h-4 w-4 ml-2 rotate-180" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Cari berdasarkan klien, kode travel, atau nama pengaju..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Section */}
        {showFilters && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus("all")}
                      className={
                        selectedStatus === "all" ? "bg-primary text-white" : ""
                      }
                    >
                      Semua
                    </Button>
                    <Button
                      variant={
                        selectedStatus === "pending" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStatus("pending")}
                      className={
                        selectedStatus === "pending"
                          ? "bg-gray-700 text-white"
                          : ""
                      }
                    >
                      Pending
                    </Button>
                    <Button
                      variant={
                        selectedStatus === "warehouse" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStatus("warehouse")}
                      className={
                        selectedStatus === "warehouse"
                          ? "bg-yellow-500 text-white"
                          : ""
                      }
                    >
                      Warehouse
                    </Button>
                    <Button
                      variant={
                        selectedStatus === "in-progress" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStatus("in-progress")}
                      className={
                        selectedStatus === "in-progress"
                          ? "bg-blue-500 text-white"
                          : ""
                      }
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={
                        selectedStatus === "completed" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStatus("completed")}
                      className={
                        selectedStatus === "completed"
                          ? "bg-green-500 text-white"
                          : ""
                      }
                    >
                      Completed
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipe</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType("all")}
                      className={
                        selectedType === "all" ? "bg-primary text-white" : ""
                      }
                    >
                      Semua
                    </Button>
                    <Button
                      variant={
                        selectedType === "refund" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedType("refund")}
                      className={
                        selectedType === "refund"
                          ? "bg-amber-500 text-white"
                          : ""
                      }
                    >
                      Refund
                    </Button>
                    <Button
                      variant={
                        selectedType === "return" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedType("return")}
                      className={
                        selectedType === "return" ? "bg-red-500 text-white" : ""
                      }
                    >
                      Return
                    </Button>
                    <Button
                      variant={
                        selectedType === "take-out" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedType("take-out")}
                      className={
                        selectedType === "take-out"
                          ? "bg-blue-500 text-white"
                          : ""
                      }
                    >
                      Take Out
                    </Button>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedType("all");
                      setSearchQuery("");
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Pengajuan */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengajuan
            </CardTitle>
            <div className="bg-accent p-2 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {statistics.total}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground"></div>
          </CardContent>
        </Card>

        {/* Dalam Proses */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
            <div className="bg-accent p-2 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {statistics.inProgress}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-primary" />
              <span className="font-medium">
                {statistics.avgProcessingTime} hari
              </span>
              <span className="text-primary">rata-rata proses</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Refund */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refund</CardTitle>
            <div className="bg-accent p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatIDR(statistics.totalRefundAmount)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              {/* <span className="text-red-600 font-medium">-5.2%</span>
              <span className="text-gray-500">dari bulan lalu</span> */}
            </div>
          </CardContent>
        </Card>

        {/* Tertunda */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tertunda</CardTitle>
            <div className="bg-accent p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {statistics.pending}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Button
                variant="link"
                className="p-0 h-auto text-primary font-medium"
              >
                Tinjau Sekarang
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission List */}
        <div className="lg:col-span-2">
          <Card className=" shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Daftar Pengajuan
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm px-3 py-1.5">
                    {filteredSubmissions.length}{" "}
                    {filteredSubmissions.length === 1
                      ? "Pengajuan"
                      : "Pengajuan"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Tidak ada pengajuan ditemukan
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Coba ubah filter pencarian atau buat pengajuan baru.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="overflow-hidden  hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-lg">
                                {submission.client_name?.substring(0, 12) ||
                                  "Unknown Client"}
                              </div>
                              {getSubmissionStatus(submission)}
                              {submission.travel_code && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {submission.travel_code}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                {submission?.total_refund && (
                                  <span className="font-semibold text-lg">
                                    {formatIDR(submission?.total_refund)}
                                  </span>
                                )}
                                <span className="font-semibold text-lg">
                                  {getSubmissionStatusTrxBadges(submission)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                              {getSubmissionTypeBadges(submission)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Dibuat:{" "}
                                  {formatDateTime(submission.created_at)}
                                </span>
                              </div>

                              {submission.received_warehouse_date && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-green-600" />
                                  <span>
                                    Gudang:{" "}
                                    {formatDateTime(
                                      submission.received_warehouse_date
                                    )}
                                  </span>
                                </div>
                              )}

                              {submission.assignment_date && (
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                  <span>
                                    Assigned:{" "}
                                    {formatDateTime(submission.assignment_date)}
                                  </span>
                                </div>
                              )}

                              {submission.finish_date && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>
                                    Selesai:{" "}
                                    {formatDateTime(submission.finish_date)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">
                                  Dibuat Oleh:
                                </span>{" "}
                                <span className="font-bold">
                                  {submission.created_by_name || "-"}
                                </span>
                              </p>
                              {submission.problem_product_take_by && (
                                <p>
                                  <span className="font-medium">
                                    Diambil oleh:
                                  </span>{" "}
                                  <span className="font-bold">
                                    {submission.problem_product_take_by_name}
                                  </span>
                                </p>
                              )}
                              {submission.send_to_client_date && (
                                <p>
                                  <span className="font-medium">
                                    Kirim ke Klien:
                                  </span>{" "}
                                  {formatDateOnly(
                                    submission.send_to_client_date
                                  )}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                            <div className="flex gap-2">
                              <ActionDropdown submission={submission} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className=" shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
                <CheckCircle className="h-4 w-4 mr-3" />
                Approve Refunds
              </Button>
              <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                <Truck className="h-4 w-4 mr-3" />
                Assign Driver
              </Button>
              <Button className="w-full justify-start bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200">
                <AlertCircle className="h-4 w-4 mr-3" />
                Review Pending
              </Button>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className=" shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-bold">
                      {statistics.completed}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (statistics.completed / statistics.total) * 100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm font-bold">
                      {statistics.inProgress}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (statistics.inProgress / statistics.total) * 100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm font-bold">
                      {statistics.pending}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{
                        width: `${
                          (statistics.pending / statistics.total) * 100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Rata-rata proses
                  </span>
                  <span className="text-lg font-bold">
                    {statistics.avgProcessingTime} hari
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className=" shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchaseOrderProblem.slice(0, 3).map((submission, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 hover:bg-accent rounded-lg"
                >
                  <div
                    className={`p-2 rounded-full ${
                      index === 0 ? "bg-primary/10" : "bg-gray-100"
                    }`}
                  >
                    {submission.is_refund === "Y" ? (
                      <DollarSign className="h-4 w-4 text-amber-600" />
                    ) : submission.is_return === "Y" ? (
                      <Package className="h-4 w-4 text-red-600" />
                    ) : (
                      <Truck className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {submission.client_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(
                        submission.updated_at || submission.created_at
                      )}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs ${
                      submission.finish_date
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {submission.finish_date ? "Completed" : "Active"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
