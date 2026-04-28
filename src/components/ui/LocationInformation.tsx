import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  FileText,
  Calendar,
  Navigation,
  Truck,
  Check,
} from "lucide-react";
import { Button } from "./button";
import {
  DeliveryUpdateStatus,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";
import { DriverFinishModal } from "./DriverFinishModal";
import { formatDate } from "../format/Date";

// Interface untuk props komponen
interface LocationInfoProps {
  lat?: string;
  long?: string;
  phone?: string;
  purchase_order_client_code?: string;
  purchase_order_client_id?: string;
  purchase_order_client_problem_id?: string | null;
  send_date?: string;
  address?: string;
  progress_type_code?: string;
  is_driver?: boolean;
}

const LocationInformation: React.FC<LocationInfoProps> = ({
  lat = -6.365096581635488,
  long = 106.83642711440501,
  phone = "....",
  purchase_order_client_code = "....",
  purchase_order_client_id = "....",
  purchase_order_client_problem_id,
  send_date = "....",
  address = "....",
  progress_type_code = "X",
  is_driver = true,
}) => {
  const { updatePurchaseOrderDeliveryHistoryDetail } =
    usePurchaseOrderClients();
  // Fungsi untuk redirect ke WhatsApp dengan parameter lokasi
  const redirectToWhatsApp = () => {
    const message = `Halo! Saya berada di lokasi dengan detail berikut:\n📍 Alamat: ${address}\n📱 Kode PO: ${purchase_order_client_code}\n📅 Tanggal Kirim: ${send_date}\n\nLokasi: https://www.google.com/maps/place/${lat},${long}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };
  // Fungsi untuk membuka Google Maps di tab baru
  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/place/${lat},${long}`;
    window.open(mapsUrl, "_blank");
  };
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleUpdateStatus = async (params: DeliveryUpdateStatus) => {
    const response = await updatePurchaseOrderDeliveryHistoryDetail(params);
    if (response.status) {
      toast({
        title: "Berhasil Update",
        description: "Berhasil Update Status Delivery",
      });

      navigate("/activity-driver");
    }
    if (!response.status)
      toast({
        title: "Peringatan",
        description: "Gagal Update Status Delivery",
        variant: "destructive",
      });
  };
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Informasi Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={openGoogleMaps}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium"
              >
                <Navigation className="h-4 w-4" />
                <span className="underline">Buka di Google Maps</span>
              </button>
              {is_driver && (
                <>
                  {progress_type_code === "HAS_NOT_SENT" && (
                    <Button
                      className="w-fit"
                      onClick={() =>
                        handleUpdateStatus({
                          purchase_order_client_id: purchase_order_client_id,
                          purchase_order_client_problem_id:
                            purchase_order_client_problem_id,
                          progress_type_code: "SENDING",
                          path: null,
                        })
                      }
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Berangkat
                    </Button>
                  )}
                  {progress_type_code === "SENDING" && (
                    <DriverFinishModal
                      title={"Konfirmasi"}
                      confirmText={`Kirim`}
                      cancelText="Batal"
                      variant="outline"
                      purchase_order_client_id={purchase_order_client_id}
                      purchase_order_client_problem_id={
                        purchase_order_client_problem_id
                      }
                      onSubmit={handleUpdateStatus}
                      showIcon={false}
                      trigger={
                        <Button>
                          <Check />
                          Selesai
                        </Button>
                      }
                    />
                  )}
                </>
              )}
            </div>

            {/* Google Maps Iframe */}
            <div className="bg-gray-100 rounded-lg overflow-hidden h-64">
              <iframe
                src={`https://maps.google.com/maps?q=${lat},${long}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Peta Lokasi"
              ></iframe>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Latitude: {lat}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Longitude: {long}
              </span>
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Card */}
            <Card className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer w-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      WhatsApp Klien
                    </p>
                    <p className="font-medium text-foreground group-hover:text-primary/90">
                      {phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer w-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Alamat Lengkap
                    </p>
                    <p className="font-medium text-foreground group-hover:text-primary/90">
                      {address}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PO Code Card */}
            <Card className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer w-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Kode PO Klien
                    </p>
                    <p className="font-medium text-foreground group-hover:text-primary/90">
                      {purchase_order_client_code}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Date Card */}
            <Card className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl cursor-pointer w-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Tanggal Kirim
                    </p>
                    <p className="font-medium text-foreground group-hover:text-primary/90">
                      {formatDate(send_date, "YYYY MMM DD")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* WhatsApp Button */}
          <div className="pt-4 border-t border-primary border-gray-200">
            <button
              onClick={redirectToWhatsApp}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-100 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition duration-300"
            >
              <Phone className="h-5 w-5" />
              <span>Kirim Pesan Klien</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationInformation;
