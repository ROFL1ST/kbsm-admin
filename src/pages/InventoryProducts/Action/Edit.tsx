"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import PriceInput from "@/components/ui/PriceInput";
import { Upload, Edit, Save, X, Trash2, ImagePlus } from "lucide-react";
import {
  ProductsInventoryDetailField,
  useProducts,
} from "@/contexts/Products.Context";
import { useAuth } from "@/contexts/Auth.Context";
import { UomModal } from "./UomModal";
import { FormStateValueCode, useParameter } from "@/contexts/Parameter.context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useCategories } from "@/contexts/Categories.Context";

interface ProductPicture {
  id: number;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  path: string;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export default function EditInventoryStock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateInventory, getInventoryDetail } = useProducts();
  const { categories, getCategories } = useCategories();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [uomForms, setUomForms] = useState<FormStateValueCode>({
    lookup_code: "UOM",
    lookup_value_code: "",
    value: "",
    description: "",
  });

  const [form, setForm] = useState<ProductsInventoryDetailField>({
    code: null,
    product_name: null,
    product_description: null,
    name: null,
    product_detail_id: null,
    product_id: null,
    product_unit_id: null,
    total_quantity: 0,
    unit_code: null,
    hpp: 0,
    price: 0,
    category_id: null,
    status: "LIVE",
    path: null,
    is_best_seller: false,
  });
  const [originalForm, setOriginalForm] = useState<ProductsInventoryDetailField | null>(null);

  // Image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingPictures, setExistingPictures] = useState<ProductPicture[]>([]);
  // URLs of existing pictures the user wants to keep (starts as all, user can remove)
  const [keptPictureUrls, setKeptPictureUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    addValueCode,
    deleteValueCode,
    getValueCode,
    updateValueCode,
    valueCode,
  } = useParameter();

  useEffect(() => {
    getValueCode({ size: 1000, page: 1, lookup_code: "UOM" });
    getCategories({ page: 1, size: 100, search: "" });
    fetchDetailProduct();
  }, []);

  const fetchDetailProduct = async () => {
    try {
      const response = await getInventoryDetail({ product_unit_id: location?.state });
      if (response?.status) {
        const data = response.data;
        setForm({
          ...data,
          product_name: data.product_name ?? data.name ?? null,
          product_description: data.product_description ?? data.description ?? null,
          category_id: data.category_id ?? null,
          status: data.status ?? "LIVE",
          is_best_seller: data.is_best_seller ?? false,
        });
        setOriginalForm({
          ...data,
          product_name: data.product_name ?? data.name ?? null,
          product_description: data.product_description ?? data.description ?? null,
          category_id: data.category_id ?? null,
          status: data.status ?? "LIVE",
          is_best_seller: data.is_best_seller ?? false,
        });
        if (Array.isArray(data.pictures) && data.pictures.length > 0) {
          setExistingPictures(data.pictures);
          setKeptPictureUrls(data.pictures.map((p: ProductPicture) => p.path));
        } else {
          setExistingPictures([]);
          setKeptPictureUrls([]);
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat detail produk", variant: "destructive" });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (url: string) => {
    setKeptPictureUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await updateInventory({
        product_id: form?.product_id,
        product_detail_id: form?.product_detail_id,
        product_unit_id: location?.state,
        name: form?.product_name,
        description: form?.product_description,
        unit_code: form?.unit_code,
        hpp: form?.hpp,
        price: form?.price || 0,
        quantity: form?.total_quantity,
        category_id: form?.category_id,
        status: form?.status,
        is_best_seller: form?.is_best_seller ?? false,
        // New files (if any)
        path: imageFiles.length > 0 ? imageFiles : undefined,
        // Always send path_exst as array — empty array means "hapus semua existing"
        path_exst: keptPictureUrls,
      });

      if (response?.status) {
        toast({ title: "Berhasil", description: "Produk berhasil diperbarui" });
        setIsEditMode(false);
        setOriginalForm(form);
        setImageFiles([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        fetchDetailProduct();
      } else {
        const errorMessages = Array.isArray(response?.messages)
          ? response.messages.map((m: any) => m.message).join(", ")
          : response?.messages || "Gagal memperbarui Produk";
        toast({
          title: "Gagal",
          description: errorMessages,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat memperbarui Produk", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductsInventoryDetailField, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      if (originalForm) setForm(originalForm);
      setImageFiles([]);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      // Restore kept URLs back to all existing pictures
      setKeptPictureUrls(existingPictures.map((p) => p.path));
      setIsEditMode(false);
    } else {
      setOriginalForm(form);
      setIsEditMode(true);
    }
  };

  const { user } = useAuth();
  const isFinance = user?.responsibilities?.some((role) => role.code === "FINANCE");
  const isPurchasing = user?.responsibilities?.some((role) => role.code === "PURCHASING");

  // ── UOM handlers ──────────────────────────────────────────────────────────
  const handleCategorySubmit = async () => {
    try {
      const newForm = {
        ...uomForms,
        description: uomForms?.value,
        lookup_value_code: uomForms?.value.toUpperCase().replace(/\s+/g, "_"),
      };
      const res = await addValueCode(newForm);
      if (res.status) {
        toast({ title: "Berhasil", description: "Satuan baru berhasil ditambahkan." });
        getValueCode({ size: 1000, page: 1, lookup_code: "UOM" });
      } else {
        toast({ title: "Gagal", description: res?.messages || "Gagal menambahkan satuan.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan saat menambahkan satuan.", variant: "destructive" });
    }
  };

  const handleEditValueCode = async (item: any) => {
    try {
      const updatedForm = {
        lookup_value_id: item.lookup_value_id,
        lookup_value_code: uomForms?.value.toUpperCase().replace(/\s+/g, "_"),
        value: uomForms?.value,
        description: uomForms?.value,
        lookup_code: "UOM",
      };
      const res = await updateValueCode(updatedForm);
      if (res.status) {
        toast({ title: "Berhasil", description: "Satuan berhasil diperbarui." });
        getValueCode({ size: 1000, page: 1, lookup_code: "UOM" });
      } else {
        toast({ title: "Gagal", description: res?.messages || "Gagal memperbarui satuan.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan saat mengedit satuan.", variant: "destructive" });
    }
  };

  const handleDeleteUom = async (id: any) => {
    try {
      const res = await deleteValueCode(id);
      if (res.status) {
        toast({ title: "Berhasil", description: "Satuan berhasil dihapus." });
        getValueCode({ size: 1000, page: 1, lookup_code: "UOM" });
      } else {
        toast({ title: "Gagal", description: res?.messages || "Gagal menghapus satuan.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan saat menghapus satuan.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-4/5">
          <h1 className="text-3xl font-bold text-foreground">{form?.product_name || "Detail Produk"}</h1>
          <p className="text-muted-foreground">Kelola produk</p>
        </div>

        <div className="flex gap-2">
          <UomModal
            onSubmit={handleCategorySubmit}
            uomForms={uomForms}
            setValueForms={setUomForms}
            children={<Button variant="outline">Tambah Satuan</Button>}
          />
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={isLoading} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Mode Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Code */}
            <div className="space-y-2">
              <Label>Kode Produk</Label>
              <Input value={form.code || ""} disabled placeholder="Kode produk" />
            </div>

            {/* Name & Description */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Produk {isEditMode && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="name"
                  value={form.product_name || ""}
                  onChange={(e) => handleInputChange("product_name", e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Nama produk"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product_description">
                  Deskripsi {isEditMode && <span className="text-red-500">*</span>}
                </Label>
                <RichTextEditor
                  value={form.product_description || ""}
                  onChange={(html) => handleInputChange("product_description", html)}
                  placeholder="Tulis deskripsi produk di sini..."
                  readOnly={!isEditMode}
                />
              </div>
            </div>

            {/* Category & Unit */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category_id?.toString() || ""}
                  disabled={!isEditMode}
                  onValueChange={(val) => handleInputChange("category_id", Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Satuan</Label>
                <Select
                  value={form.unit_code || ""}
                  disabled={!isEditMode}
                  onValueChange={(val) => handleInputChange("unit_code", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {valueCode.map((item) => (
                      <div
                        key={item.lookup_value_code}
                        className="flex items-center justify-between px-2"
                      >
                        <SelectItem value={item.value} className="flex-1">
                          {item.value}
                        </SelectItem>
                        <div className="flex flex-row gap-2 items-center">
                          <UomModal
                            categoryCodeData={item}
                            onSubmit={handleEditValueCode}
                            uomForms={uomForms}
                            setValueForms={setUomForms}
                            isEdit={true}
                            children={
                              <Button variant="ghost" size="icon" className="p-0">
                                <Upload className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <ConfirmModal
                            title="Hapus Satuan"
                            description={`Apakah kamu yakin ingin menghapus satuan <b>${item.value}</b>?`}
                            confirmText="Iya"
                            cancelText="Batal"
                            variant="outline"
                            showIcon={false}
                            useHTML
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 />
                              </Button>
                            }
                            onConfirm={() => handleDeleteUom(item.lookup_value_id)}
                          />
                        </div>
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity & Status */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_quantity">
                  Jumlah Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="total_quantity"
                  type="number"
                  value={form.total_quantity}
                  onChange={(e) => handleInputChange("total_quantity", parseInt(e.target.value) || 0)}
                  disabled={!isEditMode}
                  placeholder="Masukkan jumlah stok"
                />
                <p className="text-sm text-muted-foreground">Stok saat ini: {form.total_quantity}</p>
              </div>

              <div className="space-y-2">
                <Label>Status Produk</Label>
                <Select
                  value={form.status || "LIVE"}
                  disabled={!isEditMode}
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">LIVE (Aktif)</SelectItem>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Best Seller Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Best Seller</Label>
                <p className="text-sm text-muted-foreground">
                  Tandai produk ini sebagai best seller
                </p>
              </div>
              <Switch
                checked={form.is_best_seller ?? false}
                onCheckedChange={(checked) => handleInputChange("is_best_seller", checked)}
                disabled={!isEditMode}
              />
            </div>

            {/* Price */}
            <div className="grid gap-4 md:grid-cols-2">
              {isPurchasing && (
                <div className="space-y-2">
                  <Label htmlFor="hpp">Harga Modal (HPP)</Label>
                  <PriceInput
                    value={form.hpp || null}
                    onChange={(val) => handleInputChange("hpp", val)}
                    readOnly={!isEditMode}
                  />
                </div>
              )}
              {isFinance && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Harga Jual {isEditMode && <span className="text-red-500">*</span>}
                  </Label>
                  <PriceInput
                    value={form.price || null}
                    onChange={(val) => handleInputChange("price", val)}
                    readOnly={!isEditMode}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing pictures — filtered by keptPictureUrls */}
            {keptPictureUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Foto saat ini</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingPictures
                    .filter((pic) => keptPictureUrls.includes(pic.path))
                    .map((pic) => (
                      <div key={pic.id} className="relative group">
                        <img
                          src={pic.path}
                          alt={`product-${pic.id}`}
                          className="w-full h-24 object-cover rounded-lg border border-primary/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(pic.path)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upload area (only in edit mode) */}
            {isEditMode && (
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-7 w-7 text-primary/50" />
                <p className="text-sm text-muted-foreground text-center">
                  Upload foto baru
                  <br />
                  <span className="text-xs">Bisa multiple gambar</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {/* New image previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Foto baru</p>
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        className="w-full h-24 object-cover rounded-lg border border-primary/10"
                      />
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {keptPictureUrls.length === 0 && imagePreviews.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">Belum ada foto produk</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
