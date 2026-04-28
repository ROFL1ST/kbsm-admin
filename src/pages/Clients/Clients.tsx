import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { useFinance } from "@/contexts/Finance.context";
import { VariantProps } from "class-variance-authority";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/components/format/IDR";
import { useClients } from "@/contexts/Clients.Context";
import { AddClientModal } from "./Actions/Create";

export default function ClientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [request, setRequest] = useState({
    limit: 10,
    page: 1,
    search: "",
  });
  const { getClientWithPagination, clients, pagination, deleteClientPage } =
    useClients();
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const response = await getClientWithPagination(request);
    } catch (error) {
      console.error("Error fetching clients with pagination:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal mengambil klien.",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, [request]);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setRequest((prev) => ({ ...prev, page }));
  };

  //   delete
  const handleDeleteClient = async (client_id: number) => {
    try {
      const res = await deleteClientPage(client_id);
      if (res.status) {
        toast({
          title: "Berhasil",
          description: "Klien berhasil dihapus.",
        });
        // Refresh the client list
        fetchClients();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: res.messages || "Gagal menghapus klien.",
        });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal menghapus klien.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manajemen Klien
          </h1>
          <p className="text-muted-foreground">
            Kelola data klien Anda di sini.
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/clients/create");
          }}
          className="w-fit"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Klien
        </Button>
      </div>

      {/* filter */}
      <Card>
        <CardHeader className="space-y-5">
          <CardTitle>Daftar Klien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari Klien nama,email dan phone ...."
                  className="w-full pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  value={request?.search}
                  onChange={(e) =>
                    setRequest({ ...request, search: e?.target?.value })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {clients?.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>No. Telpon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        className={`${item.name ?? "text-destructive"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.path || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {item.name != ""
                                ? item.name.charAt(0).toUpperCase()
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {item.name != "" ? item.name : "Tidak ada nama"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.phone != "" ? item.phone : "Tidak ada no. telpon"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.email != "" ? item.email : "Tidak ada email"}
                      </TableCell>

                      <TableCell>{item.type_value}</TableCell>
                      <TableCell className=" text-sm">
                        {item.address != "" ? item.address : "Tidak ada alamat"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              navigate("/clients/edit", { state: { item } });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmModal
                            title="Hapus Pesanan"
                            description={`Apakah kamu yakin ingin menghapus klien${" "}<b>${
                              item.name !== "" ? item.name : "Tidak ada nama"
                            }</b>? Tindakan ini tidak dapat dibatalkan.`}
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
                            onConfirm={() => handleDeleteClient(item.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* paginations */}
              {clients.length > 0 && (
                <div className="px-6 py-4 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-semibold">
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold">
                        {Math.min(currentPage * 10, pagination.total_data)}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold">
                        {pagination.total_data}
                      </span>{" "}
                      data
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

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.total_page}
                      className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {/* paginations */}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Tidak ada data Klien
          </h3>
          <p className="text-gray-400 mb-4">Tidak ditemukan data Klien</p>
        </div>
      )}
    </div>
  );
}
