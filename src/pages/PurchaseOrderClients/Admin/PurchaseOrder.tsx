import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { formatIDR } from "@/components/format/IDR";
import API from "@/config/API";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useToast } from "@/hooks/use-toast";
import { getStatusBadge } from "@/components/ui/StatusBadge";

export default function ReviewPurchaseOrderClients() {
  const [dataPOClients, setDataPOClients] = useState([]);
  const [filterProgressType, setFilterProgressType] = useState([]);
  const [filterStatusTrx, setFilterStatusTrx] = useState([]);
  const [filterTypeTrx, setFilterTypeTrx] = useState([]);
  const [request, setRequest] = useState({
    page: 1,
    size: 10,
    search: "",
    progress_type_code: "",
    status_trx_code: "",
    payment_method_code: "",
    start_date: "",
    end_date: "",
  });

  const navigate = useNavigate();
  const { deletePurchaseOrderClient } = usePurchaseOrderClients();
  const { toast } = useToast();

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const [pagination, setPagination] = useState({
    total_data: 0,
    total_page: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setRequest((prev) => ({ ...prev, page }));
  };
  const fetchPurchaseOrderClient = async (params) => {
    try {
      const { data } = await API.get(
        `/purchase-order/clients?page=${params.page}&size=${params.size}&progress_type_code=${params.progress_type_code}&status_trx_code=${params.status_trx_code}&search=${params.search}&payment_method_code=${params.payment_method_code}&start_date=${params.start_date}&end_date=${params.end_date}`
      );
      setPagination({
        total_data: data?.data?.total_data,
        total_page: data?.data?.total_page,
      });
      setDataPOClients(data?.data?.data);
      setFilterProgressType(data?.data?.progressType);
      setFilterStatusTrx(data?.data?.statusTrx);
      setFilterTypeTrx(data?.data?.typeTrx);
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await deletePurchaseOrderClient({
        purchase_order_client_id: id,
      });
      if (response.status)
        toast({
          title: "Berhasil!",
          description: `Berhasil hapus Pesanan Klien`,
        });
      if (!response.status)
        toast({
          title: "Kesalahan",
          description: response.messages,
          variant: "destructive",
        });
      fetchPurchaseOrderClient(request);
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchPurchaseOrderClient(request);
  }, [request]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pesanan Klien</h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total items</CardTitle>
            <itemPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"totalitems"}</div>
            <p className="text-xs text-muted-foreground">+2 bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"activeitems"}</div>
            <p className="text-xs text-muted-foreground">oke</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"adminCount"}</div>
            <p className="text-xs text-muted-foreground">Super item access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{"managerCount"}</div>
            <p className="text-xs text-muted-foreground">Management access</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari Klien atau Kode Order..."
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
              {/* Progress Type */}
              <Select
                value={request.progress_type_code}
                onValueChange={(e) =>
                  setRequest({ ...request, progress_type_code: e })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {filterProgressType.map((item) => (
                    <SelectItem
                      key={item.lookup_value_code}
                      value={item.lookup_value_code}
                    >
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Transaction Type */}
              <Select
                value={request.payment_method_code}
                onValueChange={(e) =>
                  setRequest({ ...request, payment_method_code: e })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipe Transaksi" />
                </SelectTrigger>
                <SelectContent>
                  {filterTypeTrx.map((item) => (
                    <SelectItem
                      key={item.lookup_value_code}
                      value={item.lookup_value_code}
                    >
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Transaction Status */}
              <Select
                value={request.status_trx_code}
                onValueChange={(e) =>
                  setRequest({ ...request, status_trx_code: e })
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status Transaksi" />
                </SelectTrigger>
                <SelectContent>
                  {filterStatusTrx.map((item) => (
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
                    progress_type_code: "",
                    payment_method_code: "",
                    status_trx_code: "",
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
      {dataPOClients.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Client</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal Pesan</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipe Transaksi</TableHead>
                    <TableHead>Status Transaksi</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPOClients.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {item.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.purchase_order_client_code}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatDate(item.input_date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(item.send_date)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(item.type, item.type_badge)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.payment_type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getStatusBadge(item.status_trx, item.status_trx_badge)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatIDR(item.final_total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              navigate(`/review-order-client`, {
                                state: { purchase_order_client_id: item?.id },
                              })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmModal
                            title="Hapus Pesanan"
                            description={`Apakah kamu yakin ingin menghapus pesanan${" "}<b>${
                              item.name
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
                          {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {dataPOClients.length !== 0 && (
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
                      distribusi
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
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada data penjualan
          </h3>
          <p className="text-gray-400 mb-4">
            Tidak ditemukan data penjualan produk
          </p>
        </div>
      )}
    </div>
  );
}
