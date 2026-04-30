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
  Truck,
  PackageCheck,
  User,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { useToast } from "@/hooks/use-toast";
import {
  ProductDistributionsKey,
  useProducts,
} from "@/contexts/Products.Context";
import { ProductOutsModal } from "@/components/ui/ProductOutsModal";
import { ProductInModal } from "@/components/ui/ProductInModal";

export default function ProductsIn() {
  const [filterProgressType, setFilterProgressType] = useState([]);
  const [filterStatusTrx, setFilterStatusTrx] = useState([]);
  const [filterTypeTrx, setFilterTypeTrx] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [header, setHeader] = useState({
    total_order_receive_on_progress: 0,
    total_order_received: 0,
    order_problem_products: 0,
  });
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    search: "",
    distribution_status: "",
    transaction_type: "",
    start_date: "",
    end_date: "",
    type: 1,
  });

  const navigate = useNavigate();
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const { toast } = useToast();
  const {
    getProductDistributions,
    productDistributions,
    pagination,
    productDistributionFilter,
  } = useProducts();

  // Data dari API - menggunakan data yang sudah difetch
  const distributionData = productDistributions;
  const totalData = pagination?.total_data;
  const totalPages = pagination?.total_page;

  // Status badge dengan warna yang sesuai untuk distribusi produk
  const getDistributionStatusBadge = (code: string, value: string) => {
    const statusConfig = {
      ON_HAND: {
        variant: "default" as const,
        class:
          "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      },
      Distributed: {
        variant: "secondary" as const,
        class: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
      },
      Returned: {
        variant: "destructive" as const,
        class: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      },
      on_hand: {
        variant: "default" as const,
        class:
          "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      },
      distributed: {
        variant: "secondary" as const,
        class: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
      },
      returned: {
        variant: "destructive" as const,
        class: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      },
    };

    const config = statusConfig[code] || { variant: "outline", class: "" };

    return (
      <Badge variant={config.variant} className={`${config.class} font-medium`}>
        {value}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle page change yang memanggil fetchProductDistributions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newRequest = {
        ...request,
        page: page,
        size: itemsPerPage,
      };
      setRequest(newRequest);
      setCurrentPage(page);
      fetchProductDistributions(newRequest);
    }
  };

  const fetchProductDistributions = async (params: ProductDistributionsKey) => {
    try {
      const response = await getProductDistributions(params);
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
    fetchProductDistributions(newRequest);
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const formatDate = (d?: Date) => (d ? d.toLocaleDateString("sv-SE") : "");
    const newRequest = {
      ...request,
      start_date: formatDate(range?.from),
      end_date: formatDate(range?.to),
      page: 1,
    };
    setRequest(newRequest);
    setCurrentPage(1);
    fetchProductDistributions(newRequest);
  };

  const handleStatusChange = (value: string) => {
    const newRequest = {
      ...request,
      distribution_status: value,
      page: 1,
    };
    setRequest(newRequest);
    setCurrentPage(1);
    fetchProductDistributions(newRequest);
  };
  const handleTransactionChange = (value: string) => {
    const newRequest = {
      ...request,
      transaction_type: value,
      page: 1,
    };
    setRequest(newRequest);
    setCurrentPage(1);
    fetchProductDistributions(newRequest);
  };

  useEffect(() => {
    fetchProductDistributions(request);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Barang Masuk</h1>
          <p className="text-muted-foreground">
            Kelola distribusi dan stok produk
          </p>
        </div>
        {/* <ProductInModal
          title={"Distribusi"}
          confirmText={`Kirim`}
          cancelText="Batal"
          variant="outline"
          showIcon={false}
          trigger={
            <Button>
              <Package />
              Distribusi
            </Button>
          }
        /> */}

        {/* <Button className="rounded-xl flex items-center gap-2 bg-primary hover:bg-primary/90">
          <Package />
          Distribusi
        </Button> */}
      </div>
      {/* <div className="grid gap-4 md:grid-cols-4">
        <Card
          onClick={() => navigate("/incoming/loading")}
          className="cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loading</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {header?.total_order_receive_on_progress}
            </div>
            <p className="text-xs text-muted-foreground">PO Dalam Proses</p>
          </CardContent>
        </Card>
        <Card
          onClick={() => navigate("/incoming/received")}
          className="cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Sampai</CardTitle>
            <PackageCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {header?.total_order_received}
            </div>
            <p className="text-xs text-muted-foreground">PO Sudah Terkirim</p>
          </CardContent>
        </Card>
        <Card
          onClick={() => navigate("/manage-adjusment-products-analyze")}
          className="cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Perbaikan Pesanan Klien
            </CardTitle>
            <PackageX className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {header?.order_problem_products}
            </div>
            <p className="text-xs text-muted-foreground">Return,Refund ...</p>
          </CardContent>
        </Card>
      </div> */}
      {/* Filters and Search */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle>Filter Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari produk atau kode distribusi..."
                  className="w-full pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary border-primary/20"
                  value={request?.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Status Distribution */}
              <Select
                value={request.distribution_status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full rounded-xl border-primary/20 focus:ring-primary">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status Distribusi" />
                </SelectTrigger>
                <SelectContent>
                  {productDistributionFilter?.status_distribution_code.map(
                    (item) => (
                      <SelectItem
                        key={item.lookup_value_code}
                        value={item.lookup_value_code}
                      >
                        {item.value}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {/* Transaction Type */}
              <Select
                value={request?.transaction_type}
                onValueChange={handleTransactionChange}
              >
                <SelectTrigger className="w-full rounded-xl border-primary/20 focus:ring-primary">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {productDistributionFilter?.transaction_code.map((item) => (
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
                className="w-full md:w-auto rounded-xl flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition border-red-200"
                onClick={() => {
                  const resetRequest = {
                    page: 1,
                    size: 8,
                    search: "",
                    distribution_status: "",
                    transaction_type: "",
                    start_date: "",
                    end_date: "",
                    type: 1,
                  };
                  setRequest(resetRequest);
                  setCurrentPage(1);
                  fetchProductDistributions(resetRequest);
                }}
              >
                <Filter className="h-4 w-4" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Distribution List */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Histori Produk Yang Masuk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Single Column List */}
            {distributionData.length > 0 ? (
              <div className="space-y-4 p-4">
                {distributionData.map((product, index) => (
                  <Card
                    key={index}
                    className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 w-full"
                    // onClick={() => {
                    //   if (
                    //     product?.source_table ===
                    //     "purchase_order_vendor_delivery"
                    //   ) {
                    //     navigate(`/incoming/received/detail`, {
                    //       state: product?.transactions_id,
                    //     });
                    //   }
                    // }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section - Product Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold  text-lg mb-2">
                                {product.product_name} ({product.unit_code})
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm ">
                                <div className="flex items-center gap-2">
                                  <Hash className="h-4 w-4 text-primary" />
                                  <span>Kode: </span>
                                  <span className="font-medium ">
                                    {product.code || "Tidak ada kode"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-primary" />
                                  <span>Quantity: </span>
                                  <span className="font-medium ">
                                    {product.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {getDistributionStatusBadge(
                                product?.status_distribution_code,
                                product.status_distribution,
                              )}
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm ">
                            <div className="flex items-center gap-2">
                              <ArrowRightLeft className="h-4 w-4 text-primary" />
                              <span>Tipe Transaksi: </span>
                              <span className="font-medium ">
                                {product.transaction_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>Tanggal: </span>
                              <span className="font-medium ">
                                {formatDate(product.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <span>Aksi: </span>
                              <span className="font-medium ">
                                {product.created_by}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16  mx-auto mb-4" />
                <h3 className="text-lg font-semibold  mb-2">
                  Tidak ada data distribusi
                </h3>
                <p className=" mb-4">Tidak ditemukan data distribusi produk</p>
              </div>
            )}

            {/* Pagination */}
            {distributionData.length > 0 && (
              <div className="px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
                <div className="flex items-center space-x-2">
                  <span className="text-sm ">
                    Menampilkan{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold">
                      {Math.min(currentPage * itemsPerPage, totalData)}
                    </span>{" "}
                    dari <span className="font-semibold">{totalData}</span>{" "}
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
                          className={`min-w-[40px] ${
                            currentPage === pageNum
                              ? "bg-primary text-white"
                              : "border-primary/20 text-primary hover:bg-primary hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
    </div>
  );
}
