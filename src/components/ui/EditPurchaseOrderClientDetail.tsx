"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Banknote,
  Calendar,
  Package,
  Truck,
  Clock,
  CreditCard,
  MapPin,
  ChevronRight,
  ShoppingBag,
  Receipt,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PurchaseOrderProductDetail,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";

// ==================== TYPES ====================
interface Product {
  id: number;
  product_name: string;
  code: string;
  unit_code: string;
  quantity: number;
  price: number;
  total: number;
  discount_percentage: number;
  discount_amount: number;
  final_total: number;
  ppn_percentage: number;
  ppn_amount: number;
}

interface PurchaseOrderData {
  id: string;
  name: string;
  purchase_order_client_code: string;
  progress_type_code: string;
  payment_method_code: string;
  payment_type: string;
  input_date: string;
  ongkir: number;
  final_total: number;
  type: string;
  type_badge: string;
  status_trx: string;
  status_trx_badge: string;
  products: Product[];
  refund: { total_refund: number };
}

// ==================== HELPER FUNCTIONS ====================
const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusColor = (badgeType: string) => {
  const colors: Record<string, string> = {
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[badgeType] || colors.yellow;
};

// ==================== MOBILE PRODUCT CARD ====================
const MobileProductCard = ({
  product,
  index,
}: {
  product: PurchaseOrderProductDetail;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              #{index + 1}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {product.unit_code}
            </Badge>
          </div>
          <h3 className="font-semibold text-base">{product.product_name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {product.unit_code}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{formatIDR(product.price)}</p>
          <p className="text-xs text-muted-foreground">x{product.quantity}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Detail Produk</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Harga Satuan</span>
            <span>{formatIDR(product.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span>
              {product.quantity} {product.unit_code}
            </span>
          </div>
          {product.discount_percentage > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Diskon</span>
              <span>
                {product.discount_percentage}% (
                {formatIDR(product.discount_amount)})
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Sub Total</span>
            <span>{formatIDR(product.price * product.quantity)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== DESKTOP PRODUCT TABLE ====================
const DesktopProductTable = ({
  products,
}: {
  products: PurchaseOrderProductDetail[];
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">No</th>
              <th className="text-left p-3 font-medium">Kode Produk</th>
              <th className="text-left p-3 font-medium">Nama Produk</th>
              <th className="text-center p-3 font-medium">Quantity</th>
              <th className="text-center p-3 font-medium">Unit</th>
              <th className="text-right p-3 font-medium">Harga</th>
              <th className="text-right p-3 font-medium">Diskon</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product, index) => (
              <tr
                key={product.id}
                className="border-t hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 font-medium">{index + 1}</td>
                <td className="p-3 font-mono text-xs">{product.unit_code}</td>
                <td className="p-3 font-medium">{product.product_name}</td>
                <td className="p-3 text-center">{product.quantity}</td>
                <td className="p-3 text-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.unit_code}
                  </Badge>
                </td>
                <td className="p-3 text-right">{formatIDR(product.price)}</td>
                <td className="p-3 text-right">
                  {product.discount_percentage > 0 ? (
                    <span className="text-red-600 text-sm">
                      {product.discount_percentage}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3 text-right font-semibold">
                  {formatIDR(product.price * product.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== INFO CARD (Mobile/Desktop Responsive) ====================
const InfoCard = ({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// ==================== MAIN COMPONENT ====================
export default function GetDetailPurchaseOrderClient({
  purchase_order_client_id,
}: {
  purchase_order_client_id?: string;
}) {
  const {
    detailPurchaseOrderClient,
    handleDetailPurchaseOrderClient,
    isLoading: contextLoading,
  } = usePurchaseOrderClients();

  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine loading states
  const isLoading = loading || contextLoading;

  // Fetch data on component mount or when ID changes
  const fetchData = async () => {
    if (!purchase_order_client_id) {
      setError("ID Purchase Order tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching detail for ID:", purchase_order_client_id);

      await handleDetailPurchaseOrderClient({
        purchase_order_client_id: purchase_order_client_id,
      });

      console.log("Data fetched successfully");
    } catch (err) {
      console.error("Error fetching detail:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [purchase_order_client_id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2">Gagal Memuat Data</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!detailPurchaseOrderClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Safely calculate totals with null checks
  const totalItems =
    detailPurchaseOrderClient?.products?.reduce(
      (sum, product) => sum + (product?.quantity || 0),
      0,
    ) || 0;

  const subtotal =
    detailPurchaseOrderClient?.products?.reduce(
      (sum, product) => sum + (product?.total || 0),
      0,
    ) || 0;

  const totalDiscount =
    detailPurchaseOrderClient?.products?.reduce(
      (sum, product) => sum + (product?.discount_amount || 0),
      0,
    ) || 0;

  const totalPpn =
    detailPurchaseOrderClient?.products?.reduce(
      (sum, product) => sum + (product?.ppn_amount || 0),
      0,
    ) || 0;

  const grandTotal = detailPurchaseOrderClient?.refund?.total_refund
    ? (detailPurchaseOrderClient.final_total || 0) -
      (detailPurchaseOrderClient.refund.total_refund || 0)
    : detailPurchaseOrderClient?.final_total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Mobile Header with Menu */}
      <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Detail Order</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {detailPurchaseOrderClient?.purchase_order_client_code || "-"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${showMobileMenu ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {showMobileMenu && (
          <div className="px-4 pb-3 space-y-2 border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge
                className={getStatusColor(
                  detailPurchaseOrderClient?.type_badge,
                )}
              >
                {detailPurchaseOrderClient?.type || "-"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tanggal</span>
              <span>{formatDate(detailPurchaseOrderClient?.input_date)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">
                {formatIDR(grandTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8 max-w-7xl">
        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Detail Purchase Order</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground font-mono text-sm">
                  {detailPurchaseOrderClient?.purchase_order_client_code || "-"}
                </p>
                <Badge
                  className={getStatusColor(
                    detailPurchaseOrderClient?.type_badge,
                  )}
                >
                  {detailPurchaseOrderClient?.type || "-"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:gap-6">
          {/* Client Info - Responsive Grid */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                Informasi Klien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <Avatar className="h-12 w-12 lg:h-14 lg:w-14">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${detailPurchaseOrderClient?.name || "Client"}&background=0D9488&color=fff`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {detailPurchaseOrderClient?.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-lg lg:text-xl">
                      {detailPurchaseOrderClient?.name || "-"}
                    </h4>
                    <Badge
                      className={getStatusColor(
                        detailPurchaseOrderClient?.status_trx_badge,
                      )}
                    >
                      {detailPurchaseOrderClient?.status_trx || "-"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{detailPurchaseOrderClient?.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{detailPurchaseOrderClient?.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{detailPurchaseOrderClient?.payment_type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Grid for Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard title="Ringkasan Pesanan" icon={ShoppingBag}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Item</span>
                  <span className="font-semibold">{totalItems} produk</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="font-semibold">
                    {formatIDR(detailPurchaseOrderClient?.ongkir || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tanggal Order</span>
                  <span className="text-sm">
                    {formatDate(detailPurchaseOrderClient?.input_date)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Tagihan</span>
                    <span className="text-base lg:text-lg font-bold text-primary">
                      {formatIDR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* <InfoCard title="Metode Pembayaran" icon={Banknote}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Metode</span>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="font-medium">{"Transfer Bank"}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{"BCA"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No. Rekening</span>
                  <span className="font-mono text-sm">{"1234567890"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">A/N</span>
                  <span className="font-medium">{"PT. Hilman Kuy"}</span>
                </div>
              </div>
            </InfoCard> */}
          </div>

          {/* Products Section - Responsive */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Receipt className="h-4 w-4 lg:h-5 lg:w-5" />
                Daftar Produk
                <Badge variant="secondary" className="ml-2">
                  {detailPurchaseOrderClient?.products?.length || 0} item
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="lg:hidden space-y-3">
                {detailPurchaseOrderClient?.products?.map((product, index) => (
                  <MobileProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block">
                <DesktopProductTable
                  products={detailPurchaseOrderClient?.products || []}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary - Responsive */}
          <Card className="hover:shadow-md transition-shadow lg:sticky lg:top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">
                Ringkasan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Subtotal Produk
                    </span>
                    <span className="font-medium">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Total Diskon
                    </span>
                    <span className="font-medium text-red-600">
                      - {formatIDR(totalDiscount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      PPN (11%)
                    </span>
                    <span className="font-medium">{formatIDR(totalPpn)}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Ongkos Kirim
                    </span>
                    <span className="font-medium">
                      {formatIDR(detailPurchaseOrderClient?.ongkir || 0)}
                    </span>
                  </div>
                  {detailPurchaseOrderClient?.refund?.total_refund > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        Refund
                      </span>
                      <span className="font-medium text-red-600">
                        -{" "}
                        {formatIDR(
                          detailPurchaseOrderClient.refund.total_refund,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-base lg:text-lg font-bold">
                      Grand Total
                    </span>
                    <span className="text-xl lg:text-2xl font-bold text-primary">
                      {formatIDR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="mt-4 flex gap-2 lg:hidden">
                <Button className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Konfirmasi Pembayaran
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Detail</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Truck className="h-5 w-5" />
            <span className="text-xs mt-1">Pengiriman</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Banknote className="h-5 w-5" />
            <span className="text-xs mt-1">Bayar</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Receipt className="h-5 w-5" />
            <span className="text-xs mt-1">Invoice</span>
          </Button>
        </div>
      </div>

      {/* Padding bottom for mobile to account for bottom nav */}
      <div className="lg:hidden h-16"></div>
    </div>
  );
}
