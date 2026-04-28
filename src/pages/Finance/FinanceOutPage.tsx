import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  TrendingDown,
  CreditCard,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/contexts/Finance.context";
import { VariantProps } from "class-variance-authority";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/components/format/IDR";
import PurchaseOrderRefund from "@/components/ui/PurchaseOrderRefund";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";

export default function FinanceOutPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const location = useLocation();
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    search: location?.state?.search ? location?.state?.search : "",
    category_code: "",
    status_code: "",
    finance_code: "EXPENSE",
    start_date: "",
    end_date: "",
  });
  const navigate = useNavigate();
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const getStatusBadge = (status: string, color: string) => {
    const validVariants: BadgeVariant[] = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "yellow",
      "green",
    ];
    const variant = validVariants.includes(color as BadgeVariant)
      ? (color as BadgeVariant)
      : "default";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const [header, setHeader] = useState({
    total_income: 0,
    total_income_confirm: 0,
    total_expense: 0,
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  // fetch data
  const {
    listFinance,
    pagination,
    getFinance,
    getCategoryCode,
    categoryCode,
    statusCode,
    deleteFinance,
  } = useFinance();
  const { getAllPurchaseOrderClientProblemProduct, purchaseOrderProblem } =
    usePurchaseOrderClients();

  const fetchData = async () => {
    try {
      const refund = await getAllPurchaseOrderClientProblemProduct({
        adjustment_type: "REFUND",
        is_finance_out_page: true,
      });

      const response = await getFinance(request);
      const res = await getCategoryCode({
        size: 100,
        page: 1,
        lookup_code: "CATEGORY_EXPENSE",
      });
      setHeader(response?.data?.header);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [request]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setRequest((prev) => ({ ...prev, page }));
  };

  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteFinance(id);
      if (response.status)
        toast({
          title: "Berhasil!",
          description: `Berhasil hapus Pesanan Klien`,
        });
      if (!response.status)
        toast({
          title: "Kesalahan",
          description: response.messages,
          variant: "default",
        });
      getFinance(request);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: error || "Gagal menghapus data.",
        variant: "default",
      });
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Uang Keluar</h1>
          <p className="text-muted-foreground">
            Kelola pengeluaran dan biaya operasional
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/finance-out/create", {
              state: {
                type: "EXPENSE",
                statusCode: statusCode,
                categoryCode: categoryCode,
              },
            });
          }}
          className="w-fit"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatIDR(header?.total_expense)}
            </div>
            <span className="text-xs">Include PPN</span>
          </CardContent>
        </Card>
      </div>
      {purchaseOrderProblem.length > 0 && <PurchaseOrderRefund />}
      {/* Filters and Search */}
      <Card>
        <CardHeader className="space-y-5">
          <CardTitle>Daftar Transaksi Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari Deskripsi atau Kode Referensi..."
                  className="w-full pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  value={request?.search}
                  onChange={(e) =>
                    setRequest({ ...request, search: e?.target?.value })
                  }
                />
              </div>

              {/* Date Range */}
              <div className="relative flex-1">
                <DatePickerWithRange
                  value={
                    request.start_date || request.end_date
                      ? {
                          from: request.start_date
                            ? new Date(request.start_date)
                            : undefined,
                          to: request.end_date
                            ? new Date(request.end_date)
                            : undefined,
                        }
                      : undefined
                  }
                  onChange={(range) => {
                    const formatDate = (d?: Date) =>
                      d ? d.toLocaleDateString("sv-SE") : "";
                    setRequest({
                      ...request,
                      start_date: formatDate(range?.from),
                      end_date: formatDate(range?.to),
                    });
                  }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Status Code */}
              <Select
                value={request.status_code}
                onValueChange={(e) =>
                  setRequest({ ...request, status_code: e })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status " />
                </SelectTrigger>
                <SelectContent>
                  {statusCode.map((item) => (
                    <SelectItem
                      key={item.lookup_value_code}
                      value={item.lookup_value_code}
                    >
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Code */}
              <Select
                value={request.category_code}
                onValueChange={(e) =>
                  setRequest({ ...request, category_code: e })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categoryCode.map((item) => (
                    <SelectItem
                      key={item.lookup_value_code}
                      value={item.lookup_value_code}
                    >
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full rounded-xl flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition"
                onClick={() =>
                  setRequest({
                    search: "",
                    start_date: "",
                    end_date: "",
                    category_code: "",
                    status_code: "",
                    finance_code: "EXPENSE",
                    page: 1,
                    size: 10,
                  })
                }
              >
                <Filter className="h-4 w-4" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {listFinance?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listFinance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        className={`${item.reference ?? "text-destructive"}`}
                      >
                        {item.reference ?? "Tidak ada kode"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.type, item.type_badge)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.category}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(item.status, item.status_badge)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.description}
                      </TableCell>
                      <TableCell className="font-semibold text-destructive">
                        - {formatIDR(item.total)}
                      </TableCell>
                      <TableCell>{formatDate(item.input_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
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
                                    status_code: item.status_code,
                                    categoryCode: categoryCode,
                                    category_code: item.category_code,
                                    path: item.path,
                                    description: item.description,
                                    total: item.total,
                                    input_date: item.input_date,
                                    source_id: item.source_id,
                                    source_table: item.source_table,
                                  },
                                });
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmModal
                            title="Hapus Pesanan"
                            description={`Apakah kamu yakin ingin menghapus pengeluaran${" "}<b>${
                              item.description
                            }</b>? Tindakan ini tidak dapat dibatalkan.`}
                            confirmText="Iya"
                            cancelText="Batal"
                            variant="outline"
                            showIcon={false}
                            useHTML
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 />
                              </Button>
                            }
                            onConfirm={() => handleDelete(item.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* paginations */}
              {listFinance.length > 0 && (
                <div className="px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-semibold">
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold">
                        {Math.min(currentPage * 10, pagination.total_data)}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold">
                        {pagination.total_data}
                      </span>{" "}
                      data
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, pagination.total_page) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.total_page <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.total_page - 2) {
                            pageNum = pagination.total_page - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[40px] ${
                                currentPage === pageNum
                                  ? "bg-primary text-white"
                                  : "border-primary/20 text-primary hover:bg-primary hover:text-white"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.total_page}
                      className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {/* paginations */}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada data Keuangan
          </h3>
          <p className="text-gray-400 mb-4">Tidak ditemukan data Keuangan</p>
        </div>
      )}
    </div>
  );
}
