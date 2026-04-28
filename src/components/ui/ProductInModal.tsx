import React, { useState } from "react";
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
import { ApiResponse } from "@/types";
import {
  Trash2,
  AlertTriangle,
  Info,
  Image,
  FileText,
  Upload,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { PrintTravelDocumentKey } from "@/contexts/PurchaseOrderClient.Context";
import { useProducts } from "@/contexts/Products.Context";
import { useToast } from "./use-toast";
import { usePurchaseOrderVendors } from "@/contexts/PurchaseOrderVendors.Context";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface ProductInModalProps {
  title?: string;
  data?: ApiResponse;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  variant?: ButtonVariant;
  handlePrint?: (params: PrintTravelDocumentKey) => void;
  showIcon?: boolean;
  onSubmit?: (data: { travel_code: string; type: string }) => void;
}

export const ProductInModal: React.FC<ProductInModalProps> = ({
  title = "Barang Masuk",
  data,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  trigger,
  variant = "default",
  showIcon = true,
  onSubmit,
}) => {
  const [travel_code, setTravelCode] = useState<string>("");
  const { createProductDistributions } = useProducts();
  // const { getPurchaseOrderProductReceivedVendor } = usePurchaseOrderVendors();
  const { toast } = useToast();
  const [path, setPath] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!travel_code.trim()) {
      toast({
        title: "Kode barang keluar diperlukan",
        description: "Silakan masukkan kode barang keluar terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Jika ada prop onSubmit, gunakan itu
      if (onSubmit) {
        await onSubmit({ travel_code: travel_code.trim(), type: "OUT" });
      } else {
        // Fallback ke fungsi lama
        const response = await createProductDistributions({
          travel_code: travel_code.trim(),
          type: "OUT",
        });

        if (response.status) {
          toast({
            title: "Berhasil",
            description: response.messages,
            variant: "default",
          });
        } else {
          toast({
            title: "Peringatan",
            description: response.messages,
            variant: "destructive",
          });
        }
      }

      // Reset form setelah submit berhasil
      setTravelCode("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memproses data barang keluar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTravelCode("");
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format file tidak didukung",
          description:
            "Hanya file gambar (JPEG, PNG, GIF, WEBP) dan PDF yang diperbolehkan",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setIsLoading(true);
      try {
        const base64DataUrl = await convertFileToBase64(file);
        setPath(base64DataUrl);
        setFileName(file.name);
        setFileType(file.type);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast({
          title: "Gagal memproses file",
          description: "Terjadi kesalahan saat memproses file",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String); // Mengembalikan full data URL
      };
      reader.onerror = (error) => reject(error);
    });
  };
  // Get file icon berdasarkan tipe file
  const getFileIcon = () => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-6 w-6 text-green-600" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-600" />;
    }
    return <FileText className="h-6 w-6 text-green-600" />;
  };
  // Handle remove file

  const handleRemoveFile = () => {
    setPath("");
    setFileName("");
    setFileType("");
  };
  // Get file type label
  const getFileTypeLabel = () => {
    if (fileType.startsWith("image/")) {
      return "Gambar";
    } else if (fileType === "application/pdf") {
      return "PDF";
    }
    return "File";
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant={variant}
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10 transition-colors duration-200"
            disabled={isLoading}
          >
            {showIcon && <FileText className="h-4 w-4" />}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              {title}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-gray-600">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <span className="text-sm font-medium block mb-1">
                      Informasi Deskripsi
                    </span>
                    <p className="text-sm">
                      Masukan Kode Nomer Purchase Order Supplier
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <Label
                  htmlFor="travel_code"
                  className="text-sm font-medium text-gray-700 block text-left"
                >
                  Nomer
                </Label>
                <Input
                  id="travel_code"
                  value={travel_code}
                  onChange={(e) => setTravelCode(e.target.value)}
                  placeholder="POV-2419..."
                  className="h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-colors text-left"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Kode ini akan digunakan untuk melacak pensanan perusahaan
                </p>
              </div>
              <div className="space-y-3 text-left">
                <Label
                  htmlFor="file-upload"
                  className="text-sm font-medium text-gray-700"
                >
                  Bukti Penerimaan Barang
                </Label>

                {!path ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-200">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {isLoading
                            ? "Memproses file..."
                            : "Klik untuk upload file"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPEG, PNG, GIF, WEBP, atau PDF (maks. 5MB)
                        </p>
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
                            {fileName}
                          </p>
                          <p className="text-xs text-green-600">
                            {getFileTypeLabel()} • {fileType}
                          </p>
                          <p className="text-xs text-green-500 mt-1">
                            ✓ Siap dikirim
                          </p>
                        </div>
                      </div>
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

                    {/* Preview untuk gambar */}
                    {fileType.startsWith("image/") && (
                      <div className="mt-3 p-2 bg-white rounded border">
                        <img
                          src={path}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded"
                        />
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Preview gambar
                        </p>
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
            className="w-full sm:w-auto order-2 sm:order-1 rounded-lg px-6"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!travel_code.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
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
