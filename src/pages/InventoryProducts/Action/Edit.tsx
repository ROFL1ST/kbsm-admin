"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useFinance,
  FormStateFinanceInOut,
  FormStateFinanceEdit,
} from "@/contexts/Finance.context";
import PriceInput from "@/components/ui/PriceInput";
import {
  Upload,
  Edit,
  Save,
  X,
  Trash2,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import {
  ProductsInventoryDetailField,
  ProductsInventoryField,
  useProducts,
} from "@/contexts/Products.Context";
import { useAuth } from "@/contexts/Auth.Context";
import { UomModal } from "./UomModal";
import { FormStateValueCode, useParameter } from "@/contexts/Parameter.context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
// import { useVendors } from "@/contexts/Vendors.Context";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

export default function EditInventoryStock() {
  const navigate = useNavigate();
  const [uomForms, setUomForms] = useState<FormStateValueCode>({
    lookup_code: "UOM",
    lookup_value_code: "",
    value: "",
    description: "",
  });
  const [localSearch, setLocalSearch] = useState("");

  const debouncedSearch = useDebounce(localSearch, 300);
  const { updateInventory, getInventoryDetail } = useProducts();
  const { toast } = useToast();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
    vendor_id: null,
  });
  const [originalForm, setOriginalForm] =
    useState<ProductsInventoryDetailField | null>(null);

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
        vendor_id: form?.vendor_id,
        price: form?.price || 0,
        quantity: form?.total_quantity,
      });
      if (response.status) {
        toast({
          title: "Berhasil",
          description: "Produk berhasil diperbarui",
        });
        setIsEditMode(false);
        setOriginalForm(form);
      } else {
        toast({
          title: "Gagal",
          description: response.messages || "Gagal memperbarui Produk",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat memperbarui Produk",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ProductsInventoryDetailField,
    value: any,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit mode, revert to original values
      if (originalForm) {
        setForm(originalForm);
      }
      setIsEditMode(false);
    } else {
      // Enter edit mode, save original values
      setOriginalForm(form);
      setIsEditMode(true);
    }
  };

  useEffect(() => {
    fetchDetailProduct();
  }, []);

  const fetchDetailProduct = async () => {
    try {
      const response = await getInventoryDetail({
        product_unit_id: location?.state,
      });
      if (response.status) {
        setForm(response.data);
        setOriginalForm(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat detail produk",
        variant: "destructive",
      });
    }
  };
  const { user } = useAuth();
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Handle category submit
   * @returns {Promise<void>}
   */
  /*******  529ac62f-fbde-41db-8060-7d0df268a5aa  *******/ const isFinance =
    user?.responsibilities?.some((role) => role.code === "FINANCE");
  const isPurchasing = user?.responsibilities?.some(
    (role) => role.code === "PURCHASING",
  );
  const {
    addValueCode,
    deleteValueCode,
    getValueCode,
    updateValueCode,
    valueCode,
  } = useParameter();
  // const { vendors, getVendors } = useVendors();
  const handleCategorySubmit = async () => {
    try {
      const newForm = {
        ...uomForms,
        description: uomForms?.value,
        lookup_value_code: uomForms?.value.toUpperCase().replace(/\s+/g, "_"),
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
          lookup_code: "UOM",
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
          size: 1000,
          page: 1,
          lookup_code: "UOM",
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
        toast({
          title: "Berhasil",
          description: `Kategori berhasil diperbarui.`,
          variant: "default",
        });
        getValueCode({
          size: 100,
          page: 1,
          lookup_code: "UOM",
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
  // const handleGetVendors = async (params) => {
  //   getVendors(params);
  // };
  useEffect(() => {
    getValueCode({
      size: 1000,
      page: 1,
      lookup_code: "UOM",
    });
    // handleGetVendors({
    //   page: 1,
    //   size: 10,
    //   search: debouncedSearch,
    // });
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-4/5">
          <h1 className="text-3xl font-bold text-foreground">
            {form?.product_name}
          </h1>
          <p className="text-muted-foreground">kelola produk</p>
        </div>

        {/* Edit Mode Toggle Button */}
        <div className="flex gap-2">
          <UomModal
            onSubmit={handleCategorySubmit}
            uomForms={uomForms}
            setValueForms={setUomForms}
            children={<Button variant="outline">Tambah Satuan</Button>}
          />
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleEditToggle}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditToggle}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Mode Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Informasi Produk
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Product Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Produk</Label>
                <Input
                  id="code"
                  value={form.code || ""}
                  disabled
                  placeholder="Kode produk"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Produk{" "}
                  {isEditMode && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="name"
                  value={form.product_name || ""}
                  onChange={(e) =>
                    handleInputChange("product_name", e.target.value)
                  }
                  disabled={!isEditMode}
                  placeholder="Nama produk"
                />
              </div>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi Produk{" "}
                {isEditMode && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="product_description"
                disabled={!isEditMode}
                value={form.product_description || ""}
                onChange={(e) =>
                  handleInputChange("product_description", e.target.value)
                }
                placeholder="Masukkan Deskripsi Produk"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Satuan</Label>
                <Select
                  value={form.unit_code}
                  disabled={!isEditMode}
                  onValueChange={(val) => handleInputChange("unit_code", val)}
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
                            title="Hapus Pesanan"
                            description={`Apakah kamu yakin ingin menghapus pemasukan${" "}<b>${
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
              {/* <div className="space-y-2 w-full">
                <label>Vendor</label>
                <Select
                  value={form.vendor_id?.toString() || ""}
                  disabled={!isEditMode}
                  onValueChange={(value) => {
                    const selectedVendor = vendors.find(
                      (v) => v.id.toString() === value,
                    );
                    if (selectedVendor) {
                      handleInputChange("vendor_id", selectedVendor.id);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Cari Vendor..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.name}
                      </SelectItem>
                    ))}

                    {vendors.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {localSearch
                          ? "Vendor tidak ditemukan"
                          : "Tidak ada vendor"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="total_quantity">
                  Jumlah Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="total_quantity"
                  type="text"
                  value={form.total_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "total_quantity",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  disabled={!isEditMode}
                  placeholder="Masukkan jumlah stok"
                />
                <p className="text-sm text-muted-foreground">
                  Stok saat ini: {form.total_quantity}
                </p>
              </div>
            </div>
            {/* Price Product Information */}
            <div className="grid gap-4 md:grid-cols-2">
              {isPurchasing && (
                <div className="space-y-2">
                  <Label htmlFor="hpp">Harga Modal Satuan</Label>
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
                    Harga Jual Satuan{" "}
                    {isEditMode && <span className="text-red-500">*</span>}
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
      </div>
    </div>
  );
}
