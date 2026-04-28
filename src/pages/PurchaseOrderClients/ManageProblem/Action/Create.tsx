"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";

// Mock API function
const apiCreateSubmission = async (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { id: "SUB-" + Date.now() } });
    }, 1000);
  });
};

interface FormItem {
  id: string;
  product_id: string;
  product_detail_id: string;
  product_unit_id: string;
  adjustment_type: string;
  adjustment_quantity: string;
  reason: string;
}

interface ProductData {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  product_name: string;
  product_description?: string;
  unit_code: string;
  variant?: string;
  color?: string;
}

export default function CreateProductManageFixingOrderClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getPurchaseOrderClientProducts,
    createPurchaseOrderClientProblemProduct,
  } = usePurchaseOrderClients();

  const purchaseOrderClientId = location.state?.purchase_order_client_id || "";

  // State utama
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State untuk data produk
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);

  // State form
  const [formData, setFormData] = useState({
    purchase_order_client_id: purchaseOrderClientId,
    problem_product_take_by: "N",
    items: [] as FormItem[],
  });

  // Fetch semua data produk saat komponen mount
  useEffect(() => {
    if (purchaseOrderClientId) {
      loadAllProducts();
    }
  }, [purchaseOrderClientId]);

  const loadAllProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseOrderClientProducts({
        product_id: null,
        product_detail_id: null,
        purchase_order_client_id: purchaseOrderClientId,
      });

      if (response.status && response.data) {
        setAvailableProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi helper untuk mendapatkan data berdasarkan kriteria
  const getUniqueProducts = useCallback(() => {
    // Dapatkan produk unik berdasarkan product_id
    const uniqueProducts = availableProducts.reduce((acc, product) => {
      const exists = acc.some((item) => item.product_id === product.product_id);
      if (!exists) {
        acc.push({
          product_id: product.product_id,
          product_name: product.product_name,
          product_description: product.product_description,
        });
      }
      return acc;
    }, [] as { product_id: number; product_name: string; product_description?: string }[]);

    return uniqueProducts;
  }, [availableProducts]);

  const getProductDetails = useCallback(
    (productId: string) => {
      if (!productId) return [];

      const filtered = availableProducts.filter(
        (product) => product.product_id.toString() === productId
      );

      // Buat unique details berdasarkan product_detail_id
      const uniqueDetails = filtered.reduce((acc, product) => {
        const exists = acc.some(
          (item) => item.product_detail_id === product.product_detail_id
        );
        if (!exists) {
          acc.push({
            product_detail_id: product.product_detail_id,
            product_id: product.product_id,
            product_description: product.product_description || "",
            variant: product.variant || "Standard",
            color: product.color || "Default",
            displayName: `${product.variant || "Standard"} (${
              product.color || "Default"
            })`,
          });
        }
        return acc;
      }, [] as any[]);

      return uniqueDetails;
    },
    [availableProducts]
  );

  const getProductUnits = useCallback(
    (productId: string, productDetailId: string) => {
      if (!productId || !productDetailId) return [];

      const filtered = availableProducts.filter(
        (product) =>
          product.product_id.toString() === productId &&
          product.product_detail_id.toString() === productDetailId
      );

      // Buat unique units berdasarkan product_unit_id
      const uniqueUnits = filtered.reduce((acc, product) => {
        const exists = acc.some(
          (item) => item.product_unit_id === product.product_unit_id
        );
        if (!exists) {
          acc.push({
            product_unit_id: product.product_unit_id,
            unit_code: product.unit_code,
          });
        }
        return acc;
      }, [] as any[]);

      return uniqueUnits;
    },
    [availableProducts]
  );

  // Handler untuk form items
  const addItem = () => {
    const newItem: FormItem = {
      id: `item-${Date.now()}`,
      product_id: "",
      product_detail_id: "",
      product_unit_id: "",
      adjustment_type: "",
      adjustment_quantity: "",
      reason: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const updateItem = (itemId: string, field: keyof FormItem, value: string) => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      );

      // Jika product_id berubah, reset detail_id dan unit_id
      if (field === "product_id" && value) {
        const itemIndex = updatedItems.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            product_detail_id: "",
            product_unit_id: "",
          };
        }
      }

      // Jika product_detail_id berubah, reset unit_id
      if (field === "product_detail_id" && value) {
        const itemIndex = updatedItems.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            product_unit_id: "",
          };
        }
      }

      return {
        ...prev,
        items: updatedItems,
      };
    });

    // Clear error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`items.${itemId}.${field}`];
      return newErrors;
    });
  };

  // Handler untuk problem product
  const handleProblemProductChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      problem_product_take_by: value,
    }));
  };

  // Validasi form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.purchase_order_client_id) {
      newErrors.purchase_order_client_id =
        "Purchase Order Client ID is required";
    }

    if (!formData.problem_product_take_by) {
      newErrors.problem_product_take_by = "Problem product take by is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item) => {
        if (!item.product_id) {
          newErrors[`items.${item.id}.product_id`] = "Product is required";
        }
        if (!item.product_detail_id) {
          newErrors[`items.${item.id}.product_detail_id`] =
            "Product detail is required";
        }
        if (!item.product_unit_id) {
          newErrors[`items.${item.id}.product_unit_id`] =
            "Product unit is required";
        }
        if (!item.adjustment_type) {
          newErrors[`items.${item.id}.adjustment_type`] =
            "Adjustment type is required";
        }
        if (
          !item.adjustment_quantity ||
          Number(item.adjustment_quantity) <= 0
        ) {
          newErrors[`items.${item.id}.adjustment_quantity`] =
            "Valid adjustment quantity is required";
        }
        if (!item.reason.trim()) {
          newErrors[`items.${item.id}.reason`] = "Reason is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiData = {
        purchase_order_client_id: formData.purchase_order_client_id,
        problem_product_take_by: formData.problem_product_take_by,
        items: formData.items.map((item) => ({
          product_id: Number(item.product_id),
          product_detail_id: Number(item.product_detail_id),
          product_unit_id: Number(item.product_unit_id),
          adjustment_type: item.adjustment_type,
          adjustment_quantity: Number(item.adjustment_quantity),
          reason: item.reason,
        })),
      };

      const response = await createPurchaseOrderClientProblemProduct(apiData);
      if (response.status) {
        toast.success("Pengajuan Pengembalian Berhasil Terkirim!");
        navigate("/manage-adjusment-products", {
          state: { purchase_order_client_id: purchaseOrderClientId },
        });
      } else {
        toast.warning("Pengajuan Pengembalian Gagal Terkirim!");
      }
    } catch (error) {
      console.error("Error creating submission:", error);
      toast.error("Failed to create submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Helper untuk mendapatkan error
  const getError = (field: string) => {
    return errors[field];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Buat Pengajuan Pengembalian
            </h1>
            <p className="text-muted-foreground">
              Buat Pengajuan Pengembalian Produk
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Formulir Pengembalian</span>
            <Badge variant="outline">
              {formData.items.length}{" "}
              {formData.items.length === 1 ? "Item" : "Items"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_order_client_id">Nama Klien</Label>
                <Input
                  id="purchase_order_client_id"
                  value={location?.state?.client_name}
                  readOnly
                />
                {getError("purchase_order_client_id") && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {getError("purchase_order_client_id")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem_product_take_by">
                  Apakah barang sudah diambil dari klien?
                </Label>
                <Select
                  value={formData.problem_product_take_by}
                  onValueChange={handleProblemProductChange}
                >
                  <SelectTrigger id="problem_product_take_by">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y">
                      ✅ Ya, barang sudah diambil
                    </SelectItem>
                    <SelectItem value="N">
                      ❌ Belum, barang masih pada klien
                    </SelectItem>
                  </SelectContent>
                </Select>
                {getError("problem_product_take_by") && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {getError("problem_product_take_by")}
                  </p>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Items</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadAllProducts}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    Reload Products
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>
              </div>

              {getError("items") && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {getError("items")}
                  </p>
                </div>
              )}

              {formData.items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Belum ada item yang ditambahkan
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambahkan Item Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <Card key={item.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary">Item {index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Product */}
                          <div className="space-y-2">
                            <Label>Produk *</Label>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) =>
                                updateItem(item.id, "product_id", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Produk" />
                              </SelectTrigger>
                              <SelectContent>
                                {getUniqueProducts().map((product) => (
                                  <SelectItem
                                    key={product.product_id}
                                    value={product.product_id.toString()}
                                  >
                                    {product.product_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getError(`items.${item.id}.product_id`) && (
                              <p className="text-sm text-red-500">
                                {getError(`items.${item.id}.product_id`)}
                              </p>
                            )}
                          </div>

                          {/* Product Detail - TAMPILKAN product_description di sini */}
                          <div className="space-y-2">
                            <Label>Deskripsi *</Label>
                            <Select
                              value={item.product_detail_id}
                              onValueChange={(value) =>
                                updateItem(item.id, "product_detail_id", value)
                              }
                              disabled={!item.product_id}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    !item.product_id
                                      ? "Pertama Pilih Produk"
                                      : "Pilih Deskripsi"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {getProductDetails(item.product_id).map(
                                  (detail) => (
                                    <SelectItem
                                      key={detail.product_detail_id}
                                      value={detail.product_detail_id.toString()}
                                    >
                                      {detail.product_description &&
                                        detail.product_description}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            {getError(`items.${item.id}.product_detail_id`) && (
                              <p className="text-sm text-red-500">
                                {getError(`items.${item.id}.product_detail_id`)}
                              </p>
                            )}
                          </div>

                          {/* Product Unit */}
                          <div className="space-y-2">
                            <Label>Unit *</Label>
                            <Select
                              value={item.product_unit_id}
                              onValueChange={(value) =>
                                updateItem(item.id, "product_unit_id", value)
                              }
                              disabled={!item.product_detail_id}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    !item.product_detail_id
                                      ? "Pertama Pilih Deskripsi"
                                      : "Pilih Unit"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {getProductUnits(
                                  item.product_id,
                                  item.product_detail_id
                                ).map((unit) => (
                                  <SelectItem
                                    key={unit.product_unit_id}
                                    value={unit.product_unit_id.toString()}
                                  >
                                    {unit.unit_code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getError(`items.${item.id}.product_unit_id`) && (
                              <p className="text-sm text-red-500">
                                {getError(`items.${item.id}.product_unit_id`)}
                              </p>
                            )}
                          </div>

                          {/* Adjustment Type */}
                          <div className="space-y-2">
                            <Label>Tipe Pengembalian *</Label>
                            <Select
                              value={item.adjustment_type}
                              onValueChange={(value) =>
                                updateItem(item.id, "adjustment_type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Tipe Pengembalian" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="REFUND">Refund</SelectItem>
                                <SelectItem value="RETURN">Return</SelectItem>
                                <SelectItem value="TAKE_OUT">
                                  Pengambilan
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {getError(`items.${item.id}.adjustment_type`) && (
                              <p className="text-sm text-red-500">
                                {getError(`items.${item.id}.adjustment_type`)}
                              </p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="space-y-2">
                            <Label>Pengembalian Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.adjustment_quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "adjustment_quantity",
                                  e.target.value
                                )
                              }
                              placeholder="Masukan Quantity"
                            />
                            {getError(
                              `items.${item.id}.adjustment_quantity`
                            ) && (
                              <p className="text-sm text-red-500">
                                {getError(
                                  `items.${item.id}.adjustment_quantity`
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mt-4 space-y-2">
                          <Label>Alasan Pengembalian *</Label>
                          <Textarea
                            value={item.reason}
                            onChange={(e) =>
                              updateItem(item.id, "reason", e.target.value)
                            }
                            placeholder="Masukan Alasan : Barang Sudah Exp.."
                            rows={2}
                          />
                          {getError(`items.${item.id}.reason`) && (
                            <p className="text-sm text-red-500">
                              {getError(`items.${item.id}.reason`)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || formData.items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
