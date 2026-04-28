"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
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
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  PurchaseOrderClientCollectionFormState,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
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
import { FeedBackOrderVendorModal } from "./FeedbackOrderVendor";
import { FeedbackOrderCollectionModal } from "./FeedbackOrderCollection";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { useAuth } from "@/contexts/Auth.Context";

interface CollectionFormProps {
  form: any;
  isEditMode: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onVerificationOpen: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoUpload: (file: File) => void;
  onDownloadPhoto: () => void;
}
interface HistoryItemProps {
  item: any; // or a specific type for the item property
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  isFinance: boolean;
}
// Komponen memoized untuk item history
const HistoryItem = memo(
  ({ item, onEdit, onDelete, onView, isFinance }: HistoryItemProps) => {
    const getStatusBadge = (type: number) => {
      switch (type) {
        case 0:
          return <Badge variant="yellow">Menunggu Verifikasi</Badge>;
        case 1:
          return <Badge variant="destructive">Ditolak</Badge>;
        case 2:
          return <Badge variant="green">Disetujui</Badge>;
        default:
          return <Badge variant="outline">Unknown</Badge>;
      }
    };
    const handleDownloadPhoto = useCallback(() => {
      if (item.path) {
        const link = document.createElement("a");
        link.href = item.path as string;
        link.download = "bukti-transfer.jpg";
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, [item.path]);

    return (
      <div className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-300 rounded-xl p-4 md:p-5">
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
                  {formatDate(String(item.created_at), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="px-3 py-1.5 rounded-full text-sm font-medium">
              {getStatusBadge(item?.type)}
            </div>
          </div>

          {/* Informasi Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg border">
            {/* Harga */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Harga</p>
              <p className="text-lg font-bold text-foreground">
                Rp {Number(item.price).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Tanggal Pembuatan */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dibuat Pada</p>
              <p className="text-base font-medium text-foreground">
                {formatDate(String(item.created_at), "dd MMM yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(String(item.created_at), "HH:mm")}
              </p>
            </div>

            {/* Tipe Pembayaran */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tipe Pembayaran</p>
              <p className="text-base font-medium text-foreground">
                {item.payment_type === "TRANSFER" ? "Transfer" : "Tunai"}
              </p>
            </div>
            {/* Bukti Pembayaran */}
            <div className="space-y-1">
              <Button
                type="button"
                onClick={handleDownloadPhoto}
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
                  String(item.updated_at || item.created_at),
                  "dd/MM/yyyy"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isFinance && (
                <>
                  {/* Tombol Edit */}
                  <Button
                    onClick={() => onEdit(item)}
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  {/* Tombol Hapus */}
                  <ConfirmModal
                    title="Hapus Tagihan"
                    description={`
                    <div className="space-y-2">
                      <p>Apakah kamu yakin ingin menghapus ${
                        item.transaction_code === "COLLECTION"
                          ? "Tagihan"
                          : "Refund"
                      } <strong> #${item.id}</strong>?</p>
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
                        className="h-9 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    }
                    onConfirm={() => onDelete(item.id)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HistoryItem.displayName = "HistoryItem";

// Komponen untuk form tagihan
const CollectionForm = memo(
  ({
    form,
    isEditMode,
    onInputChange,
    onReset,
    onVerificationOpen,
    fileInputRef,
    onPhotoUpload,
    onDownloadPhoto,
  }: CollectionFormProps) => {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit className="w-5 h-5" />
                  Detail Tagihan
                </>
              ) : (
                "Buat Tagihan Baru"
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Field Collection */}
              <div className="space-y-2">
                <Label htmlFor="created_by">Nama Penagih</Label>
                <Input
                  id="created_by"
                  type="text"
                  value={form.created_by || ""}
                  readOnly={true}
                  className="w-full"
                />
              </div>

              {/* Field Harga */}
              <div className="space-y-2">
                <Label htmlFor="price">Jumlah Bayar</Label>
                <Input
                  id="price"
                  value={formatIDR(form.price) || ""}
                  readOnly={true}
                  onChange={(e) => onInputChange("price", e.target.value)}
                  placeholder="Masukkan harga"
                  className="w-full"
                />
              </div>

              {/* Field Tipe Pembayaran */}
              <div className="space-y-2">
                <Label>Tipe Pembayaran</Label>
                <Select
                  value={form.payment_type}
                  disabled
                  onValueChange={(val) => onInputChange("payment_type", val)}
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
                      onChange={onPhotoUpload}
                      className="hidden"
                      id="bukti-transfer"
                    />

                    <div className="flex gap-2">
                      {form?.path && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={onDownloadPhoto}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Lihat Foto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Format: JPG, PNG, JPEG (Maks. 5MB)
                </p>
              </div>

              {/* Field Reason */}
              {form?.finance_callback_reason && (
                <div className="space-y-2">
                  <Label htmlFor="finance_callback_reason">
                    Alasan Penolakan
                  </Label>
                  <Input
                    id="finance_callback_reason"
                    type="text"
                    value={form.finance_callback_reason || ""}
                    readOnly={true}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Tombol Submit */}
            <div className="flex justify-end gap-2 pt-4">
              {isEditMode && (
                <Button variant="outline" onClick={onReset}>
                  Batal
                </Button>
              )}
              <Button onClick={onVerificationOpen}>Verifikasi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

CollectionForm.displayName = "CollectionForm";

// Komponen untuk detail history
const HistoryDetail = memo(({ selectedHistory, onBack }) => {
  return (
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
                Rp {Number(selectedHistory.price).toLocaleString("id-ID")}
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={onBack}>
            Kembali ke List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

HistoryDetail.displayName = "HistoryDetail";

// Komponen utama
export const HistoryCollectionClient = ({
  purchase_order_client_id,
}: {
  purchase_order_client_id?: string;
}) => {
  const { user } = useAuth();

  // Permission checks dengan useMemo
  const isFinance = useMemo(
    () => user?.responsibilities?.some((role) => role.code === "FINANCE"),
    [user]
  );

  const [isFeedBackOrderVendorModalOpen, setIsFeedBackOrderVendorModalOpen] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    createPurchaseOrderCollections,
    getPurchaseOrderCollections,
    deletePurchaseOrderCollections,
    updatePurchaseOrderCollections,
  } = usePurchaseOrderClients();

  // Form state dengan nilai default
  const [form, setForm] = useState(() => ({
    purchase_order_client_id: purchase_order_client_id || null,
    purchase_order_collection_client_id: undefined,
    payment_type: "TRANSFER",
    transaction_code: "COLLECTION",
    price: null,
    path: null,
    created_by: null,
    finance_callback_at: null,
    finance_callback_by: null,
    finance_callback_reason: null,
  }));

  const [collections, setCollections] = useState([]);
  const [invoiceInfo, setHeader] = useState({
    total: 0,
    paid: 0,
    status_trx_code: null,
    status: null,
  });

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  // Optimasi fetch data dengan useCallback
  const handleFetch = useCallback(async () => {
    if (!purchase_order_client_id) return;

    try {
      const response = await getPurchaseOrderCollections({
        purchase_order_client_id: purchase_order_client_id,
      });

      if (response?.data) {
        setCollections(response.data.data || []);
        setHeader(
          response.data.header || {
            total: 0,
            paid: 0,
            status_trx_code: null,
            status: null,
          }
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data tagihan",
        variant: "destructive",
      });
    }
  }, [purchase_order_client_id, getPurchaseOrderCollections, toast]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  // Format collections dengan useMemo
  const formattedCollections = useMemo(() => {
    return collections.map((item) => ({
      ...item,
      formattedDate: formatDate(String(item.created_at), "dd MMM yyyy, HH:mm"),
      formattedPrice: formatIDR(item.price),
    }));
  }, [collections]);

  // Progress bar calculation
  const progressPercentage = useMemo(() => {
    if (invoiceInfo.total === 0) return 0;
    const percentage = (invoiceInfo.paid / invoiceInfo.total) * 100;
    return Math.round(percentage);
  }, [invoiceInfo.paid, invoiceInfo.total]);

  // Sisa tagihan
  const remainingBalance = useMemo(() => {
    return invoiceInfo.total - invoiceInfo.paid > 0
      ? invoiceInfo.total - invoiceInfo.paid
      : 0;
  }, [invoiceInfo.total, invoiceInfo.paid]);

  // Event handlers yang dioptimasi dengan useCallback
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
          toast({
            title: "Error",
            description: "Harap upload file gambar",
            variant: "destructive",
          });
          return;
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "Ukuran file maksimal 5MB",
            variant: "destructive",
          });
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
    [handleInputChange, toast]
  );

  const handleDownloadPhoto = useCallback(() => {
    if (form.path) {
      const link = document.createElement("a");
      link.href = form.path as string;
      link.download = "bukti-transfer.jpg";
      link.click();
    }
  }, [form.path]);

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
    const payload = {
      ...form,
      purchase_order_client_id: purchase_order_client_id,
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
  }, [
    form,
    purchase_order_client_id,
    createPurchaseOrderCollections,
    toast,
    handleFetch,
  ]);

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
  }, [form, updatePurchaseOrderCollections, toast, handleFetch]);

  const handleEditHistory = useCallback(
    (item) => {
      setForm({
        purchase_order_client_id: purchase_order_client_id,
        purchase_order_collection_client_id: item.id,
        payment_type: item.payment_type,
        price: item.price,
        path: item.path,
        created_by: item?.created_by,
        finance_callback_at: item?.finance_callback_at,
        finance_callback_by: item?.finance_callback_by,
        finance_callback_reason: item?.finance_callback_reason,
        transaction_code: item?.transaction_code,
      });
      setIsEditMode(true);
      setShowHistoryDetail(false);
    },
    [purchase_order_client_id]
  );

  const handleViewHistory = useCallback((item) => {
    setSelectedHistory(item);
    setShowHistoryDetail(true);
    setIsEditMode(false);
    resetForm();
  }, []);

  const handleDeleteHistory = useCallback(
    async (id) => {
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
    [deletePurchaseOrderCollections, toast, handleFetch]
  );

  const resetForm = useCallback(() => {
    setForm({
      purchase_order_client_id: purchase_order_client_id,
      purchase_order_collection_client_id: undefined,
      price: null,
      transaction_code: "COLLECTION",
      payment_type: "TRANSFER",
      path: null,
      created_by: null,
      finance_callback_at: null,
      finance_callback_by: null,
      finance_callback_reason: null,
    });
    setIsEditMode(false);
    setSelectedHistory(null);
    setShowHistoryDetail(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [purchase_order_client_id]);

  const handleBackToList = useCallback(() => {
    setShowHistoryDetail(false);
    setSelectedHistory(null);
  }, []);

  // Render Status Info
  const StatusInfo = useMemo(
    () => (
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
                <p className="text-sm text-muted-foreground">Total Tagihan</p>
                <p className="text-lg font-bold text-foreground">
                  {formatIDR(invoiceInfo.total)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                <p className="text-lg font-bold text-green-600">
                  {formatIDR(invoiceInfo.paid)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
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
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    progressPercentage > 100 ? 100 : progressPercentage
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [invoiceInfo, progressPercentage, remainingBalance]
  );

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
      </div>

      {StatusInfo}

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
            {formattedCollections.length > 0 ? (
              formattedCollections.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditHistory}
                  onDelete={handleDeleteHistory}
                  onView={handleViewHistory}
                  isFinance={isFinance}
                />
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
                    Belum ada riwayat tagihan yang tercatat. Tagihan yang dibuat
                    akan muncul di sini.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Detail History */}
      {showHistoryDetail && selectedHistory && (
        <HistoryDetail
          selectedHistory={selectedHistory}
          onBack={handleBackToList}
        />
      )}

      {/* Form Tagihan */}
      {isEditMode && (
        <>
          <CollectionForm
            form={form}
            isEditMode={isEditMode}
            onInputChange={handleInputChange}
            onReset={resetForm}
            onVerificationOpen={() => setIsFeedBackOrderVendorModalOpen(true)}
            fileInputRef={fileInputRef}
            onPhotoUpload={handlePhotoUpload}
            onDownloadPhoto={handleDownloadPhoto}
          />

          <FeedbackOrderCollectionModal
            open={isFeedBackOrderVendorModalOpen}
            orderId={form?.purchase_order_collection_client_id}
            onOpenChange={setIsFeedBackOrderVendorModalOpen}
          />
        </>
      )}
    </div>
  );
};
