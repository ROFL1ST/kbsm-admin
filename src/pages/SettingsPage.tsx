import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  Globe,
  FileText,
  CreditCard,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/contexts/Company.Context";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { formatIDR } from "@/components/format/IDR";

interface FormStateCompany {
  company_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  image: string;
  pic_name: string;
  subdomain: string;
  npwp: string;
  nib: string;
}

export default function SettingsPage() {
  const { getDetailCompany, updateCompanyPage, company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("company");
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormStateCompany>({
    company_id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    image: "",
    pic_name: "",
    subdomain: "",
    npwp: "",
    nib: "",
  });

  // Update form when company data changes
  useEffect(() => {
    if (company) {
      setFormData({
        company_id: company.id?.toString() || "",
        name: company.name || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        image: company.image || "",
        pic_name: company.pic_name || "",
        subdomain: company.subdomain || "",
        npwp: company.npwp || "",
        nib: company.nib || "",
      });

      // Set preview image from company data
      if (company.image) {
        // Check if image is base64 or URL
        if (company.image.startsWith("data:image")) {
          setPreviewImage(company.image);
        } else {
          setPreviewImage(company.image);
        }
      }
    }
  }, [company]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      await getDetailCompany();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data perusahaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Error",
        description:
          "Format file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau SVG.",
        variant: "destructive",
      });
      return;
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Ukuran file terlalu besar. Maksimal 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);

      // Convert image to base64
      const base64Image = await convertToBase64(file);

      // Update form data with base64 string
      setFormData((prev) => ({
        ...prev,
        image: base64Image,
      }));

      // Set preview
      setPreviewImage(base64Image);

      toast({
        title: "Sukses",
        description: "Gambar berhasil diunggah",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengunggah gambar",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
    setPreviewImage("");

    toast({
      title: "Info",
      description: "Logo telah dihapus",
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        image: formData.image || "",
        company_id: company?.id,
      };

      await updateCompanyPage(submitData);
      loadCompanyData();

      toast({
        title: "Sukses",
        description: "Data perusahaan berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data perusahaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pengaturan Perusahaan
          </h1>
          <p className="text-muted-foreground">
            Kelola informasi dan pengaturan perusahaan
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2">
          <TabsTrigger value="company">Informasi Perusahaan</TabsTrigger>
          <TabsTrigger value="billing">Billing & Paket</TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informasi Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Perusahaan *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama perusahaan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain *</Label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center">
                        <span className="inline-flex items-center h-full px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          https://
                        </span>
                      </div>
                      <Input
                        id="subdomain"
                        name="subdomain"
                        disabled
                        value={formData.subdomain}
                        onChange={handleInputChange}
                        className="pl-24 pr-32 rounded-md" // Menambahkan padding kiri dan kanan untuk prefix dan suffix
                        placeholder="your-company"
                        required
                      />
                      <div className="absolute right-0 top-0 bottom-0 flex items-center">
                        <span className="inline-flex items-center h-full px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
                          .kelolasemuamudah.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Telepon
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Masukkan email perusahaan"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Alamat Perusahaan
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap perusahaan"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pic_name">
                      <User className="inline h-4 w-4 mr-1" />
                      PIC (Person In Charge)
                    </Label>
                    <Input
                      id="pic_name"
                      name="pic_name"
                      value={formData.pic_name}
                      onChange={handleInputChange}
                      placeholder="Nama penanggung jawab"
                    />
                  </div>

                  {/* Logo Perusahaan - Input File */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Logo Perusahaan</Label>
                    <div className="space-y-4">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />

                      {/* Preview Area */}
                      {previewImage ? (
                        <div className="relative">
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-md overflow-hidden border">
                                  <img
                                    src={previewImage}
                                    alt="Logo preview"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Logo terpilih
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Klik untuk mengganti
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeImage}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={triggerFileInput}
                            className="w-full mt-2"
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Ganti Logo
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={triggerFileInput}
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium mb-1">
                            Unggah Logo Perusahaan
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Klik untuk memilih file atau drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, GIF maks. 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="npwp">
                      <FileText className="inline h-4 w-4 mr-1" />
                      NPWP
                    </Label>
                    <Input
                      id="npwp"
                      name="npwp"
                      value={formData.npwp}
                      onChange={handleInputChange}
                      placeholder="Masukkan NPWP perusahaan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nib">
                      <FileText className="inline h-4 w-4 mr-1" />
                      NIB
                    </Label>
                    <Input
                      id="nib"
                      name="nib"
                      value={formData.nib}
                      onChange={handleInputChange}
                      placeholder="Masukkan NIB perusahaan"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label htmlFor="active">Status Perusahaan</Label>
                    <p className="text-sm text-muted-foreground">
                      Jika nonaktifkan tidak bisa Login di website{" "}
                      {company?.subdomain}
                      .kelolasemuamudah.com
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={company?.active || false}
                    disabled
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadCompanyData}
                    disabled={loading || uploadingImage}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Reset
                  </Button>
                  <Button type="submit" disabled={loading || uploadingImage}>
                    {(loading || uploadingImage) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Billing & Package */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informasi Billing & Paket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {company?.companyBilling ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Paket Berlangganan</Label>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="font-semibold text-lg">
                          {company.companyBilling.package}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Siklus Billing</Label>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="font-semibold text-lg capitalize">
                          {company.companyBilling.billing_cycle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Harga Paket</Label>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="font-semibold text-lg">
                          {formatIDR(company.companyBilling.price)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        PPN ({company.companyBilling.ppn_percentage}%)
                      </Label>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="font-semibold text-lg">
                          {formatIDR(company.companyBilling.percentage_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Pembayaran</Label>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <p className="font-bold text-lg text-primary">
                          {formatIDR(company.companyBilling.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Jatuh Tempo</Label>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="font-semibold text-lg">
                        {company.companyBilling.due_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Label>Status Pembayaran</Label>
                      <p className="text-sm text-muted-foreground">
                        Berdasarkan tanggal jatuh tempo
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          new Date(company.companyBilling.due_date) > new Date()
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          new Date(company.companyBilling.due_date) > new Date()
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {new Date(company.companyBilling.due_date) > new Date()
                          ? "Aktif"
                          : "Jatuh Tempo"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Tidak ada data billing tersedia
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline">Ubah Paket</Button>
                <Button>Riwayat Pembayaran</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
      </Tabs>
    </div>
  );
}
