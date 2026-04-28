import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  DollarSign,
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

export default function PurchaseOrderVendors() {
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
  const [header, setHeader] = useState({
    total_po_vendors: 0,
    total_po_vendor_un_paid: 0,
    total_po_vendor_un_paid_amount: 0,
  });
  const navigate = useNavigate();
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const { toast } = useToast();

  const getStatusBadge = (status: string, color: BadgeVariant) => {
    return <Badge variant={color}>{status}</Badge>;
  };

  const { printTravelDocument, isLoading, deletePurchaseOrderVendor } =
    usePurchaseOrderVendors();
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
        `/purchase-order/vendors?page=${params.page}&size=${params.size}&progress_type_code=${params.progress_type_code}&status_trx_code=${params.status_trx_code}&search=${params.search}&payment_method_code=${params.payment_method_code}&start_date=${params.start_date}&end_date=${params.end_date}`,
      );
      setDataPOClients(data?.data?.data);
      setFilterProgressType(data?.data?.progressType);
      setFilterStatusTrx(data?.data?.statusTrx);
      setFilterTypeTrx(data?.data?.typeTrx);
      setHeader(data?.data?.header);
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
    }
  };
  useEffect(() => {
    fetchPurchaseOrderClient(request);
  }, [request]);

  const handleDelete = async (id: string) => {
    try {
      const response = await deletePurchaseOrderVendor({
        purchase_order_vendor_id: id,
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
      console.log(error);
    }
  };
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
            Permintaan Pembelian Produk
          </h1>
          <p className="text-muted-foreground">Kelola pesanan perusahaan</p>
        </div>
        <Button
          className="w-fit"
          onClick={() => navigate("/po-vendors/generate-po")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pesanan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {header?.total_po_vendors}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Belum Lunas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatIDR(header?.total_po_vendor_un_paid_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              dari {header?.total_po_vendor_un_paid} Purchase Order
            </p>
          </CardContent>
        </Card>
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
                    <TableHead>Nama Vendor</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal Pesan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipe Transaksi</TableHead>
                    <TableHead>Status Transaksi</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPOClients.map((user) => (
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
                        {user.purchase_order_vendor_code}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatDate(user.input_date)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(user.type, user.type_badge)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.payment_type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getStatusBadge(user.status_trx, user.status_trx_badge)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatIDR(user.final_total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() =>
                              navigate(`/po-vendors/edit`, {
                                state: user?.id,
                              })
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user?.finance_callback_reason &&
                            user?.progress_type_code !==
                              "WAIT_FOR_APPROVAL" && (
                              <NotesVendorModal
                                title={`Purchase Order Vendor`}
                                confirmText={`Print`}
                                cancelText="Batal"
                                purchase_order_vendor_id={user?.id}
                                variant="outline"
                                showIcon={false}
                                handlePrint={printTravelDocument}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Printer />
                                  </Button>
                                }
                              />
                            )}
                          {/* <Button
                          onClick={() =>
                            printTravelDocument({
                              purchase_order_vendor_id: user?.id,
                              description: "test",
                            })
                          }
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Printer className="h-4 w-4" />
                        </Button> */}

                          <ConfirmModal
                            title="Hapus Pesanan"
                            description={`Apakah kamu yakin ingin menghapus pesanan${" "}
                                <b>${user.name}</b>? Tindakan ini tidak dapat
                                dibatalkan.`}
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
                            onConfirm={() => handleDelete(user.id)}
                          />
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
