import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import axios from "axios";
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
import { VariantProps } from "class-variance-authority";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useNavigate } from "react-router-dom";
import { formatIDR } from "@/components/format/IDR";
import API from "@/config/API";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { usePurchaseOrderVendors } from "@/contexts/PurchaseOrderVendors.Context";
import { NotesVendorModal } from "@/components/ui/NotesVendorModal";

export default function ProductFixingOrderClients() {
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
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const { toast } = useToast();

  const getStatusBadge = (status: string, color: BadgeVariant) => {
    return <Badge variant={color}>{status}</Badge>;
  };
  const { printTravelDocument, isLoading } = usePurchaseOrderVendors();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchPurchaseOrderClient = async (params) => {
    try {
      const { data } = await API.get(
        `/purchase-order/clients?page=${params.page}&size=${params.size}&progress_type_code=&status_trx_code=${params.status_trx_code}&search=${params.search}&payment_method_code=${params.payment_method_code}&start_date=${params.start_date}&end_date=${params.end_date}&fixing=true`
      );
      setDataPOClients(data?.data?.data);
      setFilterProgressType(data?.data?.progressType);
      setFilterStatusTrx(data?.data?.statusTrx);
      setFilterTypeTrx(data?.data?.typeTrx);
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
    }
  };
  useEffect(() => {
    fetchPurchaseOrderClient(request);
  }, [request]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Perbaikan Pesanan Klien
          </h1>
          <p className="text-muted-foreground">
            Perbaikan Pesanan Klien adalah pesanan klien yang meminta Refund,
            Retur dan lainnya dari pihak klien.
          </p>
        </div>
      </div>

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
                  {filterTypeTrx?.map((item) => (
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
                  {filterStatusTrx?.map((item) => (
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
      {dataPOClients?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Klien</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal Pesan</TableHead>
                    <TableHead>Status Pengambilan Barang Klien</TableHead>
                    <TableHead>Sudah Diambil Oleh</TableHead>
                    <TableHead>Tipe Transaksi</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPOClients?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.purchase_order_client_code}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatDate(user.input_date)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(
                          user?.problem_product_take_by !== "N"
                            ? "Sudah Diambil"
                            : " Belum Diambil",
                          user?.problem_product_take_by !== "N"
                            ? "green"
                            : "yellow"
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          user?.problem_product_take_name,
                          "default"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.payment_type}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              navigate(
                                `/incoming/fixing-order-clients/detail`,
                                {
                                  state: {
                                    purchase_order_client_id: user?.id,
                                  },
                                }
                              )
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada data Pesanan yang sedang Diproses
          </h3>
          <p className="text-gray-400 mb-4">
            Tidak ditemukan data Pesanan sedang Diproses
          </p>
        </div>
      )}
    </div>
  );
}
