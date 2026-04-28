import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { usePurchaseOrderVendors } from "@/contexts/PurchaseOrderVendors.Context";

interface FeedBackOrderVendorModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  orderId?: string;
  onStatusUpdate?: () => void;
}

export function FeedBackOrderVendorModal({
  open,
  onOpenChange,
  trigger,
  orderId,
  onStatusUpdate,
}: FeedBackOrderVendorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const { feedbackOrderVendor } = usePurchaseOrderVendors();
  const { toast } = useToast();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleSubmit = async (
    status: "VENDOR_ORDER_APPROVED" | "VENDOR_ORDER_REJECTED"
  ) => {
    setIsLoading(true);

    try {
      const payload = {
        progress_type_code: status,
        finance_callback_reason:
          status === "VENDOR_ORDER_REJECTED" ? rejectionReason : null,
        purchase_order_vendor_id: orderId,
      };

      const response = await feedbackOrderVendor(payload);
      if (response.status) {
        toast({
          title: "Berhasil",
          description: `Order berhasil ${
            status === "VENDOR_ORDER_APPROVED" ? "disetujui" : "ditolak"
          }`,
        });

        location.reload();
      }

      onStatusUpdate?.();
      handleOpenChange(false);
      setRejectionReason("");
      setShowRejectionForm(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isControlled) onOpenChange?.(open);
    else setInternalOpen(open);

    if (!open) {
      setRejectionReason("");
      setShowRejectionForm(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectionForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectionForm(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Konfirmasi Pesanan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pesan Konfirmasi */}
          {!showRejectionForm && (
            <div className="space-y-2 m-auto">
              <p className="text-l font-medium ">
                Apakah Anda yakin untuk memproses pesanan ini?
              </p>
              <p className="text-sm ">
                Silakan pilih setuju untuk melanjutkan atau tolak jika ada
                kendala
              </p>
            </div>
          )}

          {!showRejectionForm ? (
            /* Tombol Aksi Utama */
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={() => handleSubmit("VENDOR_ORDER_APPROVED")}
                disabled={isLoading}
                className="flex-1 font-semibold py-2.5 text-white"
              >
                ✓ Setuju & Proses
              </Button>
              <Button
                type="button"
                onClick={handleRejectClick}
                disabled={isLoading}
                variant="outline"
                className="flex-1 font-semibold py-2.5"
              >
                ✗ Tolak Pesanan
              </Button>
            </div>
          ) : (
            /* Form Penolakan */
            <div className="space-y-4">
              <div className="border border-primary rounded-lg p-4">
                <p className="font-medium text-sm">
                  Anda akan menolak pesanan ini. Silakan berikan alasan
                  penolakan:
                </p>
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder="Masukkan alasan penolakan secara detail..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs ">
                  Alasan penolakan wajib diisi untuk melanjutkan
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleCancelReject}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("VENDOR_ORDER_REJECTED")}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="flex-1 text-white font-semibold"
                >
                  {isLoading ? "Mengirim..." : "Kirim Penolakan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
