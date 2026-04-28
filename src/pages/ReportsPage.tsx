import React, { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("all");
  const [period, setPeriod] = useState("monthly");

  // Mock data for reports
  const availableReports = [
    {
      id: 1,
      title: "Laporan Stok Barang",
      description: "Overview lengkap inventori dan pergerakan stok",
      type: "inventory",
      lastGenerated: "2024-01-15",
      format: "PDF, Excel",
      status: "ready",
    },
    {
      id: 2,
      title: "Laporan Keuangan Bulanan",
      description: "Pemasukan, pengeluaran, dan profit loss statement",
      type: "financial",
      lastGenerated: "2024-01-14",
      format: "PDF, Excel",
      status: "ready",
    },
    {
      id: 3,
      title: "Laporan Penjualan",
      description: "Analisis penjualan dan performa produk",
      type: "sales",
      lastGenerated: "2024-01-13",
      format: "PDF, Excel",
      status: "ready",
    },
    {
      id: 4,
      title: "Laporan Supplier",
      description: "Evaluasi performa supplier dan purchase order",
      type: "supplier",
      lastGenerated: "2024-01-12",
      format: "PDF, Excel",
      status: "generating",
    },
    {
      id: 5,
      title: "Laporan User Activity",
      description: "Log aktivitas pengguna dan sistem",
      type: "activity",
      lastGenerated: "2024-01-10",
      format: "Excel, CSV",
      status: "ready",
    },
  ];

  const getTypeBadge = (type: string) => {
    const variants = {
      inventory: "default",
      financial: "secondary",
      sales: "outline",
      supplier: "secondary",
      activity: "outline",
    };
    const labels = {
      inventory: "Inventori",
      financial: "Keuangan",
      sales: "Penjualan",
      supplier: "Supplier",
      activity: "Aktivitas",
    };
    return (
      <Badge variant={variants[type as keyof typeof variants] as any}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: "default",
      generating: "secondary",
      error: "destructive",
    };
    const labels = {
      ready: "Siap",
      generating: "Generating...",
      error: "Error",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredReports = availableReports.filter((report) => {
    if (reportType === "all") return true;
    return report.type === reportType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground">
            Generate dan download laporan bisnis
          </p>
        </div>
        <Button className="w-fit">
          <FileText className="mr-2 h-4 w-4" />
          Generate Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reports Generated
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Popular Report
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Financial</div>
            <p className="text-xs text-muted-foreground">Most downloaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Jenis Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Laporan</SelectItem>
                <SelectItem value="inventory">Inventori</SelectItem>
                <SelectItem value="financial">Keuangan</SelectItem>
                <SelectItem value="sales">Penjualan</SelectItem>
                <SelectItem value="supplier">Vendor</SelectItem>
                <SelectItem value="activity">Aktivitas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="quarterly">Kuartalan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange className="w-full md:w-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-2 md:space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    {getTypeBadge(report.type)}
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Last generated:{" "}
                      {new Date(report.lastGenerated).toLocaleDateString(
                        "id-ID",
                      )}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span>Format: {report.format}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    disabled={report.status === "generating"}
                    className="min-w-[100px]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {report.status === "generating"
                      ? "Generating..."
                      : "Download"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Export Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export data stok barang dalam format CSV atau Excel
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analisis mendalam performa penjualan dan trend
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ringkasan keuangan dengan profit & loss statement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
