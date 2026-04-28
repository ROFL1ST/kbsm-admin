"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/contexts/Clients.Context";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  X,
  ArrowLeft,
  Eye,
  MapPin,
  Save,
  Edit,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { ParameterValueModal } from "@/components/ui/ParameterValueModal";
import { FormStateValueCode, useParameter } from "@/contexts/Parameter.context";

export default function DetailClientPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateClientPage } = useClients();
  const { getDetailClient, client } = useClients();
  const { toast } = useToast();

  // Get client data from location state
  const clientID = location?.state?.client_id;
  const {
    addValueCode,
    deleteValueCode,
    getValueCode,
    updateValueCode,
    valueCode,
  } = useParameter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    path: null,
    type: "",
    phone: "",
    address: "",
    lat: "",
    long: "",
  });
  const [parameterValue, setParameterValue] = useState<FormStateValueCode>({
    lookup_code: "CLIENTS_TYPE",
    lookup_value_code: "",
    value: "",
    description: "",
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load client data from location state
  useEffect(() => {
    getDetailClient(2);
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        path: client.path || null,
        type: client.type || "",
        phone: client.phone || "",
        address: client.address || "",
        lat: client.lat || "",
        long: client.long || "",
      });
      getValueCode({
        size: 1000,
        page: 1,
        lookup_code: "CLIENTS_TYPE",
      });
      if (client.path) {
        setProfileImage(client.path);
      }

      // Set coordinates and location method
      if (client.lat && client.long) {
        setCoords({
          lat: parseFloat(client.lat),
          lng: parseFloat(client.long),
        });
        setLocationMethod("manual");
      }
    } else {
      // Redirect back if no client data
      toast({
        title: "Error",
        description: "Data klien tidak ditemukan.",
        variant: "destructive",
      });
      navigate("/clients");
    }
  }, [client, navigate, toast]);

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
        setFormData((prev) => ({
          ...prev,
          lat: latitude.toString(),
          long: longitude.toString(),
        }));
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

    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    // Validasi form untuk edit mode
    const hasName = formData.name.trim().length > 0;
    const hasEmail = formData.email.trim().length > 0;
    const hasPhone = formData.phone.trim().length > 0;
    const hasProfileImage = profileImage !== null;
    const hasIdentity = hasName || hasEmail || hasPhone || hasProfileImage;

    let hasLocation = false;
    if (locationMethod === "auto") {
      hasLocation = coords.lat !== null && coords.lng !== null;
    } else {
      hasLocation =
        formData.lat.trim().length > 0 && formData.long.trim().length > 0;
    }

    if (!hasIdentity) {
      toast({
        title: "Gagal!",
        description:
          "Isi minimal salah satu: Nama, Email, Telepon, atau Foto Profil",
        variant: "destructive",
      });
      return;
    }

    if (!hasLocation) {
      toast({
        title: "Gagal!",
        description: "Lokasi wajib diisi. Gunakan Auto GPS atau input manual",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const latitude =
        locationMethod === "auto" ? coords.lat : Number(formData.lat);
      const longitude =
        locationMethod === "auto" ? coords.lng : Number(formData.long);

      const updatedClient = await updateClientPage({
        client_id: client.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        lat: latitude ? String(latitude) : "",
        long: longitude ? String(longitude) : "",
        type: formData.type,
        path: formData.path,
      });

      if (updatedClient) {
        toast({
          title: "Berhasil!",
          description: "Data klien berhasil diperbarui.",
        });
        setIsEditMode(false);
        // Update the location state with new data
        navigate("/clients");
      } else {
        toast({
          title: "Gagal!",
          description: "Gagal memperbarui data klien.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui klien.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        path: client.path || null,
        type: client.type || "",
        phone: client.phone || "",
        address: client.address || "",
        lat: client.lat || "",
        long: client.long || "",
      });

      if (client.path) {
        setProfileImage(client.path);
      }

      if (client.lat && client.long) {
        setCoords({
          lat: parseFloat(client.lat),
          lng: parseFloat(client.long),
        });
        setLocationMethod("manual");
      } else {
        setLocationMethod("auto");
        setCoords({ lat: null, lng: null });
      }
    }
    setIsEditMode(false);
  };

  const handleLocationMethodChange = (value: "auto" | "manual") => {
    setLocationMethod(value);
    if (value === "auto") {
      setFormData((prev) => ({ ...prev, lat: "", long: "" }));
    }
  };

  const convertToSquare = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const size = Math.min(img.width, img.height);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas not supported");

          canvas.width = size;
          canvas.height = size;

          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;

          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "File harus berupa gambar.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran gambar tidak boleh lebih dari 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const squareImage = await convertToSquare(file);
      setProfileImage(squareImage);
      setFormData((prev) => ({ ...prev, path: squareImage }));

      toast({
        title: "Gambar berhasil diunggah",
        description: "Avatar telah diperbarui.",
      });
    } catch (error) {
      console.error("Error converting image:", error);
      toast({
        title: "Error",
        description: "Gagal memproses gambar.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setFormData((prev) => ({ ...prev, path: null }));
  };
  const handleCreatePO = () => {
    navigate("/po-clients/generate-po", {
      state: {
        client: client,
        fromClientCreation: true,
      },
    });
  };
  const openInMaps = () => {
    const lat = locationMethod === "auto" ? coords.lat : formData.lat;
    const lng = locationMethod === "auto" ? coords.lng : formData.long;

    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };
  const handleCategorySubmit = async () => {
    try {
      const newForm = {
        ...parameterValue,
        description: parameterValue?.value,
        lookup_value_code: parameterValue?.value
          .toUpperCase()
          .replace(/\s+/g, "_"),
      };
      const res = await addValueCode(newForm);

      if (res.status) {
        toast({
          title: "Berhasil",
          description: `Kategori baru berhasil ditambahkan.`,
        });
        getValueCode({
          size: 100,
          page: 1,
          lookup_code: "CLIENTS_TYPE",
        });
      } else {
        toast({
          title: "Gagal",
          description:
            res?.messages || "Gagal menambahkan kategori. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan kategori.",
        variant: "destructive",
      });
    }
  };
  const handleEditValueCode = async (item: any) => {
    try {
      const updatedForm = {
        lookup_value_id: item.lookup_value_id,
        lookup_value_code: item?.lookup_value_code,
        value: parameterValue?.value,
        description: parameterValue?.value,
        lookup_code: "CLIENTS_TYPE",
      };
      const res = await updateValueCode(updatedForm);
      if (res.status) {
        toast({
          title: "Berhasil",
          description: `Kategori berhasil diperbarui.`,
          variant: "default",
        });
        getValueCode({
          size: 100,
          page: 1,
          lookup_code: "CLIENTS_TYPE",
        });
      } else {
        toast({
          title: "Gagal",
          description:
            res?.messages || "Gagal memperbarui kategori. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Error edit category:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengedit kategori.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteCategory = async (id) => {
    try {
      const res = await deleteValueCode(id);
      if (res.status) {
        toast({
          title: "Berhasil",
          description: `Satuan berhasil dihapus.`,
          variant: "default",
        });
        getValueCode({
          size: 100,
          page: 1,
          lookup_code: "CLIENTS_TYPE",
        });
      } else {
        toast({
          title: "Gagal",
          description:
            res?.messages || "Gagal menghapus kategori. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: " Terjadi kesalahan saat menghapus kategori.",
        variant: "destructive",
      });
    }
  };
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Data tidak ditemukan
          </h1>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Kembali ke Daftar Klien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? "Edit Klien" : "Detail Klien"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Edit data klien" : "Lihat detail informasi klien"}
            </p>
          </div>
        </div>
        {!isEditMode && (
          <Button onClick={() => setIsEditMode(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Klien
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Informasi Klien</CardTitle>
            <ParameterValueModal
              header="Tambah Tipe Klien"
              description="Masukan Nama Tipen Klien yang ditentukan"
              label="Tipe Klien"
              placeholder="CONTOH : PT, CV, Warung"
              lookup_code="CLIENTS_TYPE"
              onSubmit={handleCategorySubmit}
              parameterValue={parameterValue}
              setValueForms={setParameterValue}
              children={<Button variant="outline">Tambah Tipe Klien</Button>}
            />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column - Avatar & Basic Info */}
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-muted/50">
                    <div className="relative group">
                      <Avatar
                        className="h-24 w-24 border-2 border-gray-200 shadow-sm cursor-pointer"
                        onClick={() => profileImage && setIsViewImageOpen(true)}
                      >
                        <AvatarImage
                          src={profileImage || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-medium">
                          {formData.name
                            ? formData.name.charAt(0).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>

                      {isEditMode && (
                        <>
                          {/* Upload Button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white hover:bg-white/90 shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                document
                                  .getElementById("profileUpload")
                                  ?.click();
                              }}
                            >
                              <Camera className="h-4 w-4 text-gray-700" />
                            </Button>
                          </div>

                          {/* Remove Button - Only show when image exists */}
                          {profileImage && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* View Image Button - Only show when image exists */}
                      {profileImage && (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute -bottom-2 -left-2 h-6 w-6 rounded-full shadow-md bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsViewImageOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {isEditMode && (
                      <div className="text-center">
                        <input
                          type="file"
                          id="profileUpload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadImage}
                        />
                        <Label
                          htmlFor="profileUpload"
                          className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                        >
                          Upload foto profil
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG (max. 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Masukkan nama klien"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Masukkan email klien"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Masukkan nomor telepon"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipe Klien</Label>
                      <Select
                        disabled={!isEditMode}
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
                              <div className="flex flex-row gap-2 items-center">
                                <ParameterValueModal
                                  categoryCodeData={item}
                                  header="Update Tipe Klien"
                                  description="Masukan Nama Tipen Klien yang ditentukan"
                                  label="Tipe Klien"
                                  placeholder="CONTOH : PT, CV, Warung"
                                  lookup_code="CLIENTS_TYPE"
                                  onSubmit={handleEditValueCode}
                                  parameterValue={parameterValue}
                                  setValueForms={setParameterValue}
                                  isEdit={true}
                                  children={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-0"
                                    >
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                  }
                                />
                                <ConfirmModal
                                  title="Hapus Tipe Klien"
                                  description={`Apakah kamu yakin ingin menghapus Tipe Klien${" "}<b>${
                                    item.value
                                  }</b>? Tindakan ini tidak dapat dibatalkan.`}
                                  confirmText="Iya"
                                  cancelText="Batal"
                                  variant="outline"
                                  showIcon={false}
                                  useHTML
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                    >
                                      <Trash2 />
                                    </Button>
                                  }
                                  onConfirm={() =>
                                    handleDeleteCategory(item.lookup_value_id)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Address & Location */}
                <div className="space-y-6">
                  {/* Alamat */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Masukkan alamat lengkap"
                      value={formData.address}
                      onChange={handleChange}
                      rows={4}
                      disabled={!isEditMode}
                    />
                  </div>

                  {/* Metode Lokasi - WAJIB */}
                  <div className="space-y-4">
                    <Label className="text-foreground">
                      Metode Input Lokasi{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={locationMethod}
                      onValueChange={(value: "auto" | "manual") =>
                        handleLocationMethodChange(value)
                      }
                      className="flex space-x-4"
                      disabled={!isEditMode}
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

                  {/* Input Lokasi - WAJIB */}
                  {locationMethod === "auto" ? (
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Koordinat Lokasi (Auto){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        {isEditMode ? (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleGetLocation}
                              disabled={isGettingLocation || !isEditMode}
                            >
                              {isGettingLocation
                                ? "Mendapatkan Lokasi..."
                                : "Dapatkan Lokasi Saya"}
                            </Button>
                            {coords.lat && coords.lng && (
                              <span className="text-sm text-green-600 font-medium">
                                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                              </span>
                            )}
                            {!coords.lat && !coords.lng && (
                              <span className="text-sm text-red-500">
                                Lokasi belum didapatkan
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {coords.lat && coords.lng
                              ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(
                                  5
                                )}`
                              : "Lokasi tidak tersedia"}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="lat" className="text-foreground">
                          Latitude <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lat"
                          name="lat"
                          placeholder="Masukkan Latitude"
                          value={formData.lat}
                          onChange={handleChange}
                          disabled={!isEditMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="long" className="text-foreground">
                          Longitude <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="long"
                          name="long"
                          placeholder="Masukkan Longitude"
                          value={formData.long}
                          onChange={handleChange}
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tombol Lihat di Maps */}
                  {(coords.lat && coords.lng) ||
                  (formData.lat && formData.long) ? (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openInMaps}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Lihat di Google Maps
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Validation Info */}
              {isEditMode && (
                <div className="p-4 bg-card border  rounded-md">
                  <p className="text-sm text-card-foreground">
                    💡 <strong>Info:</strong> Isi minimal salah satu dari:{" "}
                    <strong>Nama</strong>, <strong>Email</strong>,{" "}
                    <strong>Telepon</strong>, atau <strong>Foto Profil</strong>{" "}
                    dan{" "}
                    <strong className="text-red-600">
                      wajib mengisi Lokasi
                    </strong>
                  </p>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button
                  type="button"
                  onClick={handleCreatePO}
                  disabled={isLoading}
                  variant="secondary"
                  className="min-w-48"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Pesanan
                </Button>
                {isEditMode ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="min-w-24"
                    >
                      {isLoading ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Kembali
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal Lihat Gambar */}
      <Dialog open={isViewImageOpen} onOpenChange={setIsViewImageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Foto Profil</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {profileImage && (
              <img
                src={profileImage}
                alt="Preview Foto Profil"
                className="max-w-full max-h-96 rounded-lg object-contain"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsViewImageOpen(false)}>
              Tutup
            </Button>
            {isEditMode && (
              <Button
                onClick={() => {
                  setIsViewImageOpen(false);
                  document.getElementById("profileUpload")?.click();
                }}
              >
                Ganti Foto
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
