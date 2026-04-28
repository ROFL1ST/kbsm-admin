"use client";

import { useLocation } from "react-router-dom";
import PurchaseOrderClientDetail from "@/components/ui/PurchaseOrderClientOrderDetail";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  History,
  AlertCircle,
  CheckCircle,
  Package,
  ArrowBigLeft,
  Receipt,
  Clock,
} from "lucide-react";
import {
  PurchaseOrderClientCollectionFormState,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { formatDate } from "date-fns";
import { formatIDR } from "@/components/format/IDR";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";

export default function PurchaseOrderClientCollectionDetail() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    createPurchaseOrderCollections,
    getPurchaseOrderCollections,
    deletePurchaseOrderCollections,
    updatePurchaseOrderCollections,
    isLoading,
  } = usePurchaseOrderClients();

  const [form, setForm] = useState<PurchaseOrderClientCollectionFormState>({
    purchase_order_client_id: location?.state || null,
    purchase_order_collection_client_id: undefined,
    payment_type: "TRANSFER",
    transaction_code: "COLLECTION",
    price: null,
    path: null,
  });

  const [data, setData] = useState({ type: 0 });
  const [collections, setCollections] = useState([]);
  const [invoiceInfo, setHeader] = useState({
    total: 0,
    paid: 0,
    status_trx_code: null,
    status: null,
  });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [showCollection, setShowCollection] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const handleInputChange = useCallback(
    (field: keyof PurchaseOrderClientCollectionFormState, value: any) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validasi tipe file
        if (!file.type.startsWith("image/")) {
          alert("Harap upload file gambar");
          return;
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Ukuran file maksimal 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          handleInputChange("path", result);
        };
        reader.readAsDataURL(file);
      }
    },
    [handleInputChange]
  );
  const handleDownloadPhoto = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "bukti-transfer.jpg";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemovePhoto = useCallback(() => {
    handleInputChange("path", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleInputChange]);

  const handleCreate = useCallback(async () => {
    setIsEditMode(false);
    const payload = {
      ...form,
      purchase_order_client_id: location?.state,
    };

    const response = await createPurchaseOrderCollections(payload);
    if (response.status) {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil disimpan",
      });
      resetForm();
      handleFetch();
    } else {
      toast({
        title: "Gagal",
        description: response.messages || "Gagal menyimpan tagihan",
        variant: "destructive",
      });
    }
  }, [form, location?.state, createPurchaseOrderCollections, toast]);

  const handleUpdate = useCallback(async () => {
    const response = await updatePurchaseOrderCollections(form);
    if (response.status) {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil diperbarui",
      });
      resetForm();
      handleFetch();
    } else {
      toast({
        title: "Gagal",
        description: response.messages || "Gagal memperbarui tagihan",
        variant: "destructive",
      });
    }
  }, [form, updatePurchaseOrderCollections, toast]);

  const handleFetch = useCallback(async () => {
    const response = await getPurchaseOrderCollections({
      purchase_order_client_id: location.state,
    });
    setCollections(response?.data?.data);
    setHeader(response?.data?.header);
  }, [location.state, getPurchaseOrderCollections]);

  const handleEditHistory = useCallback(
    (item) => {
      // Cek jika type === 2, maka tidak bisa edit
      if (item?.type === 2) {
        toast({
          title: "Akses Ditolak",
          description: "Tagihan dengan status Disetujui tidak dapat diedit",
          variant: "destructive",
        });
        return;
      }

      setForm({
        purchase_order_client_id: location?.state,
        purchase_order_collection_client_id: item.id,
        payment_type: item.payment_type,
        price: item.price,
        path: item.path,
        transaction_code: item.transaction_code,
      });
      setData({ type: item?.type });
      setIsEditMode(true);
      setShowHistoryDetail(false);
    },
    [location?.state, toast]
  );

  const handleDeleteHistory = useCallback(
    async (id, type) => {
      // Cek jika type === 2, maka tidak bisa delete
      if (type === 2) {
        toast({
          title: "Akses Ditolak",
          description: "Tagihan dengan status Disetujui tidak dapat dihapus",
          variant: "destructive",
        });
        return;
      }

      const response = await deletePurchaseOrderCollections({
        purchase_order_collection_client_id: id,
      });
      if (response.status) {
        toast({
          title: "Berhasil",
          description: "History berhasil dihapus",
        });
        handleFetch();
      } else {
        toast({
          title: "Gagal",
          description: response.messages || "Gagal menghapus history",
          variant: "destructive",
        });
      }
    },
    [deletePurchaseOrderCollections, handleFetch, toast]
  );

  const resetForm = useCallback(() => {
    setForm({
      purchase_order_client_id: location?.state,
      purchase_order_collection_client_id: undefined,
      price: null,
      payment_type: "TRANSFER",
      path: null,
      transaction_code: "COLLECTION",
    });
    setIsEditMode(false);
    setData({ type: 0 });
    setSelectedHistory(null);
    setShowHistoryDetail(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [location?.state]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

  const getStatusBadge = useMemo(
    () => (status: string, color: BadgeVariant) => {
      return <Badge variant={color}>{status}</Badge>;
    },
    []
  );

  const remainingBalance = useMemo(() => {
    return invoiceInfo.total - invoiceInfo.paid;
  }, [invoiceInfo.total, invoiceInfo.paid]);

  const paymentProgress = useMemo(() => {
    if (invoiceInfo.total === 0) return 0;
    const progress = (invoiceInfo.paid / invoiceInfo.total) * 100;
    return progress >= 100 ? 100 : progress;
  }, [invoiceInfo.total, invoiceInfo.paid]);

  const progressBarWidth = useMemo(() => {
    return `${paymentProgress}%`;
  }, [paymentProgress]);

  const formatPrice = useCallback((price: number) => {
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {showHistoryDetail
              ? "Detail History Tagihan"
              : "Tagihan Pesanan Klien"}
          </h1>
          <p className="text-muted-foreground">
            {showHistoryDetail
              ? "Detail lengkap history tagihan"
              : "Tagihan Pesanan Klien"}
          </p>
        </div>

        <Button
          onClick={() => setShowCollection(!showCollection)}
          className="flex items-center gap-2"
        >
          {showCollection ? (
            <>
              <Package className="w-4 h-4" />
              Lihat Detail Pesanan
            </>
          ) : (
            <>
              <ArrowBigLeft className="w-4 h-4" />
              Kembali Ke Tagihan
            </>
          )}
        </Button>
      </div>

      {!showCollection && (
        <PurchaseOrderClientDetail purchase_order_client_id={location?.state} />
      )}

      {showCollection && (
        <>
          {/* Informasi Status Tagihan */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  {invoiceInfo.status_trx_code === "PENDING" ? (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">Status Pembayaran</h3>
                    <p
                      className={`text-sm font-medium ${
                        invoiceInfo.status_trx_code === "PENDING"
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {invoiceInfo.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Tagihan
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {formatIDR(invoiceInfo.total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sudah Dibayar
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatIDR(invoiceInfo.paid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sisa Tagihan
                    </p>
                    <p className="text-lg font-bold text-amber-600">
                      {formatIDR(remainingBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress Pembayaran</span>
                  <span>{Math.round(paymentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: progressBarWidth }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Section */}
          {!showHistoryDetail && (
            <section className="mt-6 bg-white dark:bg-zinc-900 border border-primary/30 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold text-primary">
                  History Tagihan
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Daftar histori tagihan pesanan klien
              </p>

              {/* List History */}
              <div className="space-y-4">
                {collections && collections.length > 0 ? (
                  collections.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-300 rounded-xl p-4 md:p-5"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header dengan ID dan Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-primary group-hover:text-primary/90">
                                {item.transaction_code === "COLLECTION"
                                  ? "Tagihan"
                                  : "Refund"}{" "}
                                #{item.id}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(
                                  String(item.created_at),
                                  "dd MMM yyyy, HH:mm"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="px-3 py-1.5 rounded-full text-sm font-medium">
                            {item?.type === 0
                              ? getStatusBadge("Menunggu Verifikasi", "yellow")
                              : item?.type === 1
                              ? getStatusBadge("Ditolak", "destructive")
                              : getStatusBadge("Disetujui", "green")}
                          </div>
                        </div>

                        {/* Informasi Detail */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg border">
                          {/* Harga */}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Total Harga
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {/* Tanggal Pembuatan */}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Dibuat Pada
                            </p>
                            <p className="text-base font-medium text-foreground">
                              {formatDate(
                                String(item.created_at),
                                "dd MMM yyyy"
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(String(item.created_at), "HH:mm")}
                            </p>
                          </div>

                          {/* Tipe Pembayaran */}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Tipe Pembayaran
                            </p>
                            <p className="text-base font-medium text-foreground">
                              {item.payment_type === "TRANSFER"
                                ? "Transfer"
                                : "Tunai"}
                            </p>
                          </div>

                          {/* Bukti Pembayaran */}
                          <div className="space-y-1">
                            <Button
                              type="button"
                              onClick={() => handleDownloadPhoto(item.path)}
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Lihat Bukti Pembayaran
                            </Button>
                          </div>

                          {/* Informasi Callback jika type = 1 */}
                          {item?.type === 1 && (
                            <div className="space-y-1 lg:col-span-3">
                              <p className="text-sm text-muted-foreground">
                                Alasan Penolakan :
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-red-600 font-medium text-sm">
                                  {item?.finance_callback_reason}
                                </span>
                                {item?.finance_callback_at && (
                                  <span className="text-xs text-muted-foreground">
                                    (
                                    {formatDate(
                                      String(item.finance_callback_at),
                                      "dd/MM/yy HH:mm"
                                    )}
                                    )
                                  </span>
                                )}
                                {item?.finance_callback_by && (
                                  <span className="text-xs text-muted-foreground">
                                    oleh {item.finance_callback_by}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row justify-between items-center pt-2 border-t border-primary/10">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Terakhir diupdate:{" "}
                              {formatDate(
                                String(item.created_at),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Tombol Edit - Disabled jika type = 2 */}
                            <Button
                              onClick={() => handleEditHistory(item)}
                              variant="outline"
                              size="sm"
                              className="h-9 gap-2"
                              disabled={item?.type === 2}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                {item?.type === 2 ? "Tidak Dapat Edit" : "Edit"}
                              </span>
                            </Button>

                            {/* Tombol Hapus */}
                            <ConfirmModal
                              title="Hapus Tagihan"
                              description={`
                                <div className="space-y-2">
                                  <p>Apakah kamu yakin ingin menghapus tagihan <strong>#{item.id}</strong>?</p>
                                  <p className="text-sm text-muted-foreground">
                                    Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus permanen.
                                  </p>
                                </div>
                              `}
                              confirmText="Hapus"
                              cancelText="Batal"
                              variant="destructive"
                              showIcon={true}
                              useHTML={true}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={item?.type === 2}
                                  className="h-9 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    {item?.type === 2
                                      ? "Tidak Dapat Hapus"
                                      : "Hapus"}
                                  </span>
                                </Button>
                              }
                              onConfirm={() =>
                                handleDeleteHistory(item.id, item?.type)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        Tidak ada history tagihan
                      </h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Belum ada riwayat tagihan yang tercatat. Tagihan yang
                        dibuat akan muncul di sini.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Detail History */}
          {showHistoryDetail && selectedHistory && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Detail Tagihan #{selectedHistory.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Harga</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      <p className="text-lg font-semibold">
                        {formatPrice(selectedHistory.price)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Dibuat</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      <p>
                        {formatDate(
                          String(selectedHistory.created_at),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Bukti Transfer</Label>
                    {selectedHistory.path ? (
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 border rounded-md overflow-hidden">
                          <img
                            src={selectedHistory.path}
                            alt="Bukti Transfer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = selectedHistory.path;
                            link.download = `bukti-transfer-${selectedHistory.id}.jpg`;
                            link.click();
                          }}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Bukti Transfer
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                        Tidak ada bukti transfer
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Tagihan */}
          {!showHistoryDetail && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <Edit className="w-5 h-5" />
                        Edit Tagihan
                      </>
                    ) : (
                      "Buat Tagihan Baru"
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Field Harga */}
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Harga <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price || ""}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        placeholder="Masukkan harga"
                        className="w-full"
                        disabled={isEditMode && data?.type === 2}
                      />
                    </div>

                    {/* Field Tipe Pembayaran */}
                    <div className="space-y-2">
                      <Label>Tipe Pembayaran</Label>
                      <Select
                        value={form.payment_type}
                        onValueChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            payment_type: val,
                          }))
                        }
                        disabled={isEditMode && data?.type === 2}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRANSFER">TRANSFER</SelectItem>
                          <SelectItem value="TUNAI">TUNAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Field Tipe Tagihan */}
                    <div className="space-y-2">
                      <Label>Tipe Tagihan</Label>
                      <Select
                        value={form.transaction_code}
                        onValueChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            transaction_code: val,
                          }))
                        }
                        disabled={isEditMode && data?.type === 2}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tipe Tagihan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COLLECTION">PEMBELIAN</SelectItem>
                          <SelectItem value="REFUND">REFUND</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Field Bukti Transfer */}
                    <div className="space-y-2">
                      <Label htmlFor="bukti-transfer">
                        Bukti Transfer <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-4">
                        {form?.path && (
                          <div className="w-20 h-20 border rounded-md overflow-hidden">
                            <img
                              src={form?.path as string}
                              alt="Bukti Transfer Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="bukti-transfer"
                            disabled={isEditMode && data?.type === 2}
                          />

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={handleUploadClick}
                              className="flex items-center gap-2"
                              disabled={isEditMode && data?.type === 2}
                            >
                              <Upload className="w-4 h-4" />
                              {form?.path ? "Ganti Foto" : "Upload Foto"}
                            </Button>

                            {form?.path && (
                              <Button
                                variant="secondary"
                                type="button"
                                onClick={() => handleDownloadPhoto(form?.path)}
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Lihat Foto
                              </Button>
                            )}
                          </div>

                          {form?.path && !(isEditMode && data?.type === 2) && (
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={handleRemovePhoto}
                              size="sm"
                            >
                              Hapus Foto
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Format: JPG, PNG, JPEG (Maks. 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Tombol Submit */}
                  <div className="flex justify-end gap-2 pt-4">
                    {isEditMode && (
                      <Button variant="outline" onClick={resetForm}>
                        Batal
                      </Button>
                    )}
                    <Button
                      onClick={isEditMode ? handleUpdate : handleCreate}
                      disabled={
                        !form.price ||
                        !form.path ||
                        (isEditMode && data?.type === 2)
                      }
                    >
                      {isEditMode ? "Update Tagihan" : "Simpan Tagihan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
