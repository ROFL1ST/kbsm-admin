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
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVendors } from "@/contexts/Vendors.Context";

interface UpdateVendorModalProps {
  open?: boolean;
  vendor_id?: number;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: string;
  long?: string;
  onVendorUpdated?: (vendor: any) => void;
  trigger?: React.ReactNode;
}

export function EditVendorModal({
  open,
  onOpenChange,
  name = "",
  email = "",
  phone = "",
  address = "",
  lat = "",
  long = "",
  onVendorUpdated,
  trigger,
  vendor_id,
}: UpdateVendorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: name,
    email: email,
    phone: phone,
    address: address,
    lat: lat,
    long: long,
  });
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: lat ? parseFloat(lat) : null,
    lng: long ? parseFloat(long) : null,
  });
  const [locationMethod, setLocationMethod] = useState<"auto" | "manual">(
    lat && long ? "manual" : "auto",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { updateVendors } = useVendors();
  const { toast } = useToast();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  // Reset form when vendor data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: name,
        email: email,
        phone: phone,
        address: address,
        lat: lat,
        long: long,
      });

      const parsedLat = lat ? parseFloat(lat) : null;
      const parsedLong = long ? parseFloat(long) : null;

      setCoords({
        lat: parsedLat,
        lng: parsedLong,
      });

      // Set location method based on existing data
      setLocationMethod(parsedLat && parsedLong ? "manual" : "auto");
    }
  }, [isOpen, name, email, phone, address, lat, long]);

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
      // Keep coords if they exist from auto detection
      if (!coords.lat || !coords.lng) {
        setCoords({ lat: null, lng: null });
      }
    } else {
      // If switching to manual and we have auto coords, populate the form
      if (coords.lat && coords.lng) {
        setFormData((prev) => ({
          ...prev,
          lat: String(coords.lat),
          long: String(coords.lng),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor_id) {
      toast({
        title: "Error",
        description: "Vendor ID tidak valid.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine which coordinates to use based on selected method
      let finalLat = "";
      let finalLong = "";

      if (locationMethod === "auto") {
        finalLat = coords.lat ? String(coords.lat) : "";
        finalLong = coords.lng ? String(coords.lng) : "";
      } else {
        finalLat = formData.lat;
        finalLong = formData.long;
      }

      // Validate coordinates if provided
      if (finalLat && finalLong) {
        const latNum = parseFloat(finalLat);
        const longNum = parseFloat(finalLong);

        if (isNaN(latNum) || isNaN(longNum)) {
          toast({
            title: "Error",
            description: "Format koordinat tidak valid.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      await updateVendors({
        vendor_id: vendor_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        lat: finalLat,
        long: finalLong,
      });
      handleOpenChange(false);
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui vendor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }

    if (!open) {
      // Reset form when closing
      setTimeout(() => {
        setFormData({
          name: name,
          email: email,
          phone: phone,
          address: address,
          lat: lat,
          long: long,
        });
        const parsedLat = lat ? parseFloat(lat) : null;
        const parsedLong = long ? parseFloat(long) : null;
        setCoords({ lat: parsedLat, lng: parsedLong });
        setLocationMethod(parsedLat && parsedLong ? "manual" : "auto");
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Masukkan nama Vendor"
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
              placeholder="Masukkan email Vendor"
              value={formData.email}
              onChange={handleChange}
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
            />
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Masukkan alamat lengkap"
              value={formData.address}
              onChange={handleChange}
              rows={3}
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
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    name="lat"
                    placeholder="Masukkan Latitude"
                    value={formData.lat}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long">Longitude</Label>
                  <Input
                    id="long"
                    name="long"
                    placeholder="Masukkan Longitude"
                    value={formData.long}
                    onChange={handleChange}
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

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
