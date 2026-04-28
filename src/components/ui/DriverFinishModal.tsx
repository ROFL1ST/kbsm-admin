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
  FileText,
  Upload,
  Image,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "./use-toast";
import { DeliveryUpdateStatus } from "@/contexts/PurchaseOrderClient.Context";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface DriverFinishProps {
  title?: string;
  purchase_order_client_id?: string;
  purchase_order_client_problem_id?: string | null;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  variant?: ButtonVariant;
  showIcon?: boolean;
  onSubmit: (params: DeliveryUpdateStatus) => void;
}

export const DriverFinishModal: React.FC<DriverFinishProps> = ({
  title = "Selesaikan Pengiriman",
  purchase_order_client_id,
  purchase_order_client_problem_id,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  trigger,
  variant = "default",
  showIcon = true,
  onSubmit,
}) => {
  const [path, setPath] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fungsi untuk convert file ke base64 dengan full data URL
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

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format file tidak didukung",
          description:
            "Hanya file gambar (JPEG, PNG) dan JPG yang diperbolehkan",
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

  // Handle submit
  const handleSubmit = async () => {
    if (!path.trim()) {
      toast({
        title: "Bukti penerimaan diperlukan",
        description: "Silakan upload bukti penerimaan barang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        purchase_order_client_id: purchase_order_client_id,
        purchase_order_client_problem_id: purchase_order_client_problem_id,
        path: path,
        progress_type_code: "DONE",
      });

      // Reset form setelah submit berhasil
      setPath("");
      setFileName("");
      setFileType("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Gagal mengirim data",
        description: "Terjadi kesalahan saat mengirim data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove file
  const handleRemoveFile = () => {
    setPath("");
    setFileName("");
    setFileType("");
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

          <AlertDialogDescription className="">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Informasi Deskripsi
                  </span>
                </div>
                <p className="text-sm text-primary">
                  Upload bukti penerimaan barang dalam format gambar (JPEG, PNG,
                  JPG ,GIF, WEBP)
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-sm font-medium">
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
                      <Upload className="h-8 w-8 " />
                      <div>
                        <p className="text-sm font-medium ">
                          {isLoading
                            ? "Memproses file..."
                            : "Klik untuk upload file"}
                        </p>
                        <p className="text-xs  mt-1">
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
                        <p className="text-xs text-center  mt-2">
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
            disabled={isLoading}
            onClick={handleRemoveFile}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!path.trim() || isLoading}
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
