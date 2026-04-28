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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useParameter } from "@/contexts/Parameter.context";
interface AddClientModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  onClientAdded?: (client: any) => void;
  trigger?: React.ReactNode;
}

export function AddClientModal({
  open,
  onOpenChange,
  initialName = "",
  onClientAdded,
  trigger,
}: AddClientModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    email: "",
    phone: "",
    address: "",
    lat: "",
    long: "",
    type: "",
  });
  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"auto" | "manual">(
    "auto"
  );
  const { getValueCode, valueCode } = useParameter();
  const { createClient } = useClients();
  const { toast } = useToast();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  useEffect(() => {
    getValueCode({
      size: 1000,
      page: 1,
      lookup_code: "CLIENTS_TYPE",
    });
    setFormData((prev) => ({ ...prev, name: initialName }));
  }, [initialName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        toast({
          title: "Lokasi berhasil didapatkan",
          description: `Lat: ${latitude}, Lng: ${longitude}`,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Gagal mendapatkan lokasi",
          description: "Pastikan izin lokasi diaktifkan di browser.",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const latitude =
        locationMethod === "auto" ? coords.lat : Number(formData.lat);
      const longitude =
        locationMethod === "auto" ? coords.lng : Number(formData.long);

      const newClient = await createClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: formData.type,
        lat: latitude ? String(latitude) : "",
        long: longitude ? String(longitude) : "",
      });
      if (newClient) {
        onClientAdded?.(newClient);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          lat: "",
          long: "",
          type: "",
        });
        setCoords({ lat: null, lng: null });
        handleOpenChange(false);
      } else {
        console.error(
          "Gagal menambahkan client: response kosong atau error dari server."
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
        type: "",
      });
      setCoords({ lat: null, lng: null });
    }
  };

  const handleLocationMethodChange = (value: "auto" | "manual") => {
    setLocationMethod(value);
    setFormData((prev) => ({ ...prev, lat: "", long: "" }));
    setCoords({ lat: null, lng: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Klien Baru</DialogTitle>
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
          {/* Tipe Klien */}
          <div className="space-y-2">
            <Label>Tipe Klien</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: String(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {valueCode.map((item, index) => (
                  <div
                    key={item.lookup_value_code}
                    className="flex items-center justify-between px-2"
                  >
                    <SelectItem
                      value={item.lookup_value_code}
                      className="flex-1"
                    >
                      {item.value}
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Metode Lokasi */}
          <div className="space-y-4">
            <Label>Metode Input Lokasi *</Label>
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

          {/* Input Lokasi */}
          {locationMethod === "auto" ? (
            <div className="space-y-2">
              <Label>Koordinat Lokasi (Auto)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation
                    ? "Mendapatkan Lokasi..."
                    : "Dapatkan Lokasi Saya"}
                </Button>
                {coords.lat && coords.lng && (
                  <span className="text-sm text-muted-foreground">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                )}
              </div>
            </div>
          ) : (
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
          )}

          {/* Tombol Aksi */}
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
