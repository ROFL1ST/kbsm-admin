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
  Tag,
  Percent,
  Star,
  BadgePercent,
  Image,
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
import { Badge } from "@/components/ui/badge";
import {
  ProductUnitIDInventoryKey,
  useProducts,
} from "@/contexts/Products.Context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/components/format/IDR";
import { useAuth } from "@/contexts/Auth.Context";
import { useCategories } from "@/contexts/Categories.Context";

export default function StockList() {
  const { getInventory, productsInventory, pagination, deleteInventory } =
    useProducts();
  const { categories, getCategories } = useCategories();
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    type: undefined as string | undefined,
    category_id: undefined as string | undefined,
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [header, setHeader] = useState({
    total_products: 0,
    total_product_follow_up: 0,
    total_product_price_follow_up: 0,
  });
  const navigate = useNavigate();
  const totalData = pagination?.total_data ?? 0;
  const totalPages = pagination?.total_page ?? 1;
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

  // Load categories for filter dropdown
  useEffect(() => {
    getCategories({ page: 1, size: 100, search: "" });
  }, []);

  // Delete function
  const handleDelete = async (params: ProductUnitIDInventoryKey) => {
    try {
      const res = await deleteInventory(params);
      if (res?.status) {
        toast({
          title: "Berhasil",
          description: "Data berhasil dihapus",
          variant: "default",
        });
        fetchDetailInventory(request);
      } else {
        toast({
          title: "Error",
          description: res?.messages || "Gagal menghapus Produk",
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
    if (response?.data?.header) {
      setHeader(response.data.header);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setRequest({ ...request, page });
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e?.target?.value;
    setRequest({ ...request, search: searchValue, page: 1 });
    setCurrentPage(1);
  };

  const handleTypeFilter = (val: string) => {
    setRequest({ ...request, type: val === "__all__" ? undefined : val, page: 1 });
    setCurrentPage(1);
  };

  const handleCategoryFilter = (val: string) => {
    setRequest({
      ...request,
      category_id: val === "__all__" ? undefined : val,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setRequest({ search: "", type: undefined, category_id: undefined, page: 1, size: 8 });
    setCurrentPage(1);
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/stock-list/manage-categories")}
          >
            <Tag className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/stock-list/manage-discounts")}
          >
            <Percent className="mr-2 h-4 w-4" />
            Manage Discounts
          </Button>
          {isPurchasing && (
            <Button onClick={() => navigate("/stock-list/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          )}
        </div>
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
                  Stok Perlu Diperhatikan
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
                  Belum Ada Harga Jual
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
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kode produk..."
                className="pl-10"
                value={request?.search}
                onChange={handleSearch}
              />
            </div>

            {/* Type Filter */}
            <Select
              value={request?.type ?? "__all__"}
              onValueChange={handleTypeFilter}
            >
              <SelectTrigger className="w-fit min-w-[200px] rounded-xl border-primary/20 focus:ring-primary">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Tipe" />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="__all__">Semua Tipe</SelectItem>
                <SelectItem value="0">Stok di Bawah 10</SelectItem>
                <SelectItem value="1">Best Seller</SelectItem>
                <SelectItem value="2">Produk Diskon</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={request?.category_id ?? "__all__"}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-fit min-w-[200px] rounded-xl border-primary/20 focus:ring-primary">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="__all__">Semua Kategori</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            <Button
              variant="outline"
              className="rounded-xl flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition"
              onClick={handleResetFilter}
            >
              <Filter className="h-4 w-4" />
              Reset Filter
            </Button>
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
                    <TableHead className="w-16">Gambar</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Unit</TableHead>
                    {canViewHPP && <TableHead>HPP</TableHead>}
                    {canViewPrice && <TableHead>Harga Jual</TableHead>}
                    {canViewPrice && <TableHead>Harga Final</TableHead>}
                    {canViewHPP && <TableHead>Margin</TableHead>}
                    {canViewTotalQuantity && <TableHead>Stok</TableHead>}
                    <TableHead>Label</TableHead>
                    {showActions && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsInventory.map((item) => (
                    <TableRow key={`${item.product_detail_id}-${item.product_unit_id}`}>
                      {/* Thumbnail */}
                      <TableCell>
                        {item.path ? (
                          <img
                            src={item.path}
                            alt={item.product_name}
                            className="h-10 w-10 rounded-lg object-cover border border-primary/10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs">{item.code}</TableCell>
                      <TableCell className="font-medium max-w-[180px]">
                        <div className="truncate" title={item.product_name}>
                          {item.product_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </TableCell>
                      <TableCell>{item.unit_code}</TableCell>
                      {canViewHPP && (
                        <TableCell>{formatIDR(item.hpp || 0)}</TableCell>
                      )}
                      {canViewPrice && (
                        <TableCell>{formatIDR(item.price || 0)}</TableCell>
                      )}
                      {canViewPrice && (
                        <TableCell>
                          {item.discount_flag && item.final_price != null ? (
                            <span className="text-green-600 font-semibold">
                              {formatIDR(item.final_price)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      {canViewHPP && (
                        <TableCell>{formatIDR(item.margin || 0)}</TableCell>
                      )}
                      {canViewTotalQuantity && (
                        <TableCell>
                          <span
                            className={
                              item.total_quantity < 10
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {item.total_quantity}
                          </span>
                        </TableCell>
                      )}

                      {/* Labels */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.is_best_seller && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              Best Seller
                            </Badge>
                          )}
                          {item.discount_flag && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
                              <BadgePercent className="h-3 w-3" />
                              Diskon {formatIDR(item.discount_amount)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

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
                                description={`Apakah Anda yakin ingin menghapus produk "<b>${item.product_name}</b>"? Tindakan ini bisa dibatalkan.`}
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
                        {(currentPage - 1) * request.size + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold">
                        {Math.min(currentPage * request.size, totalData)}
                      </span>{" "}
                      dari <span className="font-semibold">{totalData}</span>{" "}
                      produk
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
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

                    <div className="flex space-x-1">
                      {renderPaginationButtons()}
                    </div>

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
