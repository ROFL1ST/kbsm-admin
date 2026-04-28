"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, Pencil, PencilOff, Printer, Trash2, Upload } from "lucide-react";
import {
  Detail,
  Driver,
  FormStatePurchaseOrderDeliveryVendor,
  ItemDelivery,
  PurchaseOrderVendorHistory,
  usePurchaseOrderVendors,
} from "@/contexts/PurchaseOrderVendors.Context";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { NotesVendorModal } from "@/components/ui/NotesVendorModal";
import { NotesVendorDeliveryProofModal } from "@/components/ui/NotesVendorDeliveryProofModal";
import { formatDate } from "../../components/format/Date";
interface DriverInfo {
  driver_name: string;
  driver_phone: string;
  driver_photo: File | string | null;
}

export default function ProductsLoadingDetail() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { isLoading } = usePurchaseOrderVendors();

  const {
    getPurchaseOrderProductDeliveryVendor,
    detailPurchaseOrderVendorDelivery,
    createOnePurchaseOrderVendorDeliveryReceived,
    getHistoryPurchaseOrderVendor,
    purchaseOrderVendorHistory,
    patchOnePurchaseOrderVendorDeliveryReceived,
    deleteHistoryPurchaseOrderVendor,
    printProofReceivedProducts,
  } = usePurchaseOrderVendors();

  const [form, setForm] = useState<FormStatePurchaseOrderDeliveryVendor>();

  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    driver_name: "",
    driver_phone: "",
    driver_photo: null,
  });

  const [originalForm, setOriginalForm] = useState(null);
  const { toast } = useToast();
  const location = useLocation();

  // 🔹 Hitung summary stock yang datang
  const calculateArrivedSummary = () => {
    return form?.products?.reduce((total, item) => {
      return total + (item.received_quantity || 0);
    }, 0);
  };

  // 🔹 Handle perubahan data driver
  const handleDriverInfoChange = (field: keyof DriverInfo, value: any) => {
    setDriverInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔹 Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 🔹 Handle upload foto driver
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        });
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        // Convert file to base64
        const base64String = await fileToBase64(file);
        handleDriverInfoChange("driver_photo", base64String);
      } catch (error) {
        console.error("Failed to convert image to base64:", error);
        toast({
          title: "Error",
          description: "Gagal mengupload foto",
          variant: "destructive",
        });
      }
    }
  };

  // 🔹 Handle API Patch untuk update data
  const handleCreatePurchaseOrder = async () => {
    try {
      // Prepare data untuk dikirim ke API
      const updateData = {
        purchase_order_vendor_id: location?.state,
        driver_info: {
          driver_name: driverInfo.driver_name,
          driver_phone: driverInfo.driver_phone,
          driver_photo: driverInfo.driver_photo, // Sudah dalam format base64
        },
        items: form?.products?.map((item) => ({
          product_id: item.product_id,
          product_detail_id: item.product_detail_id,
          product_unit_id: item.product_unit_id,
          quantity: item.received_quantity || 0,
        })),
      };

      const response =
        await createOnePurchaseOrderVendorDeliveryReceived(updateData);
      if (response.status) {
        toast({
          title: "Berhasil",
          description: "Data berhasil diperbarui",
          variant: "default",
        });
        setDriverInfo({
          driver_name: "",
          driver_phone: "",
          driver_photo: null,
        });
      }
      if (!response.status)
        toast({
          title: "Gagal",
          description: "Coba Cek Form Yang harus Diisi",
          variant: "default",
        });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Failed to update purchase order:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    if (detailPurchaseOrderVendorDelivery) {
      const data = detailPurchaseOrderVendorDelivery;
      const formattedItems: ItemDelivery[] = data.products.map((product) => ({
        code: product?.code,
        name: product?.name,
        description: product?.description,
        quantity: product?.quantity,
        received_quantity: Math.max(
          product?.quantity - (product?.received_quantity_fix || 0),
        ), // Default ke 0 jika null
        product_id: product?.product_id,
        product_detail_id: product?.product_detail_id,
        product_unit_id: product?.product_unit_id,
        received_quantity_fix: product?.received_quantity_fix,
      }));

      const inputDate = data?.input_date
        ? new Date(data.input_date).toLocaleDateString("en-CA")
        : "";

      const sendDate = data?.send_date
        ? new Date(data.send_date).toLocaleDateString("en-CA")
        : "";

      const newForm = {
        purchase_order_vendor_id: data?.purchase_order_vendor_id,
        vendor_id: data?.vendor_id,
        name: data?.name,
        total: data?.total,
        status_trx_code: data?.status_trx_code,
        progress_type_code: data?.progress_type_code,
        input_date: inputDate,
        send_date: sendDate,
        due_date: String(data?.due_date),
        payment_method_code: data?.payment_method_code,
        products: formattedItems,
      };

      setForm(newForm);
      setOriginalForm(newForm);
    }
  }, [detailPurchaseOrderVendorDelivery]);

  const fetchData = async () => {
    const response = await getPurchaseOrderProductDeliveryVendor({
      purchase_order_vendor_id: location?.state,
    });
    const res = await getHistoryPurchaseOrderVendor({
      purchase_order_vendor_id: location?.state,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Update item dalam form
  const handleEditHistory = (item: Driver) => {
    const formattedItems = item.detail.map((d: Detail) => ({
      code: d.code,
      name: d.name,
      description: d.description,
      quantity: d.quantity,
      received_quantity: d.received_quantity || 0,
      product_id: d.product_id,
      product_detail_id: d.product_detail_id,
      product_unit_id: d.product_unit_id,
      received_quantity_fix: d.received_quantity_fix,
    }));

    setForm((prev) => ({
      ...prev!,
      purchase_order_vendor_delivery_id: item.id,
      products: formattedItems,
    }));

    setDriverInfo({
      driver_name: item.driver_name,
      driver_phone: item.driver_phone,
      driver_photo: item.path,
    });

    setIsEditMode(true);
    toast({
      title: "Edit Data",
      description: `Berhasil memuat data pengiriman ${item.purchase_order_vendor_delivery_code}`,
    });
  };

  const handleCancel = () => {
    const data = detailPurchaseOrderVendorDelivery;
    const formattedItems: ItemDelivery[] = data.products.map((product) => ({
      code: product?.code,
      name: product?.name,
      description: product?.description,
      quantity: product?.quantity,
      received_quantity: Math.max(
        product?.quantity - (product?.received_quantity_fix || 0),
      ), // Default ke 0 jika null
      product_id: product?.product_id,
      product_detail_id: product?.product_detail_id,
      product_unit_id: product?.product_unit_id,
      received_quantity_fix: product?.received_quantity_fix,
    }));

    const inputDate = data?.input_date
      ? new Date(data.input_date).toLocaleDateString("en-CA")
      : "";

    const sendDate = data?.send_date
      ? new Date(data.send_date).toLocaleDateString("en-CA")
      : "";

    const newForm = {
      purchase_order_vendor_id: data?.purchase_order_vendor_id,
      vendor_id: data?.vendor_id,
      name: data?.name,
      total: data?.total,
      status_trx_code: data?.status_trx_code,
      progress_type_code: data?.progress_type_code,
      input_date: inputDate,
      send_date: sendDate,
      due_date: String(data?.due_date),
      payment_method_code: data?.payment_method_code,
      products: formattedItems,
    };

    setForm(newForm);
    setDriverInfo({
      driver_name: "",
      driver_phone: "",
      driver_photo: null,
    });
    setIsEditMode(false);

    toast({
      title: "Form Dikosongkan",
      description: "Semua data telah direset.",
    });
  };

  const updateOrder = async () => {
    try {
      const updateData = {
        purchase_order_vendor_id: location?.state,
        purchase_order_vendor_delivery_id:
          form?.purchase_order_vendor_delivery_id,
        driver_info: {
          driver_name: driverInfo.driver_name,
          driver_phone: driverInfo.driver_phone,
          driver_photo: driverInfo.driver_photo, // Sudah dalam format base64
        },
        items: form?.products?.map((item) => ({
          product_id: item.product_id,
          product_detail_id: item.product_detail_id,
          product_unit_id: item.product_unit_id,
          quantity: item.received_quantity || 0,
        })),
      };
      const res = await patchOnePurchaseOrderVendorDeliveryReceived(updateData);

      if (res.status) {
        toast({
          title: "Berhasil!",
          description: "Data pesanan berhasil diperbarui.",
          variant: "default",
        });
        fetchData();
      } else {
        toast({
          title: "Gagal!",
          description: "Coba Cek Form Yang harus Diisi",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Gagal!",
        description: "Coba Cek Form Yang harus Diisi",
        variant: "destructive",
      });
    }
  };

  const updateItem = (index: number, field: keyof ItemDelivery, value: any) => {
    setForm((prev) => {
      if (!prev || !prev.products) return prev;

      const updatedProducts = [...prev.products];

      // Untuk field number, selalu konversi ke number
      if (field === "received_quantity" || field === "quantity") {
        let numericValue;

        if (value === "" || value === null || value === undefined) {
          numericValue = 0;
        } else if (typeof value === "string") {
          // Hapus leading zero dari string
          const cleanValue = value.replace(/^0+/, "");
          numericValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10) || 0;
        } else {
          numericValue = Number(value);
        }

        // Validasi khusus untuk received_quantity
        if (field === "received_quantity") {
          const maxQuantity = updatedProducts[index]?.quantity || 0;
          numericValue = Math.min(Math.max(0, numericValue), maxQuantity);
        }

        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: numericValue,
        };
      } else {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value,
        };
      }

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  // 🔹 Reset received_quantity ke 0
  const resetReceivedQuantity = (index: number) => {
    updateItem(index, "received_quantity", 0);
  };

  // 🔹 Set received_quantity sama dengan quantity
  const setMaxReceivedQuantity = (index: number) => {
    const maxQuantity = form?.products?.[index]?.quantity || 0;
    const maxQuantityReceived =
      form?.products?.[index]?.received_quantity_fix || 0;
    updateItem(index, "received_quantity", maxQuantity - maxQuantityReceived);
  };

  // delete
  const deletePurchase = async (id) => {
    try {
      const res = await deleteHistoryPurchaseOrderVendor({
        purchase_order_vendor_delivery_id: id,
      });

      if (res?.status) {
        toast({
          title: "Berhasil!",
          description: "History pesanan berhasil dihapus.",
          variant: "default",
        });
        handleCancel();
      } else {
        toast({
          title: "Gagal!",
          description: "Coba Cek Form Yang harus Diisi",
          variant: "default",
        });
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting history:", error);
      toast({
        title: "Gagal!",
        description: "Coba Cek Form Yang harus Diisi",
        variant: "default",
      });
    }
  };

  // handle download foto
  const handleDownloadPhoto = () => {
    if (
      !driverInfo.driver_photo ||
      typeof driverInfo.driver_photo !== "string"
    ) {
      toast({
        title: "Gagal",
        description: "Tidak ada foto yang bisa diunduh.",
        variant: "destructive",
      });
      return;
    }

    try {
      window.open(driverInfo.driver_photo, "_blank");

      toast({
        title: "Berhasil",
        description: "Foto driver dibuka di tab baru.",
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat membuka foto.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Pesanan" : "Detail Pesanan"}
          </h1>
          <p className="text-muted-foreground">
            Masukan Quantity dan Data Driver, jika barang sudah samapai gudang
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditMode ? (
            <></>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <PencilOff />
                Batal
              </Button>
              {/* <Button onClick={handleSubmit}>Simpan</Button> */}
            </>
          )}
          <Button
            onClick={() => {
              if (isEditMode) {
                updateOrder();
              } else {
                handleCreatePurchaseOrder();
              }
            }}
          >
            {isEditMode ? "Simpan Perubahan" : "Buat Tanda Terima"}
          </Button>
        </div>
      </div>
      {/* History */}
      <section className="mt-6 bg-white dark:bg-zinc-900 border border-primary/30 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          <h2 className="text-xl font-semibold text-primary">History</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Daftar histori penerimaan barang dari vendor ke gudang
        </p>

        {/* list product */}
        <div className="space-y-4">
          {purchaseOrderVendorHistory &&
          purchaseOrderVendorHistory?.driver.length > 0 ? (
            purchaseOrderVendorHistory.driver.map((item, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl p-4"
              >
                <div className="flex flex-col gap-3">
                  {/* Bagian Judul dan Tanggal */}
                  <div>
                    <h3 className="text-base font-semibold text-primary group-hover:text-primary/90">
                      {item.purchase_order_vendor_delivery_code}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Tanggal:{" "}
                        <span className="font-medium text-foreground">
                          {formatDate(item.created_at, "YYYY MMM DD, HH:mm:ss")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Tombol-tombol di bawah tanggal */}
                  <div className="flex flex-row flex-wrap items-center gap-2 pt-2">
                    {/* Tombol Edit */}
                    <Button
                      onClick={() => handleEditHistory(item)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 md:h-8 md:w-8"
                    >
                      <Edit className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>

                    {/* Tombol Hapus */}
                    <ConfirmModal
                      title="Hapus Pesanan"
                      description={`Apakah kamu yakin ingin menghapus pesanan <b>${item.purchase_order_vendor_delivery_code}</b>? Tindakan ini tidak dapat dibatalkan.`}
                      confirmText="Iya"
                      cancelText="Batal"
                      variant="outline"
                      showIcon={false}
                      useHTML
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 md:h-8 md:w-8 text-destructive"
                        >
                          <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
                        </Button>
                      }
                      onConfirm={() => deletePurchase(item.id)}
                    />

                    {/* Tombol Print */}
                    <NotesVendorDeliveryProofModal
                      title={`Tanda Terima Barang`}
                      confirmText={`Print`}
                      cancelText="Batal"
                      purchase_order_vendor_id={item?.purchase_order_vendor_id}
                      purchase_order_vendor_delivery_id={item?.id}
                      variant="outline"
                      showIcon={false}
                      handlePrint={printProofReceivedProducts}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak ada history tersedia.
            </p>
          )}
        </div>
      </section>
      {/* History */}
      {/* Informasi Driver Vendor */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Driver Vendor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Driver</Label>
              <Input
                placeholder="Masukkan nama driver"
                value={driverInfo.driver_name}
                onChange={(e) =>
                  handleDriverInfoChange("driver_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <Input
                placeholder="Masukkan nomor telepon"
                value={driverInfo.driver_phone}
                onChange={(e) =>
                  handleDriverInfoChange("driver_phone", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bukti Penerimaan Barang</Label>
            <div className="flex items-center gap-4">
              {driverInfo.driver_photo && (
                <div className="w-20 h-20 border rounded-md overflow-hidden">
                  <img
                    src={driverInfo.driver_photo as string}
                    alt="Driver Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="driver-photo"
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="driver-photo" className="cursor-pointer">
                    <Button variant="outline" type="button" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {driverInfo.driver_photo ? "Ganti Foto" : "Upload Foto"}
                      </span>
                    </Button>
                  </Label>
                  {isEditMode && driverInfo.driver_photo && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handleDownloadPhoto}
                      className="mt-2"
                    >
                      Lihat Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Information */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vendor */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input
                placeholder="Nama vendor"
                value={form?.name}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Tanggal */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal Input</Label>
                <Input
                  type="date"
                  value={form?.input_date}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Kirim</Label>
                <Input
                  type="date"
                  value={form?.send_date}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
              </div>

              {form?.products?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-md grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                  {/* Produk */}
                  <div className="space-y-2">
                    <Label>Produk</Label>
                    <Input
                      placeholder="Nama produk"
                      value={item?.name}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Input
                      placeholder="Deskripsi produk"
                      value={item?.description}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Kuantitas Pesanan</Label>
                    <Input
                      type="number"
                      value={item?.quantity}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Total Kuantitas yang Datang</Label>
                      <div className="flex gap-1">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => resetReceivedQuantity(idx)}
                          className="h-6 text-xs"
                        >
                          Reset
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setMaxReceivedQuantity(idx)}
                          className="h-6 text-xs"
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    <Input
                      type="text"
                      value={item?.received_quantity}
                      onChange={(e) => {
                        updateItem(idx, "received_quantity", e.target.value);
                      }}
                      min={0}
                      max={item.quantity}
                      className="w-full"
                    />
                    {!isEditMode && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Sudah Sampai: {item.received_quantity_fix || 0}
                        </span>
                        <span>
                          Belum Sampai:{" "}
                          {Math.max(
                            0,
                            item.quantity - (item.received_quantity_fix || 0),
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stock yang Datang */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">
                    Total Stock Yang Datang
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {calculateArrivedSummary()} Unit
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Jumlah total semua produk yang telah datang dari vendor
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
