import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
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
import { useCategories } from "@/contexts/Categories.Context";
import { CategoryFormModal } from "./Action/CategoryFormModal";

export default function ManageCategories() {
  const {
    categories,
    pagination,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [request, setRequest] = useState({ page: 1, size: 10, search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalData = pagination?.total_data ?? 0;
  const totalPages = pagination?.total_page ?? 1;

  useEffect(() => {
    getCategories(request);
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

  const handleCreate = async (name: string, path: File | null) => {
    if (!name || !path) {
      toast({
        title: "Error",
        description: "Nama dan gambar wajib diisi",
        variant: "destructive",
      });
      return;
    }
    const res = await createCategory({ name, path });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" });
      getCategories(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal menambahkan kategori",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    name: string,
    path: File | null,
    categoryId: number,
  ) => {
    const res = await updateCategory({ name, path, category_id: categoryId });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Kategori berhasil diperbarui" });
      getCategories(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal memperbarui kategori",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (categoryId: number) => {
    const res = await deleteCategory({ category_id: categoryId });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Kategori berhasil dihapus" });
      getCategories(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal menghapus kategori",
        variant: "destructive",
      });
    }
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
              Kelola Kategori
            </h1>
            <p className="text-muted-foreground">Manajemen kategori produk</p>
          </div>
        </div>
        <CategoryFormModal onSubmit={handleCreate}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </CategoryFormModal>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kategori..."
              className="pl-10"
              value={request.search}
              onChange={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {categories?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead className="w-20">Gambar</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {(currentPage - 1) * request.size + index + 1}
                      </TableCell>
                      <TableCell>
                        <img
                          src={item.path}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover border border-primary/10"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryFormModal
                            isEdit
                            initialData={item}
                            onSubmit={(name, path) =>
                              handleUpdate(name, path, item.id)
                            }
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CategoryFormModal>
                          <ConfirmModal
                            title="Hapus Kategori"
                            description={`Apakah Anda yakin ingin menghapus kategori "<b>${item.name}</b>"? Tindakan ini tidak dapat dibatalkan.`}
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
                    kategori
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
                    <div className="flex space-x-1">{renderPaginationButtons()}</div>
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
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada kategori
          </h3>
          <p className="text-gray-400 mb-4">
            Belum ada kategori yang ditambahkan
          </p>
        </div>
      )}
    </div>
  );
}
