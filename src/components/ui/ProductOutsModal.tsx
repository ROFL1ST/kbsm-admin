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
import { Trash2, AlertTriangle, Info, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PrintTravelDocumentKey } from "@/contexts/PurchaseOrderClient.Context";
import { useProducts } from "@/contexts/Products.Context";
import { useToast } from "./use-toast";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface ProductOutsModalProps {
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

export const ProductOutsModal: React.FC<ProductOutsModalProps> = ({
  title = "Barang Keluar",
  data,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  trigger,
  variant = "default",
  showIcon = true,
  onSubmit,
}) => {
  const [travel_code, setTravelCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createProductDistributions } = useProducts();
  const { toast } = useToast();

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
      location.reload();
    }
  };

  const handleCancel = () => {
    setTravelCode("");
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
              <div className="bg-accent border border-primary rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <span className="text-sm font-medium block mb-1">
                      Informasi Deskripsi
                    </span>
                    <p className="text-sm">
                      Masukan Nomor Surat Jalan untuk proses{" "}
                      <span className="text-bold">Pengeluaran Barang</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <Label
                  htmlFor="travel_code"
                  className="text-sm font-medium block text-left"
                >
                  Nomor Surat Jalan
                </Label>
                <Input
                  id="travel_code"
                  value={travel_code}
                  onChange={(e) => setTravelCode(e.target.value)}
                  placeholder="Masukkan Nomor Surat Jalan"
                  className="h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-colors text-left"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Kode ini akan digunakan untuk melacak pergerakan barang keluar
                </p>
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
