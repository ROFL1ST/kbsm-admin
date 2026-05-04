import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
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
import { useReviews } from "@/contexts/Reviews.Context";
import { ReviewFormModal, ReviewFormData } from "./Action/ReviewFormModal";

export default function ManageReviews() {
  const {
    reviews,
    pagination,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
  } = useReviews();
  const [request, setRequest] = useState({ page: 1, size: 10, search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalData = pagination?.total_data ?? 0;
  const totalPages = pagination?.total_page ?? 1;

  useEffect(() => {
    getReviews(request);
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

  const handleCreate = async (data: ReviewFormData) => {
    if (!data.image || !data.name || !data.role || !data.review) {
      toast({
        title: "Error",
        description: "Foto, nama, role, dan review wajib diisi",
        variant: "destructive",
      });
      return;
    }
    const res = await createReview({
      image: data.image,
      name: data.name,
      role: data.role,
      review: data.review,
      rating: data.rating,
    });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Review berhasil ditambahkan" });
      getReviews(request);
    } else {
      toast({
        title: "Error",
        description: typeof res?.messages === "string" ? res.messages : "Gagal menambahkan review",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (reviewId: number, data: ReviewFormData) => {
    const res = await updateReview({
      review_id: reviewId,
      image: data.image,
      name: data.name,
      role: data.role,
      review: data.review,
      rating: data.rating,
    });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Review berhasil diperbarui" });
      getReviews(request);
    } else {
      toast({
        title: "Error",
        description: typeof res?.messages === "string" ? res.messages : "Gagal memperbarui review",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reviewId: number) => {
    const res = await deleteReview({ review_id: reviewId });
    if (res?.status) {
      toast({ title: "Berhasil", description: "Review berhasil dihapus" });
      getReviews(request);
    } else {
      toast({
        title: "Error",
        description: res?.messages || "Gagal menghapus review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{rating}/5</span>
      </div>
    );
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
              Kelola Reviews
            </h1>
            <p className="text-muted-foreground">Manajemen ulasan produk</p>
          </div>
        </div>
        <ReviewFormModal onSubmit={handleCreate}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Review
          </Button>
        </ReviewFormModal>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari review..."
              className="pl-10"
              value={request.search}
              onChange={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {reviews?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {(currentPage - 1) * request.size + index + 1}
                      </TableCell>
                      <TableCell>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-full object-cover border border-primary/10"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-12 w-12 rounded-full border border-primary/10 bg-gray-100 flex items-center justify-center ${item.image ? "hidden" : ""}`}
                        >
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.role}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="text-sm line-clamp-2">{item.review}</p>
                      </TableCell>
                      <TableCell>{renderStars(item.rating)}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ReviewFormModal
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
                          </ReviewFormModal>
                          <ConfirmModal
                            title="Hapus Review"
                            description={`Apakah Anda yakin ingin menghapus review dari "<b>${item.name}</b>"? Tindakan ini tidak dapat dibatalkan.`}
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
                    review
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
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada review
          </h3>
          <p className="text-gray-400 mb-4">
            Belum ada review yang ditambahkan
          </p>
        </div>
      )}
    </div>
  );
}
