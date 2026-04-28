import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Hash,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Car,
  PackageCheck,
  MoreVertical,
  Printer,
  RefreshCw,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { useNavigate } from "react-router-dom";
import {
  PurchaseOrderClientDeliveryHistoriesKey,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DeliveryHistories() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    search: "",
    is_return: "",
  });

  const navigate = useNavigate();
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const { getPurchaseOrderDeliveryHistories, deliveryHistories, pagination } =
    usePurchaseOrderClients();
  const [header, setHeader] = useState({
    total_done: 0,
    total_has_not_yet: 0,
    total_sending: 0,
  });
  const { toast } = useToast();

  // Data dari API - menggunakan data yang sudah difetch
  const distributionData = deliveryHistories;
  const totalData = pagination?.total_data;
  const totalPages = pagination?.total_page;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (progressType: string): BadgeVariant => {
    console.log(progressType, "progressType");
    switch (progressType) {
      case "DONE":
        return "green";
      case "HAS_NOT_SENT":
        return "yellow";
      case "SENDING":
        return "default";
      default:
        return "outline";
    }
  };

  // Handle page change yang memanggil fetchProductDeliveryHistories
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newRequest = {
        ...request,
        page: page,
        size: itemsPerPage,
      };
      setRequest(newRequest);
      setCurrentPage(page);
      fetchProductDeliveryHistories(newRequest);
    }
  };

  const fetchProductDeliveryHistories = async (
    params: PurchaseOrderClientDeliveryHistoriesKey
  ) => {
    try {
      const response = await getPurchaseOrderDeliveryHistories(params);
      setHeader(response?.data?.header);
    } catch (error) {
      console.error("Failed to fetch product distributions:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal memuat data distribusi produk",
        variant: "destructive",
      });
    }
  };

  // Handle search dan filter changes
  const handleSearchChange = (value: string) => {
    const newRequest = {
      ...request,
      search: value,
      page: 1,
    };
    setRequest(newRequest);
    setCurrentPage(1);
    fetchProductDeliveryHistories(newRequest);
  };

  useEffect(() => {
    fetchProductDeliveryHistories(request);
  }, [request]);

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 lg:p-6">
      {/* Header dengan background gradient */}
      <div className="relative rounded-xl md:rounded-2xl p-4 md:p-6 overflow-hidden">
        <div className="absolute right-2 md:right-6 top-2 md:top-1 opacity-10">
          <Truck className="h-20 w-20 md:h-32 md:w-32 " />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Aktifitas Pengantaran Barang
          </h1>
          <p className="text-muted-foreground">
            Pantau dan kelola semua pengiriman dengan mudah
          </p>
        </div>
      </div>

      {/* Stats Cards Modern - Mobile: 1 kolom, Tablet: 2 kolom, Desktop: 4 kolom */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium">
              Belum Berangkat
            </CardTitle>
            <div className="p-1 md:p-2 bg-accent rounded-lg">
              <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {header?.total_has_not_yet}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu proses pengantaran
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium">
              Sedang Dikirim
            </CardTitle>
            <div className="p-1 md:p-2 bg-accent rounded-lg">
              <Car className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {header?.total_sending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dalam perjalanan
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium">Sudah Selesai</CardTitle>
            <div className="p-1 md:p-2 bg-accent rounded-lg">
              <PackageCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {header?.total_done}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pengantaran selesai
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium">
              Total Aktifitas
            </CardTitle>
            <div className="p-1 md:p-2 bg-accent rounded-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {header?.total_done +
                header?.total_sending +
                header?.total_has_not_yet}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua pengantaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filter & Pencarian
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Temukan dan filter data pengantaran dengan cepat
          </p>
        </div>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Cari berdasarkan nama klien, kode PO, kode pengiriman..."
                className="pl-10 md:pl-12 pr-3 md:pr-4 py-4 md:py-6 text-sm md:text-base rounded-lg md:rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={request?.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Tipe Pengiriman Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-3 w-3 md:h-4 md:w-4" />
                    Tipe Pengiriman
                  </label>
                  <Select
                    value={request.is_return}
                    onValueChange={(e) =>
                      setRequest({ ...request, is_return: e })
                    }
                  >
                    <SelectTrigger className="w-full rounded-lg md:rounded-xl border-2 py-4 md:py-5 text-sm md:text-base">
                      <SelectValue placeholder="Pilih tipe pengiriman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">
                        <div className="flex items-center gap-2 text-sm md:text-base">
                          <Package className="h-3 w-3 md:h-4 md:w-4" />
                          Pembelian
                        </div>
                      </SelectItem>
                      <SelectItem value="Y">
                        <div className="flex items-center gap-2 text-sm md:text-base">
                          <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                          Return
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="default"
                  size="default"
                  className="rounded-lg md:rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-lg w-full sm:w-auto text-sm md:text-base"
                  onClick={() => {
                    const resetRequest = {
                      page: 1,
                      size: 8,
                      search: "",
                      is_return: "",
                    };
                    setRequest(resetRequest);
                    setCurrentPage(1);
                    fetchProductDeliveryHistories(resetRequest);
                  }}
                >
                  <Filter className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Reset Filter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Distribution List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b p-4 md:p-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                <Package className="h-5 w-5 md:h-6 md:w-6" />
                Daftar Pengantaran Aktif
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {totalData} pengantaran ditemukan
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="px-2 py-1 md:px-3 md:py-1 text-xs"
              >
                <Clock className="mr-1 h-3 w-3" />
                Real-time Update
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {distributionData.length > 0 ? (
            <div className="divide-y">
              {distributionData.map((item, index) => (
                <div
                  key={index}
                  className="group p-4 md:p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 cursor-pointer border-b last:border-0"
                  onClick={() => {
                    if (item?.purchase_order_client_problem_id) {
                      navigate("/activity-driver/detail/return", {
                        state: {
                          purchase_order_client_id:
                            item?.purchase_order_client_id,
                          purchase_order_client_problem_id:
                            item?.purchase_order_client_problem_id,
                        },
                      });
                    } else {
                      navigate("/activity-driver/detail", {
                        state: item?.purchase_order_client_id,
                      });
                    }
                  }}
                >
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Top Section - Client Info & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                      {/* Client Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 md:gap-3 mb-2">
                          <div className="p-1 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Building className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors truncate">
                              {item.name}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-xs md:text-sm mt-1">
                              <div className="flex items-center gap-1 md:gap-2">
                                <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">
                                  {item.phone || "Tidak ada telepon"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {item?.is_return === "Y" && (
                          <Badge
                            variant="destructive"
                            className="px-2 py-1 md:px-3 md:py-1.5 text-xs"
                          >
                            Return
                          </Badge>
                        )}
                        <Badge
                          variant={getStatusColor(item?.progress_type_code)}
                          className="px-2 py-1 md:px-3 md:py-1.5 text-xs"
                        >
                          {item?.progress_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <Hash className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          Kode PO
                        </div>
                        <div className="font-medium bg-primary/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-sm md:text-base truncate">
                          {item.purchase_order_client_code || "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <Hash className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          Kode Pengiriman
                        </div>
                        <div className="font-medium bg-primary/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-sm md:text-base truncate">
                          {item.travel_code || "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          Tanggal Kirim
                        </div>
                        <div className="font-medium flex flex-col md:flex-row md:items-center gap-1 text-sm md:text-base">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                            {formatDate(item?.request_send_date)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(item?.request_send_date)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <ArrowRightLeft className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          Metode Pembayaran
                        </div>
                        <div className="font-medium bg-primary/10 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-sm md:text-base truncate">
                          {item?.payment_method || "-"}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info - Alamat */}
                    {item.travel_code && (
                      <div className="flex items-start gap-2 pt-2 md:pt-3 border-t">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm line-clamp-2">
                          {item.travel_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full mb-4 md:mb-6">
                <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Tidak ada data pengantaran
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm md:text-base">
                Belum ada data pengantaran yang ditemukan. Coba ubah filter
                pencarian atau tambah data baru.
              </p>
            </div>
          )}

          {/* Pagination Modern */}
          {distributionData.length > 0 && (
            <div className="px-4 md:px-6 py-4 md:py-6 border-t bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-sm font-medium">
                    Menampilkan{" "}
                    <span className="text-primary font-bold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    -{" "}
                    <span className="text-primary font-bold">
                      {Math.min(currentPage * itemsPerPage, totalData)}
                    </span>{" "}
                    dari{" "}
                    <span className="text-primary font-bold">{totalData}</span>{" "}
                    pengantaran
                  </span>
                </div>

                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl border-2 hover:bg-primary hover:text-white disabled:opacity-50 text-xs md:text-sm"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="ml-1 md:ml-2 hidden sm:inline">
                      Sebelumnya
                    </span>
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
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
                          className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl font-medium text-xs md:text-sm ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg"
                              : "border-2 hover:bg-primary hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl border-2 hover:bg-primary hover:text-white disabled:opacity-50 text-xs md:text-sm"
                  >
                    <span className="mr-1 md:mr-2 hidden sm:inline">
                      Selanjutnya
                    </span>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
