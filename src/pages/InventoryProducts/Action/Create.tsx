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
import { useNavigate } from "react-router-dom";
import { Save, Upload, X, ImagePlus, Trash2 } from "lucide-react";
import {
  ProductsInventoryDetailField,
  useProducts,
} from "@/contexts/Products.Context";
import { useAuth } from "@/contexts/Auth.Context";
import PriceInput from "@/components/ui/PriceInput";
import { UomModal } from "./UomModal";
import { FormStateValueCode, useParameter } from "@/contexts/Parameter.context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useCategories } from "@/contexts/Categories.Context";

type CreateForm = Omit<ProductsInventoryDetailField, "total_quantity"> & {
  total_quantity: number | null;
};

export default function CreateInventoryStock() {
  const navigate = useNavigate();
  const { createInventory } = useProducts();
  const { toast } = useToast();
  const { categories, getCategories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<CreateForm>({
    code: null,
    product_name: null,
    product_description: null,
    name: null,
    product_detail_id: null,
    product_id: null,
    hpp: 0,
    price: 0,
    product_unit_id: null,
    total_quantity: null,
    unit_code: null,
    category_id: null,
    status: "LIVE",
    path: null,
    is_best_seller: false,
  });

  // Image preview state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    addValueCode,
    deleteValueCode,
    getValueCode,
    updateValueCode,
    valueCode,
  } = useParameter();

  const [uomForms, setUomForms] = useState<FormStateValueCode>({
    lookup_code: "UOM",
    lookup_value_code: "",
    value: "",
    description: "",
  });

  useEffect(() => {
    getValueCode({ size: 1000, page: 1, lookup_code: "UOM" });
    getCategories({ page: 1, size: 100, search: "" });
  }, []);

  // ── Image handling ──────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.product_name?.trim()) {
      toast({ title: "Gagal", description: "Nama produk harus diisi", variant: "destructive" });
      return;
    }
    if (!form.product_description?.trim()) {
      toast({ title: "Gagal", description: "Deskripsi produk harus diisi", variant: "destructive" });
      return;
    }
    if (!form.unit_code) {
      toast({ title: "Gagal", description: "Satuan harus dipilih", variant: "destructive" });
      return;
    }
    if (!form.category_id) {
      toast({ title: "Gagal", description: "Kategori harus dipilih", variant: "destructive" });
      return;
    }
    if (!form.hpp) {
      toast({ title: "Gagal", description: "Harga pokok tidak boleh kosong", variant: "destructive" });
      return;
    }
    if (form.total_quantity !== null && form.total_quantity < 0) {
      toast({ title: "Gagal", description: "Quantity tidak boleh negatif", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createInventory({
        name: form.product_name,
        description: form.product_description,
        unit_code: form.unit_code,
        hpp: form.hpp,
        price: form.price || 0,
        total_quantity: form.total_quantity ?? 0,
        category_id: form.category_id,
        status: form.status || "LIVE",
        is_best_seller: form.is_best_seller ?? false,
        path: imageFiles.length > 0 ? imageFiles : undefined,
      });

      if (response?.status) {
        toast({ title: "Berhasil", description: "Produk berhasil dibuat" });
        navigate(-1);
      } else {
        const errorMessages = Array.isArray(response?.messages)
          ? response.messages.map((m: any) => m.message).join(", ")
          : response?.messages || "Gagal membuat produk";
        toast({
          title: "Gagal",
          description: errorMessages,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat membuat produk", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setForm({
      code: null,
      product_name: null,
      product_description: null,
      name: null,
      product_detail_id: null,
      product_id: null,
      product_unit_id: null,
      hpp: 0,
      price: 0,
      total_quantity: null,
      unit_code: null,
      category_id: null,
      status: "LIVE",
      path: null,
      is_best_seller: false,
    });
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
  };

  const { user } = useAuth();
  const isFinance = user?.responsibilities?.some((role) => role.code === "FINANCE");
  const isPurchasing = user?.responsibilities?.some((role) => role.code === "PURCHASING");

  // ── UOM handlers ──────────────────────────────────────────────────
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat menghapus satuan.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-4/5">
          <h1 className="text-3xl font-bold text-foreground">Tambah Produk Baru</h1>
          <p className="text-muted-foreground">Buat produk inventory baru</p>
        </div>

        <div className="flex gap-2">
          <UomModal
            onSubmit={handleCategorySubmit}
            uomForms={uomForms}
            setValueForms={setUomForms}
            children={<Button variant="outline">Tambah Satuan</Button>}
          />
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name & Description */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product_name">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_name"
                  value={form.product_name || ""}
                  onChange={(e) => handleInputChange("product_name", e.target.value)}
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <RichTextEditor
                  value={form.product_description || ""}
                  onChange={(html) => handleInputChange("product_description", html)}
                  placeholder="Tulis deskripsi produk di sini..."
                />
              </div>
            </div>

            {/* Category & Unit */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.category_id?.toString() || ""}
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
                  Jumlah Stok Awal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="total_quantity"
                  type="number"
                  value={form.total_quantity ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    handleInputChange("total_quantity", raw === "" ? null : parseInt(raw, 10));
                  }}
                  min={0}
                  placeholder="Masukkan jumlah stok awal"
                />
                <p className="text-sm text-muted-foreground">Stok awal akan ditambahkan ke inventory</p>
              </div>

              <div className="space-y-2">
                <Label>Status Produk</Label>
                <Select
                  value={form.status || "LIVE"}
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
              />
            </div>

            {/* Price Information */}
            <div className="grid gap-4 md:grid-cols-2">
              {isPurchasing && (
                <div className="space-y-2">
                  <Label htmlFor="hpp">
                    Harga Modal (HPP) <span className="text-red-500">*</span>
                  </Label>
                  <PriceInput
                    value={form.hpp || null}
                    onChange={(val) => handleInputChange("hpp", val)}
                    readOnly={false}
                  />
                </div>
              )}
              {isFinance && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Harga Jual <span className="text-red-500">*</span>
                  </Label>
                  <PriceInput
                    value={form.price || null}
                    onChange={(val) => handleInputChange("price", val)}
                    readOnly={false}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/5 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-8 w-8 text-primary/50" />
              <p className="text-sm text-muted-foreground text-center">
                Klik untuk upload foto produk
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

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-24 object-cover rounded-lg border border-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Belum ada foto dipilih
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
