import React, { useState } from "react";
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatIDR } from "@/components/format/IDR";

// Mock data
const incomingSupplies = [
  {
    id: "IN-2024-001",
    date: "2024-01-15",
    product: "Laptop Dell XPS 13",
    sku: "LPT-001",
    quantity: 15,
    unitPrice: 15000000,
    totalValue: 225000000,
    supplier: "PT Tech Solutions",
    supplierCode: "SUP-001",
    status: "completed",
    receivedBy: "John Doe",
    notes: "Kondisi baik, lengkap dengan accessories",
    purchaseOrder: "PO-2024-001",
  },
  {
    id: "IN-2024-002",
    date: "2024-01-15",
    product: 'Monitor LG 27" 4K',
    sku: "MON-003",
    quantity: 25,
    unitPrice: 4500000,
    totalValue: 112500000,
    supplier: "LG Electronics Indonesia",
    supplierCode: "SUP-002",
    status: "in_transit",
    receivedBy: "-",
    notes: "Estimasi tiba 16 Jan 2024",
    purchaseOrder: "PO-2024-002",
  },
  {
    id: "IN-2024-003",
    date: "2024-01-14",
    product: "Keyboard Mechanical RGB",
    sku: "KEY-004",
    quantity: 50,
    unitPrice: 750000,
    totalValue: 37500000,
    supplier: "Gaming Store Indonesia",
    supplierCode: "SUP-003",
    status: "processing",
    receivedBy: "-",
    notes: "Sedang dalam proses quality control",
    purchaseOrder: "PO-2024-003",
  },
  {
    id: "IN-2024-004",
    date: "2024-01-13",
    product: "Mouse Wireless Logitech",
    sku: "MSE-005",
    quantity: 100,
    unitPrice: 350000,
    totalValue: 35000000,
    supplier: "Logitech Indonesia",
    supplierCode: "SUP-004",
    status: "completed",
    receivedBy: "Jane Smith",
    notes: "Semua unit telah diverifikasi",
    purchaseOrder: "PO-2024-004",
  },
];

const statusOptions = [
  "All",
  "completed",
  "processing",
  "in_transit",
  "cancelled",
];

export default function IncomingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Selesai</Badge>;
      case "processing":
        return <Badge variant="secondary">Proses</Badge>;
      case "in_transit":
        return <Badge variant="outline">Dalam Perjalanan</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredSupplies = incomingSupplies.filter((supply) => {
    const matchesSearch =
      supply.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || supply.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalValue = filteredSupplies.reduce(
    (acc, supply) => acc + supply.totalValue,
    0,
  );
  const completedCount = filteredSupplies.filter(
    (supply) => supply.status === "completed",
  ).length;
  const pendingCount = filteredSupplies.filter(
    (supply) =>
      supply.status === "processing" || supply.status === "in_transit",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barang Masuk</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau supply yang masuk ke inventori
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Supply Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSupplies.length}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Total pembelian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {completedCount}
            </div>
            <p className="text-xs text-muted-foreground">Sudah diterima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Truck className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">Dalam proses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan ID, produk, atau supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua Status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="processing">Proses</SelectItem>
                <SelectItem value="in_transit">Dalam Perjalanan</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Supply Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang Masuk</CardTitle>
          <CardDescription>
            Menampilkan {filteredSupplies.length} dari {incomingSupplies.length}{" "}
            transaksi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.map((supply) => (
                <TableRow key={supply.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{supply.id}</p>
                      <p className="text-sm text-muted-foreground">
                        PO: {supply.purchaseOrder}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(supply.date)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{supply.product}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {supply.sku}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{supply.supplier}</p>
                      <p className="text-sm text-muted-foreground">
                        {supply.supplierCode}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{supply.quantity}</p>
                      <p className="text-sm text-muted-foreground">
                        @ {formatIDR(supply.unitPrice)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatIDR(supply.totalValue)}</TableCell>
                  <TableCell>{getStatusBadge(supply.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
