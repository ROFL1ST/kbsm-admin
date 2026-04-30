// app/components/ShippingInfoCard.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  MapPin,
  Phone,
  User,
  Package,
  Clock,
  Hash,
  FileText,
  Calendar,
  Barcode,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

// ==================== TYPES ====================
export interface ShippingData {
  id: number;
  purchase_order_client_id: string;
  delivery: string;
  ongkir: number;
  code: string;
  service: string;
  description: string;
  etd: string;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  address: string;
  label: string;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  resi: string | null;
}

interface ShippingInfoCardProps {
  shipping: ShippingData | null | undefined;
  onCopyResi?: (resi: string) => void;
  onTrackPackage?: (resi: string, courierCode: string) => void;
  className?: string;
}

// ==================== HELPER FUNCTIONS ====================
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
};

const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDeliveryStatusColor = (delivery: string): string => {
  const statusColors: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    shipping:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
    delivered:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    cancelled:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    statusColors[delivery?.toLowerCase()] ||
    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
  );
};

const getDeliveryStatusLabel = (delivery: string): string => {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    processing: "Diproses",
    shipping: "Dikirim",
    delivered: "Diterima",
    cancelled: "Dibatalkan",
  };
  return labels[delivery?.toLowerCase()] || delivery || "-";
};

// ==================== INFO ROW COMPONENT ====================
const InfoRow = ({
  label,
  value,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: any;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {Icon && (
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-medium break-words">{value || "-"}</span>
    </div>
  </div>
);

// ==================== EMPTY STATE COMPONENT ====================
const EmptyShippingState = () => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="py-8">
      <div className="text-center">
        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Informasi pengiriman belum tersedia
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Data shipping akan muncul setelah pesanan diproses
        </p>
      </div>
    </CardContent>
  </Card>
);

// ==================== MAIN COMPONENT ====================
export default function ShippingInfoCard({
  shipping,
  onCopyResi,
  onTrackPackage,
  className = "",
}: ShippingInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!shipping) {
    return <EmptyShippingState />;
  }

  const handleCopyResi = () => {
    if (shipping.resi) {
      navigator.clipboard.writeText(shipping.resi);
      setCopied(true);
      onCopyResi?.(shipping.resi);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackPackage = () => {
    if (shipping.resi) {
      onTrackPackage?.(shipping.resi, shipping.code);
    }
  };

  const fullAddress = [
    shipping.address,
    shipping.subdistrict_name,
    shipping.district_name,
    shipping.city_name,
    shipping.province_name,
    shipping.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const hasResi = !!shipping.resi;

  return (
    <Card
      className={`hover:shadow-md transition-shadow overflow-hidden ${className}`}
    >
      {/* Header dengan status */}
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base lg:text-lg flex items-center gap-2">
            <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
            Informasi Pengiriman
          </CardTitle>
          <Badge className={getDeliveryStatusColor(shipping.delivery)}>
            {getDeliveryStatusLabel(shipping.delivery)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Ringkasan Cepat - Selalu Tampil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Kurir</p>
              <p className="text-sm font-semibold uppercase">
                {shipping.code} - {shipping.service}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Estimasi Tiba</p>
              <p className="text-sm font-medium">{shipping.etd || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Ongkos Kirim</p>
              <p className="text-sm font-semibold text-orange-600">
                {formatIDR(shipping.ongkir)}
              </p>
            </div>
          </div>
          {hasResi && (
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">No. Resi</p>
                <p className="text-sm font-mono font-medium">{shipping.resi}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tombol Expand untuk Mobile */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="lg:hidden w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 py-2 px-3 bg-muted/30 rounded-lg"
        >
          <span>Detail Pengiriman</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Detail Lengkap (Collapsible di Mobile) */}
        <div className={`${expanded ? "block" : "hidden lg:block"} space-y-4`}>
          {/* Grid 2 kolom untuk detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Kolom Kiri - Info Kurir */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Detail Kurir
              </h4>
              <InfoRow label="Kode Kurir" value={shipping.code} icon={Hash} />
              <InfoRow
                label="Layanan"
                value={shipping.service}
                icon={Package}
              />
              <InfoRow
                label="Estimasi Tiba (ETD)"
                value={shipping.etd || "-"}
                icon={Clock}
              />
              <InfoRow
                label="Deskripsi"
                value={shipping.description || "-"}
                icon={FileText}
              />

              {hasResi && (
                <div className="pt-2 border-t mt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        No. Resi:
                      </span>
                      <span className="text-sm font-mono font-medium">
                        {shipping.resi}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={handleCopyResi}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
                            <span className="text-xs">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Salin</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={handleTrackPackage}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Lacak</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kolom Kanan - Info Penerima */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Penerima
              </h4>
              <InfoRow
                label="Nama Penerima"
                value={shipping.receiver_name}
                icon={User}
              />
              <InfoRow
                label="Nomor Telepon"
                value={shipping.phone_number}
                icon={Phone}
              />
              <InfoRow
                label="Alamat Lengkap"
                value={fullAddress}
                icon={MapPin}
              />

              {/* Grid alamat detail */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                <InfoRow label="Provinsi" value={shipping.province_name} />
                <InfoRow label="Kota/Kabupaten" value={shipping.city_name} />
                <InfoRow label="Kecamatan" value={shipping.district_name} />
                <InfoRow label="Kelurahan" value={shipping.subdistrict_name} />
                <InfoRow label="Kode Pos" value={shipping.postal_code} />
              </div>
            </div>
          </div>

          {/* Label Default */}
          {shipping.is_default && (
            <div className="flex justify-start">
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Alamat Default
              </Badge>
            </div>
          )}

          {/* Metadata - Info Audit */}
          <div className="text-xs text-muted-foreground border-t pt-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Dibuat: {formatDate(shipping.created_at)}</span>
              {shipping.created_by && (
                <span className="text-muted-foreground/70">
                  oleh {shipping.created_by}
                </span>
              )}
            </div>
            {shipping.updated_at &&
              shipping.updated_at !== shipping.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Diperbarui: {formatDate(shipping.updated_at)}</span>
                  {shipping.updated_by && (
                    <span className="text-muted-foreground/70">
                      oleh {shipping.updated_by}
                    </span>
                  )}
                </div>
              )}
          </div>

          {/* Warning jika tidak ada resi */}
          {!hasResi && shipping.delivery?.toLowerCase() === "shipping" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Nomor resi belum tersedia. Status akan diperbarui secara
                otomatis.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
