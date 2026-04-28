import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useClients } from "@/contexts/Clients.Context";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVendors } from "@/contexts/Vendors.Context";
import { useNavigate } from "react-router-dom";

interface AddVendorModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  onVendorAdded?: (client: any) => void;
  trigger?: React.ReactNode;
}

export function AddVendorModal({
  open,
  onOpenChange,
  initialName = "",
  onVendorAdded,
  trigger,
}: AddVendorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    email: "",
    phone: "",
    address: "",
    lat: "",
    long: "",
  });
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [locationMethod, setLocationMethod] = useState<"auto" | "manual">(
    "auto",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { createVendors } = useVendors();
  const { toast } = useToast();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: initialName,
    }));
  }, [initialName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Browser tidak mendukung fitur lokasi.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setFormData((prev) => ({
          ...prev,
          lat: String(latitude),
          long: String(longitude),
        }));
        toast({
          title: "Lokasi berhasil didapatkan",
          description: `Lat: ${latitude}, Lng: ${longitude}`,
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Gagal mendapatkan lokasi",
          description: "Pastikan izin lokasi diaktifkan di browser.",
          variant: "destructive",
        });
        setIsLoading(false);
      },
    );
  };

  const handleLocationMethodChange = (value: "auto" | "manual") => {
    setLocationMethod(value);
    if (value === "auto") {
      // Reset manual input when switching to auto
      setFormData((prev) => ({
        ...prev,
        lat: "",
        long: "",
      }));
      setCoords({ lat: null, lng: null });
    } else {
      // Reset auto coordinates when switching to manual
      setCoords({ lat: null, lng: null });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine which coordinates to use based on selected method
      let finalLat = "";
      let finalLong = "";

      if (locationMethod === "auto") {
        finalLat = String(coords?.lat || "");
        finalLong = String(coords?.lng || "");
      } else {
        finalLat = formData.lat;
        finalLong = formData.long;
      }

      const newClient = await createVendors({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        lat: finalLat,
        long: finalLong,
      });
      if (newClient) {
        onVendorAdded?.(newClient);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          lat: "",
          long: "",
        });
        setCoords({ lat: null, lng: null });
        setLocationMethod("auto");
        handleOpenChange(false);
      } else {
        console.error(
          "Gagal menambahkan client: response kosong atau error dari server.",
        );
      }
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isControlled) onOpenChange?.(open);
    else setInternalOpen(open);

    if (!open) {
      setFormData({
        name: initialName,
        email: "",
        phone: "",
        address: "",
        lat: "",
        long: "",
      });
      setCoords({ lat: null, lng: null });
      setLocationMethod("auto");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Vendor Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              placeholder="Masukkan nama klien"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Masukkan email klien"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Telepon */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Masukkan nomor telepon"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Detail</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Masukkan alamat lengkap"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Pilihan Metode Lokasi */}
          <div className="space-y-4">
            <Label>Metode Input Lokasi</Label>
            <RadioGroup
              value={locationMethod}
              onValueChange={(value: "auto" | "manual") =>
                handleLocationMethodChange(value)
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto (GPS)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual Input</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input Lokasi Berdasarkan Pilihan */}
          {locationMethod === "auto" ? (
            <div className="space-y-2">
              <Label>Koordinat Lokasi (Auto)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGetLocation}
                  disabled={isLoading}
                >
                  {isLoading ? "Mendapatkan Lokasi..." : "Dapatkan Lokasi Saya"}
                </Button>
                {coords.lat && coords.lng && (
                  <span className="text-sm text-muted-foreground">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Klik tombol di atas untuk mendapatkan koordinat lokasi Anda
                secara otomatis
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Koordinat Lokasi (Manual)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    name="lat"
                    placeholder="Masukkan Latitude"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long">Longitude *</Label>
                  <Input
                    id="long"
                    name="long"
                    placeholder="Masukkan Longitude"
                    value={formData.long}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan koordinat latitude dan longitude secara manual
              </p>
            </div>
          )}

          {/* Tombol Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            {formData?.lat && formData?.long && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
