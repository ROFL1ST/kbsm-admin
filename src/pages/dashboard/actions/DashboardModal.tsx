"use client";
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RestockDialogContent = ({
  restock,
  navigate,
  onClose,
  pagination,
  requestRestock,
  handlePageChangeRestock,
}) => {
  const itemsPerPage = requestRestock?.per_page || 5;
  const currentPage = requestRestock?.page || 1;

  // Handler untuk pindah halaman
  const handlePageChange = (newPage) => {
    handlePageChangeRestock(newPage);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 w-[95vw] sm:w-full">
      <DialogHeader className="p-4 sm:p-6 sm:pb-4">
        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Semua Produk yang Perlu Restock
        </DialogTitle>
      </DialogHeader>

      {/* Tabel */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Stok Saat Ini</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restock && restock.length > 0 ? (
                restock.map((item) => (
                  <TableRow key={`${item.product_unit_id}-${item.product_id}`}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product_name} - {item.product_description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.total_quantity}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {item.unit_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.total_quantity < 4 ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.total_quantity < 4 ? "Kritis" : "Perlu Restok"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            onClose();
                            navigate("/stock-list/edit", {
                              state: item?.product_unit_id,
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada produk yang perlu restock</p>
                      <p className="text-sm">Semua stok dalam kondisi aman</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden p-4 space-y-4">
          {restock && restock.length > 0 ? (
            restock.map((item) => (
              <div
                key={`${item.product_unit_id}-${item.product_id}-mobile`}
                className="border rounded-lg p-4 space-y-3 bg-card"
              >
                {/* Header dengan nama dan aksi */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.product_name} - {item.product_description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      onClose();
                      navigate("/stock-list/edit", {
                        state: item?.product_unit_id,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Informasi produk */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Kode:</span>
                    <div className="mt-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.code}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Stok:</span>
                    <p className="font-semibold mt-1">{item.total_quantity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Unit:</span>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.unit_code}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Status:
                    </span>
                    <div className="mt-1">
                      <Badge
                        variant={
                          item.total_quantity < 4 ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.total_quantity < 4 ? "Kritis" : "Perlu Restok"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada produk yang perlu restock</p>
              <p className="text-sm">Semua stok dalam kondisi aman</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {restock &&
        restock.length > 0 &&
        pagination &&
        pagination.total_page > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-primary/5">
            {/* Info jumlah data */}
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-700">
                Menampilkan{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * itemsPerPage, pagination.total_data)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold">{pagination.total_data}</span>{" "}
                produk
              </span>
            </div>

            {/* Navigasi halaman */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-50 text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              {/* Page Numbers - Desktop */}
              <div className="hidden sm:flex space-x-1">
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

              {/* Page Numbers - Mobile */}
              <div className="sm:hidden flex items-center space-x-1">
                <span className="text-xs text-muted-foreground px-2">
                  {currentPage} / {pagination.total_page}
                </span>
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.total_page}
                className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-50 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        )}
    </DialogContent>
  );
};

export default RestockDialogContent;
