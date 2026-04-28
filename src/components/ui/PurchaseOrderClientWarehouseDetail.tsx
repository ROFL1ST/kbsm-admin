"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Client,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import { useProducts } from "@/contexts/Products.Context";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AddClientModal } from "@/pages/Clients/Actions/Create";
import LocationInformation from "@/components/ui/LocationInformation";
import { useAuth } from "@/contexts/Auth.Context";
import { dateTimeNow, formatDate } from "../format/Date";
import {
  Camera,
  CheckCircle,
  FileText,
  Image,
  PencilOff,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import PurchaseOrderClientsAdjusments from "./PurchaseOrderClientsAdjusments";

interface Item {
  product_id: number | null;
  product_detail_id: number | null;
  name: string;
  description: string;
  quantity: number;
  is_ppn: boolean;
  unit_code: string;
  price: number;
  discount_percentage: string;
  adjustment_quantity: string;
  adjustment_type: string;
  reason: string;
  discount_amount: number;
  price_percentage_up: string;
  price_amount_up: number;
  updated_at_warehouse: string | null;
  quantity_distribution: number;
  reason_warehouse: string;
}

interface Calculation {
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
}

export default function PurchaseOrderClientWarehouseDetail({
  purchase_order_client_id,
}: {
  purchase_order_client_id?: string;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [adjusmentProduct, setIsAdjusmentProduct] = useState(false);
  const [takeBy, setIsTakeBy] = useState(false);

  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [problemProduct, setProblemProduct] = useState({
    purchase_order_client_id: null,
    assignment_by: null,
    driver_id: null,
    received_warehouse_proof: null,
    received_warehouse_date: null,
    send_to_client_date: null,
    is_return: null,
  });
  const [proofWarehouseReceived, setProofWarehouseReceived] = useState(null);
  const {
    clients,
    detailPurchaseOrderClient,
    getAssets,
    deliveryHistoryDetail,
    handleDetailPurchaseOrderClient,
    getPurchaseOrderDeliveryHistoryDetail,
    updatePurchaseOrderClient,
    purchaseOrderClientProblemProducts,
    getPurchaseOrderClientProblemProduct,
  } = usePurchaseOrderClients();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getProductDetails } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const { user } = useAuth();
  // Permission checks
  // const isDriver = user?.responsibilities?.some(
  //   (role) => role.code === "DRIVER"
  // );
  const isDriver = true;
  // const isWarehouse = user?.responsibilities?.some(
  //   (role) => role.code === "WAREHOUSE"
  // );
  // const isDriver = user?.responsibilities?.some(
  //   (role) => role.code === "ADMIN"
  // );
  const [form, setForm] = useState({
    purchase_order_client_id: null,
    client_id: null,
    progress_type_code: null,
    total: 0,
    status_trx_code: "",
    input_date: "",
    due_date: "",
    payment_method_code: "",
    send_date: "",
    is_problem_products: "",
    problem_product_take_by: "",
    items: [
      {
        product_id: null,
        product_detail_id: null,
        name: "",
        description: "",
        quantity: 0,
        is_ppn: false,
        unit_code: "PCS",
        price: 0,
        discount_percentage: "",
        discount_amount: 0,
        price_percentage_up: "",
        price_amount_up: 0,
        product_unit_id: null,
        adjustment_type: null,
        adjustment_quantity: "0",
        quantity_distribution: 0,
        updated_at_warehouse: null,
        reason: null,
        reason_finance: null,
        reason_warehouse: null,
      },
    ],
  });

  const [totalCalculation, setTotalCalculation] = useState<Calculation>({
    sub_total: 0,
    discount_total: 0,
    tax_total: 0,
    total: 0,
  });
  const [descSearch, setDescSearch] = useState<Record<number, string[]>>({});
  const { toast } = useToast();

  // 🔹 Fungsi untuk menghitung discount amount dan total per item
  const calculateItemTotals = (item: Item) => {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const discountPercentage = item.discount_percentage
      ? parseFloat(item.discount_percentage)
      : 0;

    // Hitung subtotal sebelum diskon
    const subtotalBeforeDiscount = qty * price;

    // Hitung discount amount
    const discountAmount = (subtotalBeforeDiscount * discountPercentage) / 100;

    // Hitung subtotal setelah diskon
    const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;

    // Hitung ppn jika ada
    const ppnAmount = item.is_ppn ? subtotalAfterDiscount * 0.11 : 0;

    // Total per item
    const itemTotal = subtotalAfterDiscount + ppnAmount;

    return {
      subtotalBeforeDiscount,
      discountAmount,
      subtotalAfterDiscount,
      ppnAmount,
      itemTotal,
    };
  };

  const updateProductProblem = async () => {
    const response = await purchaseOrderClientProblemProducts({
      assignment_by: null,
      driver_id: null,
      received_warehouse_proof: proofWarehouseReceived,
      send_to_client_date: null,
      purchase_order_client_id: purchase_order_client_id,
    });
    if (response.status) {
      toast({ title: "Berhasil", description: "Data berhasil disimpan" });
    } else {
      toast({ title: "Gagal", description: "Sedang Maintenance" });
    }
  };
  const validation = () => {
    if (proofWarehouseReceived === null) {
      toast({
        title: "Gagal",
        description: "Bukti Barang penerimaan Barang di gudang wajib diisi",
      });
      return false;
    }

    // Cari item yang memiliki adjustment_type (perlu validasi reason & quantity)
    const itemWithAdjustment = form.items.find(
      (item) =>
        item.adjustment_type !== null && item.updated_at_warehouse === null
    );
    // Jika ada item yang belum diverifikasi di warehouse
    if (itemWithAdjustment) {
      const itemIndex = form.items.indexOf(itemWithAdjustment) + 1;
      toast({
        title: "Gagal",
        description: `Tolong Verifikasi produk di warehouse pada baris ke-${itemIndex}`,
      });
      return false;
    }

    return true;
  };

  const handleSubmitAdjusmentProducts = async () => {
    try {
      setIsLoading(true);
      // Jika validasi gagal, hentikan eksekusi
      if (!validation()) {
        setIsLoading(false);
        return;
      }

      const response = await updatePurchaseOrderClient(form);

      if (response.status) {
        await updateProductProblem();
        toast({
          title: "Berhasil",
          description: "Barang Sudah Diterima Oleh Pihak Gudang",
        });
      } else {
        toast({ title: "Gagal", description: "Sedang Maintenance" });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast({ title: "Gagal", description: "Terjadi kesalahan sistem" });
    }
  };
  const fetchProblemProduct = async () => {
    const response = await getPurchaseOrderClientProblemProduct({
      purchase_order_client_id,
    });
    setProblemProduct(response.data);
  };
  useEffect(() => {
    if (detailPurchaseOrderClient) {
      const data = detailPurchaseOrderClient;
      const products = detailPurchaseOrderClient.products;
      setIsAdjusmentProduct(data.is_problem_products === "Y");
      setIsTakeBy(data.problem_product_take_by !== "N");
      setClientSearch(data.name);
      let formattedItems = [];

      for (let i = 0; i < products.length; i++) {
        formattedItems.push({
          product_id: products[i].product_id,
          product_detail_id: products[i].product_detail_id,
          name: products[i].product_name,
          description: products[i].description,
          quantity: products[i].quantity,
          is_ppn: products[i].ppn_percentage > 0,
          unit_code: products[i].unit_code,
          price: products[i].price,
          discount_percentage: products[i].discount_percentage
            ? String(products[i].discount_percentage)
            : "",
          discount_amount: products[i].discount_amount || 0,
          price_percentage_up: products[i].price_percentage_up
            ? String(products[i].price_percentage_up)
            : "",
          price_amount_up: products[i].price_amount_up || 0,
          adjustment_quantity: products[i].adjustment_quantity,
          adjustment_type: products[i].adjustment_type,
          reason: products[i].reason,
          reason_finance: products[i].reason_finance,
          updated_at_finance: products[i].updated_at_finance,
          reason_warehouse: products[i].reason_warehouse,
          updated_at_warehouse: products[i].updated_at_warehouse,
          quantity_distribution: products[i].quantity_distribution,
        });
      }
      const inputDate = data?.input_date
        ? new Date(data.input_date).toLocaleDateString("en-CA")
        : "";

      const sendDate = data?.send_date
        ? new Date(data.send_date).toLocaleDateString("en-CA")
        : "";

      const newForm = {
        purchase_order_client_id: data.id,
        client_id: data.client_id,
        total: data.total,
        status_trx_code: data.status_trx_code,
        progress_type_code: data.progress_type_code,
        input_date: inputDate,
        send_date: sendDate,
        due_date: String(data.due_date),
        payment_method_code: data.payment_method_code,
        problem_product_take_by: data.problem_product_take_by,
        is_problem_products: data.is_problem_products,
        items: formattedItems,
      };

      setForm(newForm);
      calculateTotals(formattedItems);
    }
    if (problemProduct) {
      setProofWarehouseReceived(problemProduct.received_warehouse_proof);
    }
  }, [detailPurchaseOrderClient, problemProduct]);

  const calculateTotals = (items: Item[]) => {
    const totals = items.reduce(
      (acc, item) => {
        const { subtotalBeforeDiscount, discountAmount, ppnAmount, itemTotal } =
          calculateItemTotals(item);

        return {
          sub_total: acc.sub_total + subtotalBeforeDiscount,
          discount_total: acc.discount_total + discountAmount,
          tax_total: acc.tax_total + ppnAmount,
          total: acc.total + itemTotal,
        };
      },
      { sub_total: 0, discount_total: 0, tax_total: 0, total: 0 }
    );

    setTotalCalculation(totals);
  };
  const updateItem = (index: number, field: keyof Item, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      const currentItem = { ...items[index] };

      // Update field yang diubah
      (currentItem as any)[field] = value;

      items[index] = currentItem;

      return { ...prev, items };
    });
  };

  const fetchData = async () => {
    try {
      await handleDetailPurchaseOrderClient({
        purchase_order_client_id: purchase_order_client_id,
      });
      await getPurchaseOrderDeliveryHistoryDetail({
        purchase_order_client_id: purchase_order_client_id,
      });
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };

  useEffect(() => {
    fetchData();
    getAssets();
    fetchProblemProduct();
  }, []);

  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const handleSearchClient = (val: string) => {
    setClientSearch(val);

    if (val.trim() === "") {
      setFilteredClients([]);
      return;
    }

    const results = clients.filter((c) =>
      c.name.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredClients(results);
  };
  const handleDownloadPhoto = () => {
    try {
      window.open(deliveryHistoryDetail?.path, "_blank");

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
  const handleRemoveFile = () => {
    setProofWarehouseReceived("");
    setFileName("");
    setFileType("");
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
      <LocationInformation
        lat={detailPurchaseOrderClient?.lat}
        long={detailPurchaseOrderClient?.long}
        phone={detailPurchaseOrderClient?.phone}
        purchase_order_client_code={
          detailPurchaseOrderClient?.purchase_order_client_code
        }
        purchase_order_client_id={detailPurchaseOrderClient?.id}
        send_date={detailPurchaseOrderClient?.send_date}
        progress_type_code={detailPurchaseOrderClient?.progress_type_code}
        address={detailPurchaseOrderClient?.address}
        is_driver={isDriver}
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Bukti Sudah Datang
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Nama Driver */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium">Nama Driver</Label>
              </div>
              <div className="md:col-span-2 relative">
                <Input
                  placeholder="Nama driver"
                  value={deliveryHistoryDetail?.driver_name}
                  readOnly={true}
                  className={"bg-muted"}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Kode Surat Jalan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium">Kode Surat Jalan</Label>
              </div>
              <div className="md:col-span-2 relative">
                <Input
                  placeholder="Kode surat jalan"
                  value={deliveryHistoryDetail?.travel_code}
                  readOnly={true}
                  className={"bg-muted"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Update Terakhir */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium">Update Terakhir</Label>
              </div>
              <div className="md:col-span-2 relative">
                <Input
                  placeholder="Tanggal update"
                  value={
                    deliveryHistoryDetail?.created_at &&
                    formatDate(
                      deliveryHistoryDetail?.created_at,
                      "YYYY MMM DD, HH:mm"
                    )
                  }
                  readOnly={true}
                  className={"bg-muted"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Foto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <Label className="text-sm font-medium">Foto Bukti</Label>
                <p className="text-xs mt-1">Dokumentasi kedatangan</p>
              </div>
              <div className="md:col-span-2">
                <div className="relative group">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    {deliveryHistoryDetail?.path ? (
                      <div className="relative">
                        <img
                          src={deliveryHistoryDetail.path}
                          alt="Bukti kedatangan"
                          className="w-full max-w-md mx-auto rounded-lg shadow-sm object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg" />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 text-slate-300 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-slate-500 text-sm">
                          Tidak ada foto tersedia
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  {deliveryHistoryDetail?.path && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 transition-colors duration-200"
                        onClick={handleDownloadPhoto}
                      >
                        <Camera />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {adjusmentProduct && (
        <div className="space-y-4 p-4 border rounded-lg shadow-sm">
          <div className="space-y-4">
            <PurchaseOrderClientsAdjusments
              is_warehouse={true}
              purchase_order_client_id={purchase_order_client_id}
            />
          </div>
        </div>
      )}
      {/* Order Information */}
      {isDriver && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Informasi Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client */}
              <div className="space-y-2 relative">
                <Label>Klien</Label>
                <Input
                  placeholder="Cari klien"
                  value={clientSearch}
                  onChange={(e) => handleSearchClient(e.target.value)}
                  readOnly={true}
                  className={"bg-muted"}
                />
              </div>

              {/* Tanggal & Payment */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tanggal Input</Label>
                  <Input
                    type="date"
                    value={form.input_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        input_date: e.target.value,
                      }))
                    }
                    readOnly={true}
                    className={"bg-muted"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Kirim</Label>
                  <Input
                    type="date"
                    value={form.send_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        send_date: e.target.value,
                      }))
                    }
                    readOnly={true}
                    className={"bg-muted"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                  <Label>Status Pembayaran</Label>
                  <Select
                    value={form.status_trx_code}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        status_trx_code: val,
                      }))
                    }
                    disabled={true}
                  >
                    <SelectTrigger className={"bg-muted"}>
                      <SelectValue placeholder="Pilih metode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Belum Lunas</SelectItem>
                      <SelectItem value="PAID">Sudah Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={form.payment_method_code}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        payment_method_code: val,
                      }))
                    }
                    disabled={true}
                  >
                    <SelectTrigger className={"bg-muted"}>
                      <SelectValue placeholder="Pilih metode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="TEMPO">Tempo</SelectItem>
                      <SelectItem value="CONSIGNMENT">Konsinyasi</SelectItem>
                      <SelectItem value="COD">COD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                </div>
                {form.items.map((item, idx) => {
                  const {
                    subtotalBeforeDiscount,
                    discountAmount,
                    ppnAmount,
                    itemTotal,
                  } = calculateItemTotals(item);

                  return (
                    <div key={idx} className="p-4 border rounded-lg space-y-4">
                      {/* Grid untuk informasi produk utama */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Produk */}
                        <div className="space-y-2 relative">
                          <Label>Produk</Label>
                          <Input
                            placeholder="Cari produk"
                            value={item.name}
                            readOnly={true}
                            className={"bg-muted"}
                          />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2 relative md:col-span-2">
                          <Label>Deskripsi</Label>
                          <Input
                            placeholder="Cari deskripsi"
                            value={item.description}
                            readOnly={true}
                            className={"bg-muted"}
                          />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity === null ? "" : item.quantity}
                            readOnly={true}
                            className={"bg-muted"}
                          />
                        </div>
                      </div>
                      {/* Grid untuk unit dan informasi tambahan */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Unit */}
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select value={item.unit_code} disabled={true}>
                            <SelectTrigger className={"bg-muted"}>
                              <SelectValue placeholder="Pilih unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CTN">CTN</SelectItem>
                              <SelectItem value="PCS">PCS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Section untuk adjusment product */}
                      {item.adjustment_type && (
                        <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <Label className="font-semibold">
                              Form Pengajuan Penyesuaian
                            </Label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Quantity Pengembalian */}
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Quantity Pengembalian
                              </Label>
                              <Input
                                type="number"
                                value={
                                  item.adjustment_quantity === null
                                    ? ""
                                    : item.adjustment_quantity
                                }
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "adjustment_quantity",
                                    e.target.value
                                  )
                                }
                                readOnly={true}
                                className={"bg-muted"}
                                min="0"
                              />
                            </div>

                            {/* Tipe Pengembalian */}
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Tipe Pengembalian
                              </Label>
                              <Select
                                value={item.adjustment_type}
                                disabled={true}
                                onValueChange={(e) =>
                                  updateItem(idx, "adjustment_type", e)
                                }
                              >
                                <SelectTrigger className={"bg-muted"}>
                                  <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="RETURN">Return</SelectItem>
                                  <SelectItem value="REFUND">Refund</SelectItem>
                                  <SelectItem value="TAKE_OUT">
                                    Pengembalian Barang
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Masukan Ke Stok Gudang
                              </Label>
                              <Input
                                type="text"
                                value={item.quantity_distribution}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "quantity_distribution",
                                    e.target.value
                                  )
                                }
                                readOnly={!isEditMode}
                                className={!isEditMode ? "bg-muted" : ""}
                              />
                            </div>
                            {/* Status Verifikasi */}
                            {isEditMode && (
                              <div className="space-y-2">
                                <Label className="text-sm">
                                  Status Penerimaan Barang :
                                </Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={
                                      item.reason_warehouse === null &&
                                      item.updated_at_warehouse
                                        ? "default" // Hijau (setuju aktif)
                                        : "outline" // Outline (default)
                                    }
                                    size="sm"
                                    onClick={() => {
                                      updateItem(idx, "reason_warehouse", null),
                                        updateItem(
                                          idx,
                                          "updated_at_warehouse",
                                          dateTimeNow()
                                        );
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Setuju
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={
                                      item.reason_warehouse !== null
                                        ? "destructive" // Merah (tolak aktif)
                                        : "outline" // Outline (default)
                                    }
                                    size="sm"
                                    onClick={() => {
                                      updateItem(
                                        idx,
                                        "updated_at_warehouse",
                                        new Date().toISOString()
                                      ),
                                        updateItem(idx, "reason_warehouse", "");
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Tolak
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Alasan - Full Width */}
                          <div className="space-y-2">
                            <Label className="text-sm">
                              Alasan Pengembalian
                            </Label>
                            <Textarea
                              value={item.reason === null ? "" : item.reason}
                              readOnly={true}
                              onChange={(e) =>
                                updateItem(idx, "reason", e.target.value)
                              }
                              className={"bg-muted"}
                              placeholder="Jelaskan alasan penyesuaian..."
                              rows={3}
                            />
                          </div>

                          {/* Input Alasan Penolakan */}
                          {item?.reason_warehouse !== null && (
                            <div className="space-y-2 p-3 border border-destructive rounded-lg bg-destructive/5">
                              <Label className="text-sm text-destructive">
                                Alasan Penolakan *
                              </Label>
                              <Textarea
                                value={item.reason_warehouse || ""}
                                disabled={!isEditMode}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "reason_warehouse",
                                    e.target.value
                                  )
                                }
                                placeholder="Berikan alasan penolakan..."
                                rows={2}
                                className="border-destructive/50"
                              />
                            </div>
                          )}

                          {/* Status Info */}
                          {item.updated_at_warehouse && (
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
                          )}
                        </div>
                      )}
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Item {idx + 1} of {form.items.length}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AddClientModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        initialName={clientSearch}
        onClientAdded={(newClient) => {
          setClientSearch(newClient.name);
        }}
      />
    </div>
  );
}
