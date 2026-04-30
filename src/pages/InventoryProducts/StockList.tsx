import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProductUnitIDInventoryKey,
  useProducts,
} from "@/contexts/Products.Context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/components/format/IDR";
import { useAuth } from "@/contexts/Auth.Context";

export default function StockList() {
  const { getInventory, productsInventory, pagination, deleteInventory } =
    useProducts();
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    type: undefined,
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [header, setHeader] = useState({
    total_products: 0,
    total_product_follow_up: 0,
    total_product_price_follow_up: 0,
  });
  const navigate = useNavigate();
  const totalData = pagination?.total_data;
  const totalPages = pagination?.total_page;
  const { toast } = useToast();
  const { user } = useAuth();

  // Permission checks
  const isFinance = user?.responsibilities?.some(
    (role) => role.code === "FINANCE",
  );
  const isPurchasing = user?.responsibilities?.some(
    (role) => role.code === "PURCHASING",
  );
  const isSales = user?.responsibilities?.some((role) => role.code === "SALES");
  const isWarehouse = user?.responsibilities?.some(
    (role) => role.code === "WAREHOUSE",
  );
  const isAdmin = user?.responsibilities?.some((role) => role.code === "ADMIN");

  const canEdit = isPurchasing || isFinance;
  const canDelete = isPurchasing || isFinance;
  const canViewHPP = isFinance || isPurchasing;
  const canViewPrice = isFinance || isSales || isAdmin;
  const canViewTotalQuantity =
    isFinance || isPurchasing || isWarehouse || isAdmin;
  const showActions = canEdit || canDelete;

  // Delete function
  const handleDelete = async (params: ProductUnitIDInventoryKey) => {
    try {
      const res = await deleteInventory(params);
      if (res.status) {
        toast({
          title: "Berhasil",
          description: "Data berhasil dihapus",
          variant: "default",
        });
        getInventory(request);
      } else {
        toast({
          title: "Error",
          description: res.messages || "Gagal menghapus Produk",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDetailInventory(request);
  }, [request]);

  const fetchDetailInventory = async (params) => {
    const response = await getInventory(params);
    setHeader(response?.data?.header);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setRequest({
        ...request,
        page: page,
      });
      setCurrentPage(page);
      getInventory({
        ...request,
        page: page,
      });
    }
  };

  const handleSearch = (e) => {
    const searchValue = e?.target?.value;
    setRequest({ ...request, search: searchValue });
    fetchDetailInventory({
      ...request,
      search: searchValue,
    });
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      buttons.push(
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(pageNum)}
          className={`min-w-[40px] ${
            currentPage === pageNum
              ? "bg-primary text-white"
              : "border-primary/20 text-primary hover:bg-primary hover:text-white"
          }`}
        >
          {pageNum}
        </Button>,
      );
    }

    return buttons;
  };
  const handletypeFilter = (e) => {
    console.log(e);
    setRequest({ ...request, type: e });
    fetchDetailInventory({ ...request, type: e });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Produk
          </h1>
          <p className="text-muted-foreground">
            Kelola dan pantau inventori produk Anda
          </p>
        </div>
        {isPurchasing && (
          <Button onClick={() => navigate("/stock-list/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {header?.total_products}
            </div>
          </CardContent>
        </Card>
        {canViewHPP && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Peringatan Stok
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {header?.total_product_follow_up}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produk perlu restok
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Belum Penginputan Harga Jual
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {header?.total_product_price_follow_up}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produk perlu input harga jual
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama , Deskripsi, Kode .."
                  className="w-full md:w-[300px] pl-10"
                  value={request?.search}
                  onChange={handleSearch}
                />
              </div>
              {canViewHPP && (
                <div className="relative">
                  <Select
                    value={request?.type}
                    onValueChange={handletypeFilter}
                  >
                    <SelectTrigger className="w-fit min-w-[200px] rounded-xl border-primary/20 focus:ring-primary">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status Distribusi" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value={"0"}>
                        Butuh Restock Quantity
                      </SelectItem>
                      <SelectItem value={"1"}>
                        Belum Penginputan Harga Jual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full rounded-xl flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition"
                  onClick={() =>
                    setRequest({
                      search: "",
                      type: "",
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
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {productsInventory?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>HPP</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.product_description}</TableCell>
                      <TableCell>{item.unit_code}</TableCell>
                      <TableCell>{formatIDR(item.hpp || 0)}</TableCell>
                      <TableCell>{formatIDR(item.price || 0)}</TableCell>
                      <TableCell>{formatIDR(item.margin || 0)}</TableCell>
                      <TableCell>{item.total_quantity}</TableCell>

                      {showActions && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  navigate("/stock-list/edit", {
                                    state: item?.product_unit_id,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <ConfirmModal
                                title="Hapus Produk"
                                description={`Apakah Anda yakin ingin menghapus produk "<b>${item.name}</b>"? Tindakan ini bisa dibatalkan.`}
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
                                onConfirm={() =>
                                  handleDelete({
                                    product_unit_id: item.product_unit_id,
                                  })
                                }
                              />
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {productsInventory.length > 0 && (
                <div className="px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-semibold">
                        {(request.page - 1) * request.size + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold">
                        {Math.min(request.page * request.size, totalData)}
                      </span>{" "}
                      dari <span className="font-semibold">{totalData}</span>{" "}
                      produk
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
                      {renderPaginationButtons()}
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
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada data Produk
          </h3>
          <p className="text-gray-400 mb-4">Tidak ditemukan data produk</p>
        </div>
      )}
    </div>
  );
}
