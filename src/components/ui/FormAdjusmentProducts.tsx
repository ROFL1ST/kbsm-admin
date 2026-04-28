// perbaiki code dipage update ,kenapa form produk,deskripsi dan unit tidak ada coba perbaiki handle handleDetailProduct
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
  XCircle,
  CheckCircle,
  Image,
  FileText,
  Upload,
} from "lucide-react";

import {
  GetDetailPurchaseOrderClientProblemKey,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import { dateTimeNow } from "@/components/format/Date";
import { useToast } from "@/hooks/use-toast";

interface FormItem {
  id: string;
  product_id: string;
  product_detail_id: string;
  product_unit_id: string;
  adjustment_type: string;
  adjustment_quantity: string;
  updated_at_warehouse: string | null;
  reason_warehouse: string | null;
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

export const FormAdjustmentProducts = ({
  purchase_order_client_id,
  purchase_order_client_problem_id,
}: {
  purchase_order_client_id: string;
  purchase_order_client_problem_id: string;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    getPurchaseOrderClientProducts,
    updatePurchaseOrderClientProblemProduct,
    getPurchaseOrderClientProblemProductDetail,
  } = usePurchaseOrderClients();

  // State utama
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [warehouseApproved, setWarehouseApproved] = useState(false);
  const [detailProblem, setDetailProblem] = useState({
    problem_product_take_by_name: "",
    received_warehouse_by_name: null,
    received_warehouse_date: "",
    client_name: "",
    created_at: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [proofWarehouseReceived, setProofWarehouseReceived] = useState(null);
  // State untuk data produk
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);

  // State form
  const [formData, setFormData] = useState({
    purchase_order_client_id: purchase_order_client_id,
    problem_product_take_by: "N",
    received_warehouse_proof: null,
    items: [] as FormItem[],
  });

  // Fetch semua data produk saat komponen mount
  useEffect(() => {
    if (purchase_order_client_id) {
      loadAllProducts();
      if (purchase_order_client_problem_id) {
        handleDetailProduct();
      }
    }
  }, [purchase_order_client_id, purchase_order_client_problem_id]);

  const loadAllProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseOrderClientProducts({
        product_id: null,
        product_detail_id: null,
        purchase_order_client_id: purchase_order_client_id,
      });

      if (response.status && response.data) {
        setAvailableProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
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
  const getFileIcon = () => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-6 w-6 text-green-600" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-600" />;
    }
    return <FileText className="h-6 w-6 text-green-600" />;
  };
  const getFileTypeLabel = () => {
    if (fileType.startsWith("image/")) {
      return "Gambar";
    } else if (fileType === "application/pdf") {
      return "PDF";
    }
    return "File";
  };
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String); // Mengembalikan full data URL
      };
      reader.onerror = (error) => reject(error);
    });
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format file tidak didukung",
          description:
            "Hanya file gambar (JPEG, PNG, GIF, WEBP) dan PDF yang diperbolehkan",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      true;
      try {
        const base64DataUrl = await convertFileToBase64(file);
        setProofWarehouseReceived(base64DataUrl);
        setFileName(file.name);
        setFileType(file.type);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast({
          title: "Gagal memproses file",
          description: "Terjadi kesalahan saat memproses file",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleRemoveFile = () => {
    setProofWarehouseReceived("");
    setFileName("");
    setFileType("");
  };
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
      reason_warehouse: null,
      updated_at_warehouse: null,
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
      toast({
        title: "Gagal",
        variant: "destructive",
        description: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const apiData = {
        purchase_order_client_id: formData.purchase_order_client_id,
        purchase_order_client_problem_id: purchase_order_client_problem_id,
        problem_product_take_by: formData.problem_product_take_by,
        received_warehouse_proof: proofWarehouseReceived,
        items: formData.items.map((item) => ({
          product_id: Number(item.product_id),
          product_detail_id: Number(item.product_detail_id),
          product_unit_id: Number(item.product_unit_id),
          adjustment_type: item.adjustment_type,
          adjustment_quantity: Number(item.adjustment_quantity),
          reason: item.reason,
          reason_warehouse: item.reason_warehouse,
          updated_at_warehouse: item.updated_at_warehouse,
        })),
      };

      const response = await updatePurchaseOrderClientProblemProduct(apiData);
      if (response.status) {
        toast({
          title: "Berhasil",
          variant: "default",
          description: "Pengajuan Pengembalian Berhasil Terkirim!",
        });
        navigate("/manage-adjusment-products", {
          state: purchase_order_client_id,
        });
      } else {
        toast({
          title: "Gagal",
          variant: "destructive",
          description: "Pengajuan Pengembalian Gagal Terkirim!",
        });
      }
    } catch (error) {
      console.error("Error creating submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // FIXED: handle detail
  const handleDetailProduct = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseOrderClientProblemProductDetail({
        purchase_order_client_id: purchase_order_client_id,
        purchase_order_client_problem_id: purchase_order_client_problem_id,
      });

      if (response.status && response.data) {
        const data = response.data;

        // Debug logging untuk melihat struktur response

        // Perbaikan mapping data
        const items =
          data.items?.map((item: any, index: number) => ({
            id: `item-${Date.now()}-${index}`, // Generate unique ID
            product_id: item.product_id?.toString() || "",
            product_detail_id: item.product_detail_id?.toString() || "",
            product_unit_id: item.product_unit_id?.toString() || "",
            adjustment_type: item.adjustment_type || "",
            adjustment_quantity: item.adjustment_quantity?.toString() || "",
            updated_at_warehouse: item.updated_at_warehouse,
            reason_warehouse: item.reason_warehouse,
            reason: item.reason || "",
          })) || [];
        const isReceivedProved = data.items.every(
          (item) =>
            item.reason_warehouse == null && item.updated_at_warehouse !== null
        );
        setWarehouseApproved(isReceivedProved);
        setDetailProblem(data);
        setProofWarehouseReceived(data?.received_warehouse_proof);
        setFormData({
          purchase_order_client_id:
            data.purchase_order_client_id || purchase_order_client_id,
          problem_product_take_by:
            data.problem_product_take_by === "N" ? "N" : "Y",
          received_warehouse_proof: data?.received_warehouse_proof,
          items: items,
        });

        toast({
          title: "Berhasil",
          description: "Data loaded successfully",
        });
      } else {
      }
    } catch (error) {
      console.error("Error loading detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk mendapatkan error
  const getError = (field: string) => {
    return errors[field];
  };
  //   Function Date
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: id });
    } catch {
      return dateString;
    }
  };
  return (
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
              <Label htmlFor="client_name">Nama Klien</Label>
              <Input
                id="client_name"
                value={detailProblem.client_name}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem_product_take_by">
                Apakah barang sudah diambil dari klien?
              </Label>
              <Select
                value={formData.problem_product_take_by}
                onValueChange={handleProblemProductChange}
                disabled={warehouseApproved}
              >
                <SelectTrigger id="problem_product_take_by">
                  <SelectValue placeholder={"Pilih"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">✅ Ya, barang sudah diambil</SelectItem>
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
            {detailProblem?.problem_product_take_by_name && (
              <div className="space-y-2">
                <Label htmlFor="problem_product_take_by_name">
                  Nama Pengambilan Barang
                </Label>
                <Input
                  id="problem_product_take_by_name"
                  value={formatDateTime(
                    detailProblem.problem_product_take_by_name
                  )}
                  disabled
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="created_at">Tanggal Pengajuan</Label>
              <Input
                id="created_at"
                value={formatDateTime(detailProblem.created_at)}
                disabled
              />
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
                  onClick={() => {
                    loadAllProducts();
                    if (purchase_order_client_problem_id) {
                      handleDetailProduct();
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {purchase_order_client_problem_id
                    ? "Reload Detail"
                    : "Reload Products"}
                </Button>
                {!warehouseApproved && (
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
                )}
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
                <p className="text-muted-foreground">No items added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">Item {index + 1}</Badge>
                        {item.reason_warehouse !== null &&
                          item.updated_at_warehouse && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
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
                            disabled={
                              item.reason_warehouse == null &&
                              item.updated_at_warehouse
                                ? true
                                : false
                            }
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

                        {/* Product Detail */}
                        <div className="space-y-2">
                          <Label>Deskripsi *</Label>
                          <Select
                            value={item.product_detail_id}
                            onValueChange={(value) =>
                              updateItem(item.id, "product_detail_id", value)
                            }
                            disabled={
                              item.reason_warehouse == null &&
                              item.updated_at_warehouse
                                ? true
                                : false
                            }
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
                                    {detail.product_description ||
                                      `${detail.variant} (${detail.color})`}
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
                            disabled={
                              item.reason_warehouse == null &&
                              item.updated_at_warehouse
                                ? true
                                : false
                            }
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
                            disabled={
                              item.reason_warehouse == null &&
                              item.updated_at_warehouse
                                ? true
                                : false
                            }
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
                            disabled={
                              item.reason_warehouse == null &&
                              item.updated_at_warehouse
                                ? true
                                : false
                            }
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
                          {getError(`items.${item.id}.adjustment_quantity`) && (
                            <p className="text-sm text-red-500">
                              {getError(`items.${item.id}.adjustment_quantity`)}
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
                          disabled={
                            item.reason_warehouse == null &&
                            item.updated_at_warehouse
                              ? true
                              : false
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
                      {item.updated_at_warehouse && (
                        <div className="mt-4 space-y-2">
                          <div
                            className={`p-2 rounded text-sm font-medium ${
                              item.reason_warehouse !== null
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {item.reason_warehouse ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              <span>
                                Status Warehouse:{" "}
                                {item.reason_warehouse !== null
                                  ? "Ditolak"
                                  : "Disetujui"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Input Alasan Penolakan */}
                      {item?.reason_warehouse !== null && (
                        <div className="mt-4 space-y-2">
                          <div className="space-y-2 p-3 border border-destructive rounded-lg bg-destructive/5">
                            <Label className="text-sm text-destructive">
                              Alasan Penolakan
                            </Label>
                            <Textarea
                              value={item.reason_warehouse || null}
                              onChange={(e) =>
                                updateItem(
                                  item?.id,
                                  "reason_warehouse",
                                  e.target.value
                                )
                              }
                              disabled={true}
                              placeholder="Berikan alasan penolakan..."
                              rows={2}
                              className="border-destructive/50"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {proofWarehouseReceived && (
                  <div className="space-y-4">
                    <Label className="font-semibold text-base flex items-center gap-2">
                      Bukti Penerimaan Barang Warehouse
                    </Label>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon()}
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {fileName}
                            </p>
                            <p className="text-xs text-green-600">
                              {getFileTypeLabel()} • {fileType}
                            </p>
                            <p className="text-xs text-green-500 mt-1">✓</p>
                          </div>
                        </div>
                      </div>

                      {/* Preview untuk gambar */}
                      {proofWarehouseReceived && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <img
                            src={proofWarehouseReceived}
                            alt="Preview"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-xs text-center  mt-2">
                            Preview gambar
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {detailProblem?.received_warehouse_by_name && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <Label htmlFor="received_warehouse_by_name">
                        Nama Penerima
                      </Label>
                      <Input
                        disabled
                        value={detailProblem.received_warehouse_by_name}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          {!warehouseApproved && (
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
                    {purchase_order_client_problem_id
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {purchase_order_client_problem_id
                      ? "Update Pengajuan"
                      : "Kirim Pengajuan"}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
