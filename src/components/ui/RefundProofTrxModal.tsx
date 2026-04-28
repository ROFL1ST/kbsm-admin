import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiResponse } from "@/types";
import {
  Trash2,
  Info,
  FileText,
  Upload,
  Image,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "./use-toast";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface RefundProofTrxModalProps {
  title?: string;
  purchase_order_client_id: string;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  variant?: ButtonVariant;
  showIcon?: boolean;
  initialData: {
    path?: string;
    payment_type?: "TRANSFER" | "TUNAI";
  };
  onUpdate: (params: {
    purchase_order_client_id: string;
    path: string;
    payment_type: "TRANSFER" | "TUNAI";
  }) => any;
}

export const UpdateRefundProofModal: React.FC<RefundProofTrxModalProps> = ({
  title = "Bukti Pengembalian Uang Refund",
  purchase_order_client_id,
  confirmText = "Update",
  cancelText = "Batal",
  trigger,
  variant = "outline",
  showIcon = true,
  initialData,
  onUpdate,
}) => {
  const [path, setPath] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"TRANSFER" | "TUNAI">(
    "TRANSFER"
  );
  const [showClientId, setShowClientId] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();

  // Inisialisasi data dari initialData
  useEffect(() => {
    if (initialData) {
      if (initialData.path) {
        setPath(initialData.path);
        // Cek jika path adalah base64 atau URL biasa
        if (initialData.path.startsWith("data:")) {
          setFileName("File yang sudah diupload");
          const match = initialData.path.match(/^data:(.*?);base64,/);
          if (match) {
            setFileType(match[1]);
          }
        } else {
          setFileName("File dari server");
          // Ekstrak ekstensi file dari URL/path
          const ext = initialData.path.split(".").pop()?.toLowerCase();
          if (["jpg", "jpeg", "png"].includes(ext || "")) {
            setFileType(`image/${ext === "jpg" ? "jpeg" : ext}`);
          }
        }
      }
      if (initialData.payment_type) {
        setPaymentType(initialData.payment_type);
      }
    }
  }, [initialData]);

  // Fungsi untuk convert file ke base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file - HANYA JPG, JPEG, PNG
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format file tidak didukung",
        description: "Hanya file gambar JPG, JPEG, dan PNG yang diperbolehkan",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const base64DataUrl = await convertFileToBase64(file);
      setPath(base64DataUrl);
      setFileName(file.name);
      setFileType(file.type);

      toast({
        title: "File berhasil diupload",
        description: `${file.name} siap digunakan`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      toast({
        title: "Gagal memproses file",
        description: "Terjadi kesalahan saat memproses file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validasi
    if (!path.trim()) {
      toast({
        title: "Bukti penerimaan diperlukan",
        description: "Silakan upload bukti penerimaan barang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!paymentType) {
      toast({
        title: "Tipe pembayaran diperlukan",
        description: "Silakan pilih tipe pembayaran",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      purchase_order_client_id: purchase_order_client_id,
      path: path,
      payment_type: paymentType,
    };
    await onUpdate(submitData);
  };

  // Handle remove file
  const handleRemoveFile = () => {
    // Kembalikan ke file awal jika ada
    if (initialData?.path) {
      setPath(initialData.path);
      if (initialData.path.startsWith("data:")) {
        setFileName("File yang sudah diupload");
        const match = initialData.path.match(/^data:(.*?);base64,/);
        if (match) {
          setFileType(match[1]);
        }
      }
    } else {
      setPath("");
      setFileName("");
      setFileType("");
    }
  };

  // Get file icon berdasarkan tipe file
  const getFileIcon = () => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-6 w-6 text-green-600" />;
    }
    return <FileText className="h-6 w-6 text-green-600" />;
  };

  // Get file type label
  const getFileTypeLabel = () => {
    if (fileType === "image/jpeg" || fileType === "image/jpg") {
      return "Gambar JPEG";
    } else if (fileType === "image/png") {
      return "Gambar PNG";
    }
    return "Gambar";
  };

  // Format file type untuk display
  const formatFileType = (type: string) => {
    if (type === "image/jpeg") return "JPEG";
    if (type === "image/jpg") return "JPG";
    if (type === "image/png") return "PNG";
    return type;
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant={variant}
            size="icon"
            className="h-8 w-8 text-orange-600 hover:bg-orange-100 transition-colors duration-200"
            disabled={isLoading}
          >
            {showIcon && <Edit className="h-4 w-4" />}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="">
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/10 rounded-xl p-4">
                <p className="text-sm text-primary">
                  Perbarui bukti pengembalian Uang Refund kepada Klien
                </p>
              </div>

              {/* Payment Type Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="payment-type" className="text-sm font-medium">
                  Tipe Pembayaran *
                </Label>
                <Select
                  value={paymentType}
                  onValueChange={(value: "TRANSFER" | "TUNAI") =>
                    setPaymentType(value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="payment-type">
                    <SelectValue placeholder="Pilih tipe pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="TUNAI">Tunai</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Pilih metode pembayaran yang digunakan untuk transaksi ini
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Bukti Uang Refund *
                  <span className="ml-1 text-xs text-gray-500">
                    (JPG, JPEG, PNG)
                  </span>
                </Label>

                {!path ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors duration-200">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading || isUploading}
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-8 w-8 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium ">
                          {isUploading
                            ? "Memproses file..."
                            : "Klik untuk upload file baru"}
                        </p>
                        <p className="text-xs mt-1">
                          Format: JPG, JPEG, PNG (maks. 5MB)
                        </p>
                        {initialData?.path && (
                          <p className="text-xs text-orange-600 mt-2">
                            <Info className="h-3 w-3 inline mr-1" />
                            File sebelumnya akan digantikan
                          </p>
                        )}
                      </div>
                    </Label>
                  </div>
                ) : (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon()}
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {fileName || "File bukti penerimaan"}
                          </p>
                          <p className="text-xs text-green-600">
                            {getFileTypeLabel()} • {formatFileType(fileType)}
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            ✓ Siap diperbarui
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const input = document.getElementById(
                              "file-upload"
                            ) as HTMLInputElement;
                            if (input) input.click();
                          }}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          disabled={isLoading || isUploading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Preview untuk gambar */}
                    {(path.startsWith("data:image/") ||
                      path.startsWith("http")) && (
                      <div className="mt-3 p-2 bg-white rounded border">
                        <div className="flex items-center justify-center">
                          <img
                            src={path}
                            alt="Preview"
                            className="max-h-32 max-w-full rounded object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNMzIgMzZDMzQuMjA5MSAzNiAzNiAzNC4yMDkxIDM2IDMyQzM2IDI5Ljc5MDkgMzQuMjA5MSAyOCAzMiAyOEMyOS43OTA5IDI4IDI4IDI5Ljc5MDkgMjggMzJDMjggMzQuMjA5MSAyOS43OTA5IDM2IDMyIDM2WiIgZmlsbD0iI2EwYTBhMCIvPjxwYXRoIGQ9Ik0zNi41IDE5LjVIMjcuNUMxOS43ODQzIDE5LjUgMTMuNSAyNS43ODQzIDEzLjUgMzMuNVY0My41QzEzLjUgNDUuMTU2OSAxNC44NDMxIDQ2LjUgMTYuNSA0Ni41SDQ3LjVDNDkuMTU2OSA0Ni41IDUwLjUgNDUuMTU2OSA1MC41IDQzLjVWMzMuNUM1MC41IDI1Ljc4NDMgNDQuMjE1NyAxOS41IDM2LjUgMTkuNVpNMTYgNDRWMTdDMTYgMTUuODk1NCAxNi44OTU0IDE1IDE4IDE1SDQ2QzQ3LjEwNDYgMTUgNDggMTUuODk1NCA0OCAxN1Y0NEM0OCA0NS4xMDQ2IDQ3LjEwNDYgNDYgNDYgNDZIMThDMTYuODk1NCA0NiAxNiA0NS4xMDQ2IDE2IDQ0WiIgZmlsbD0iI2EwYTBhMCIvPjwvc3ZnPg==";
                            }}
                          />
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Preview gambar
                        </p>
                      </div>
                    )}

                    {initialData?.path && path !== initialData.path && (
                      <div className="mt-2 text-xs text-orange-600 flex items-center">
                        <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>File akan digantikan dengan file baru ini</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <AlertDialogCancel
            className="w-full sm:w-auto order-2 sm:order-1 rounded-lg px-6 border-gray-300"
            disabled={isLoading || isUploading}
            onClick={handleRemoveFile}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary text-white hover:bg-primary rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!path.trim() || !paymentType || isLoading || isUploading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memperbarui...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
