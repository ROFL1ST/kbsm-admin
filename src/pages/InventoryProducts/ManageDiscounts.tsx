import React, { useEffect, useState } from "react";
import {
  Percent,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useDiscounts } from "@/contexts/Discounts.Context";
import {
  DiscountFormModal,
  DiscountFormData,
} from "./Action/DiscountFormModal";
import { formatIDR } from "@/components/format/IDR";

export default function ManageDiscounts() {
  const {
    discounts,
    pagination,
    getDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  } = useDiscounts();
  const [request, setRequest] = useState({ page: 1, size: 10, search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalData = pagination?.total_data ?? 0;
  const totalPages = pagination?.total_page ?? 1;

  useEffect(() => {
    getDiscounts(request);
  }, [request]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setRequest({ ...request, search: searchValue, page: 1 });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setRequest({ ...request, page });
      setCurrentPage(page);
    }
  };

  const handleCreate = async (data: DiscountFormData) => {
    if (!data.path || !data.name || !data.product_id) {
      toast({
        title: "Error",
        description: "Gambar, nama, dan product ID wajib diisi",
        variant: "destructive",
      });
      return;
    }
    const res = await createDiscount({
      path: data.path,
      name: data.name,
      discount_percentage: data.discount_percentage,
      original_price: data.original_price,
      final_price: data.final_price,
      category_id: data.category_id,
      product_unit_id: data.product_unit_id,
      product_detail_id: data.product_detail_id,
      product_id: data.product_id,
      valid_until: data.valid_until,
    });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Diskon berhasil ditambahkan" });
      getDiscounts(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal menambahkan diskon",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (discountId: number, data: DiscountFormData) => {
    const res = await updateDiscount({
      discount_id: discountId,
      path: data.path,
      name: data.name,
      discount_percentage: data.discount_percentage,
      original_price: data.original_price,
      final_price: data.final_price,
      category_id: data.category_id,
      product_unit_id: data.product_unit_id,
      product_detail_id: data.product_detail_id,
      product_id: data.product_id,
      valid_until: data.valid_until,
    });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Diskon berhasil diperbarui" });
      getDiscounts(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal memperbarui diskon",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (discountId: number) => {
    const res = await deleteDiscount({ discount_id: discountId });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Diskon berhasil dihapus" });
      getDiscounts(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal menghapus diskon",
        variant: "destructive",
      });
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    const d = new Date(validUntil);
    return !isNaN(d.getTime()) && d < new Date();
  };

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
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/stock-list")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kelola Diskon
            </h1>
            <p className="text-muted-foreground">
              Manajemen diskon produk
            </p>
          </div>
        </div>
        <DiscountFormModal onSubmit={handleCreate}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Diskon
          </Button>
        </DiscountFormModal>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Diskon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari diskon..."
              className="pl-10"
              value={request.search}
              onChange={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {discounts?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead className="w-20">Gambar</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Harga Asli</TableHead>
                    <TableHead>Diskon</TableHead>
                    <TableHead>Harga Final</TableHead>
                    <TableHead>Berlaku Hingga</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {(currentPage - 1) * request.size + index + 1}
                      </TableCell>
                      <TableCell>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover border border-primary/10"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-12 w-12 rounded-lg border border-primary/10 bg-gray-100 flex items-center justify-center ${item.image ? "hidden" : ""}`}
                        >
                          <Percent className="h-5 w-5 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatIDR(item.original_price)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          <Percent className="h-3 w-3" />
                          {item.discount_percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatIDR(item.final_price)}
                      </TableCell>
                      <TableCell>
                        {item.valid_until ? (
                          <span
                            className={`flex items-center gap-1 text-sm ${
                              isExpired(item.valid_until)
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(item.valid_until).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            {isExpired(item.valid_until) && (
                              <span className="ml-1 text-xs font-medium text-red-500">
                                (Kadaluarsa)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DiscountFormModal
                            isEdit
                            initialData={item}
                            onSubmit={(data) => handleUpdate(item.id, data)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DiscountFormModal>
                          <ConfirmModal
                            title="Hapus Diskon"
                            description={`Apakah Anda yakin ingin menghapus diskon "<b>${item.name}</b>"? Tindakan ini tidak dapat dibatalkan.`}
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
                                <Trash2 className="h-4 w-4" />
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

              {/* Pagination */}
              {totalData > 0 && (
                <div className="px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
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
                    diskon
                  </span>
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
          <Percent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada diskon
          </h3>
          <p className="text-gray-400 mb-4">
            Belum ada diskon yang ditambahkan
          </p>
        </div>
      )}
    </div>
  );
}
