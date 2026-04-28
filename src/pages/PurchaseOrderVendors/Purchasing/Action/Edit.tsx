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
  FormStatePurchaseOrderClient,
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
import { formatIDR } from "@/components/format/IDR";
import { AddClientModal } from "@/pages/Clients/Actions/Create";
import { useLocation, useNavigate } from "react-router-dom";
import PriceInput from "@/components/ui/PriceInput";
import {
  FormStatePurchaseOrderVendor,
  usePurchaseOrderVendors,
  Vendor,
} from "@/contexts/PurchaseOrderVendors.Context";
import {
  Check,
  Mail,
  Pencil,
  PencilOff,
  Phone,
  RefreshCcw,
  User,
} from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { formatDate } from "@/components/format/Date";

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
  discount_amount: number;
}

interface Calculation {
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
}
interface ProductUnit {
  unit_code: string;
  price: number;
  product_detail_id: number;
}
export default function EditPurchaseOrderVendorPurchasing() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {},
  );
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({});
  const [descSearchTerm, setDescSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    vendors,
    products,
    detailPurchaseOrderVendor,
    getAssets,
    handleDetailPurchaseOrderVendor,
    updatePurchaseOrderVendor,
    feedbackOrderVendor,
  } = usePurchaseOrderVendors();
  const { getProductDetails, getProductsByVendorID } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormStatePurchaseOrderVendor>({
    purchase_order_vendor_id: undefined,
    progress_type_code: undefined,
    status_trx_code: undefined,
    vendor_id: null,
    total: 0,
    input_date: "",
    due_date: "",
    send_date: "",
    payment_method_code: "CASH",
    items: [
      {
        product_id: null,
        product_detail_id: null,
        name: "",
        description: "",
        quantity: null,
        is_ppn: false,
        unit_code: "PCS",
        price: null,
        discount_percentage: "",
        discount_amount: 0, // Tambahkan discount_amount
      },
    ],
  });

  const [originalForm, setOriginalForm] =
    useState<FormStatePurchaseOrderVendor | null>(null);
  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [totalCalculation, setTotalCalculation] = useState<Calculation>({
    sub_total: 0,
    discount_total: 0,
    tax_total: 0,
    total: 0,
  });
  const [descSearch, setDescSearch] = useState<Record<number, string[]>>({});
  const { toast } = useToast();
  const location = useLocation();
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

  useEffect(() => {
    if (detailPurchaseOrderVendor) {
      const data = detailPurchaseOrderVendor;
      setClientSearch(data?.name);
      const formattedItems: Item[] = data.products.map((product) => ({
        product_id: product.product_id,
        product_detail_id: product.product_detail_id,
        name: product.product_name,
        description: product.description,
        quantity: product.quantity,
        is_ppn: product.ppn_percentage > 0,
        unit_code: product.unit_code,
        price: product.price,
        discount_percentage: product.discount_percentage
          ? String(product.discount_percentage)
          : "",
        discount_amount: product.discount_amount || 0,
      }));
      console.log(formattedItems, "formattedItems");
      const inputDate = data?.input_date
        ? new Date(data.input_date).toLocaleDateString("en-CA")
        : "";

      const sendDate = data?.send_date
        ? new Date(data.send_date).toLocaleDateString("en-CA")
        : "";

      const newForm: FormStatePurchaseOrderVendor = {
        purchase_order_vendor_id: data.id,
        vendor_id: data.vendor_id,
        total: data.total,
        status_trx_code: data.status_trx_code,
        progress_type_code: data.progress_type_code,
        input_date: inputDate,
        send_date: sendDate,
        due_date: String(data.due_date),
        payment_method_code: data.payment_method_code,
        items: formattedItems,
      };
      formattedItems.forEach((item, idx) => {
        if (item.product_id) {
          fetchProductDetail(item.product_id, idx, item.product_detail_id);
        }
      });
      getProductsByVendorID({ vendor_id: data.vendor_id });
      const selected = vendors.find((v) => v.id === data.vendor_id);
      if (selected) {
        setSelectedSupplier(selected);
        setClientSearch(selected.name);
      }

      setForm(newForm);
      setOriginalForm(newForm);
      calculateTotals(formattedItems);
    }
  }, [detailPurchaseOrderVendor]);

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
      { sub_total: 0, discount_total: 0, tax_total: 0, total: 0 },
    );

    setTotalCalculation(totals);
  };

  const fetchData = async () => {
    try {
      const data = await handleDetailPurchaseOrderVendor({
        purchase_order_vendor_id: location?.state,
      });
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };

  useEffect(() => {
    fetchData();
    getAssets();
  }, []);

  // 🔹 Fetch detail product
  const fetchProductDetail = async (
    product_id: number,
    index: number,
    product_detail_id: number,
  ) => {
    try {
      const data = await getProductDetails(product_id); // expect array
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`No product details found for ID: ${product_id}`);
        // clear productDetails & units for this index to avoid stale data
        setProductDetails((prev) => ({ ...prev, [index]: [] }));
        setProductUnits((prev) => ({ ...prev, [index]: [] }));
        return;
      }

      // Jika product_detail_id diberikan (non-zero), pilih detail itu
      if (product_detail_id && product_detail_id > 0) {
        const selectedDetail = data.find(
          (detail: any) => detail?.id === product_detail_id,
        );
        if (!selectedDetail) {
          setProductDetails((prev) => ({ ...prev, [index]: data }));
          setProductUnits((prev) => ({ ...prev, [index]: [] }));
          return;
        }

        // dedup units by unit_code for the selected detail
        const uniqueUnitsMap = new Map<string, ProductUnit>(
          (selectedDetail.units ?? []).map((unit: any) => [
            String(unit.unit_code),
            {
              unit_code: String(unit.unit_code),
              price: unit.price ?? null,
              product_detail_id: selectedDetail.id,
            } as ProductUnit,
          ]),
        );
        const uniqueUnits: ProductUnit[] = Array.from(uniqueUnitsMap.values());

        setProductUnits((prev) => ({ ...prev, [index]: uniqueUnits }));
        setProductDetails((prev) => ({ ...prev, [index]: data })); // store full array for description selection
        return;
      }
      if (data.length === 1) {
        const only = data[0];
        const uniqueUnitsMap = new Map<string, ProductUnit>(
          (only.units ?? []).map((unit: any) => [
            String(unit.unit_code),
            {
              unit_code: String(unit.unit_code),
              price: unit.price ?? null,
              product_detail_id: only.id,
            } as ProductUnit,
          ]),
        );
        const uniqueUnits: ProductUnit[] = Array.from(uniqueUnitsMap.values());

        // auto update form: product_detail_id, description, price (set first unit price if exist)
        setForm((prev) => {
          const items = [...prev.items];
          (items[index] as any).product_detail_id = only.id;
          (items[index] as any).description = only.description ?? null;
          if (uniqueUnits[0]) {
            (items[index] as any).unit_code = uniqueUnits[0].unit_code;
            (items[index] as any).price = uniqueUnits[0].price;
          } else {
            (items[index] as any).unit_code = null;
            (items[index] as any).price = null;
          }
          calculateTotals(items);
          return { ...prev, items };
        });

        setProductUnits((prev) => ({ ...prev, [index]: uniqueUnits }));
        setProductDetails((prev) => ({ ...prev, [index]: data }));
        return;
      }

      // Banyak detail & tidak ada preselected detail -> simpan details array dan kosongkan units
      setProductDetails((prev) => ({ ...prev, [index]: data }));
      setProductUnits((prev) => ({ ...prev, [index]: [] }));
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      setProductDetails((prev) => ({ ...prev, [index]: [] }));
      setProductUnits((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: null,
          product_detail_id: null,
          name: "",
          description: "",
          quantity: 0,
          is_ppn: true,
          unit_code: "PCS",
          price: 0,
          discount_percentage: "",
          discount_amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      const currentItem = items[index];

      // Validasi discount_percentage tidak boleh lebih dari 100
      if (field === "discount_percentage" && value > 100) {
        value = 100;
      }

      // Update field
      (currentItem as any)[field] = value;

      // Jika mengupdate quantity, price, discount_percentage, atau is_ppn, hitung ulang discount_amount
      if (
        [
          "quantity",
          "price",
          "discount_percentage",
          "discount_amount",
          "is_ppn",
        ].includes(field)
      ) {
        const item = items[index];

        // Jika yang diupdate adalah discount_percentage, hitung ulang discount_amount
        if (field === "discount_percentage") {
          const subtotalBeforeDiscount = item.quantity * item.price;
          items[index].discount_amount = (subtotalBeforeDiscount * value) / 100;
        }
        // Jika yang diupdate adalah discount_amount, hitung ulang discount_percentage
        else if (field === "discount_amount") {
          const subtotalBeforeDiscount = item.quantity * item.price;
          const discountPercentage =
            subtotalBeforeDiscount > 0
              ? (value / subtotalBeforeDiscount) * 100
              : 0;

          // Batasi discount_percentage maksimal 100
          items[index].discount_percentage = Math.min(
            discountPercentage,
            100,
          ).toString();

          // Jika discount_amount melebihi subtotal, set ke subtotal
          if (value > subtotalBeforeDiscount) {
            items[index].discount_amount = subtotalBeforeDiscount;
            items[index].discount_percentage = "100";
          }
        }
        // Untuk field lainnya, gunakan calculateItemTotals
        else {
          const { discountAmount } = calculateItemTotals(item);
          items[index].discount_amount = discountAmount;
        }
      }

      // Hitung ulang total keseluruhan
      const totals = items.reduce(
        (acc, item) => {
          const {
            subtotalBeforeDiscount,
            discountAmount,
            ppnAmount,
            itemTotal,
          } = calculateItemTotals(item);

          return {
            sub_total: acc.sub_total + subtotalBeforeDiscount,
            discount_total: acc.discount_total + discountAmount,
            tax_total: acc.tax_total + ppnAmount,
            total: acc.total + itemTotal,
          };
        },
        { sub_total: 0, discount_total: 0, tax_total: 0, total: 0 },
      );

      setTotalCalculation(totals);

      return { ...prev, items, total: totals.total };
    });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (originalForm) {
      setForm(originalForm);
      calculateTotals(originalForm.items);
    }
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      // Update existing PO
      const response = await updatePurchaseOrderVendor(form);

      if (response?.status) {
        toast({
          title: "Berhasil!",
          description: `Berhasil Update Pesanan Perusahaan`,
        });

        if (isEditMode) {
          setIsEditMode(false);
          // Refresh data
          fetchData();
        } else {
          navigate("/po-clients");
        }
      } else {
        toast({
          title: "Gagal!",
          description:
            response?.messages ||
            `Gagal ${
              isEditMode ? "mengupdate" : "menambahkan"
            } pesanan vendor.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    }
  };

  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Vendor[]>([]);

  const handleSearchVendor = (val: string) => {
    setClientSearch(val);

    if (val.trim() === "") {
      setFilteredClients([]);
      return;
    }

    const results = vendors.filter((c) =>
      c.name.toLowerCase().includes(val.toLowerCase()),
    );
    setFilteredClients(results);
  };

  const handleSelectClient = (client: Client) => {
    setForm((prev) => ({ ...prev, vendor_id: Number(client.id) }));
    setClientSearch(client.name);
    setFilteredClients([]);
  };
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

  /**
   * Return a badge component with the given status and color.
   *
   * @param {string} status - status of the client
   * @param {BadgeVariant} color - color of the badge
   * @returns {JSX.Element} - a badge component
   */

  const getStatusBadge = (status: string, color: BadgeVariant) => {
    return <Badge variant={color}>{status}</Badge>;
  };
  const handleResubmitOrder = async () => {
    const response = await feedbackOrderVendor({
      purchase_order_vendor_id: detailPurchaseOrderVendor?.id,
      progress_type_code: "WAIT_FOR_APPROVAL",
      finance_callback_reason: undefined,
    });
    if (response?.status)
      toast({
        title: "Berhasil!",
        description: `Berhasil mengajukan ulang pesanan vendor.`,
      });
    fetchData();
  };
  const handleUnitChange = (index: number, unitCode: string) => {
    const units = productUnits[index] || [];
    const selectedUnit = units.find((unit) => unit.unit_code === unitCode);

    if (selectedUnit) {
      // Update unit code dan price secara bersamaan
      updateItem(index, "unit_code", selectedUnit.unit_code);
      updateItem(index, "price", selectedUnit.price);
    } else {
      updateItem(index, "price", 0);
      // Jika unit tidak ditemukan, hanya update unit code
      updateItem(index, "unit_code", unitCode);
    }
  };
  const buttonEdit = () => {
    // contoh validasi tambahan jika perlu:
    if (
      detailPurchaseOrderVendor?.progress_type_code ===
        "VENDOR_ORDER_APPROVED" ||
      detailPurchaseOrderVendor?.progress_type_code === "WAREHOUSE_LOADING" ||
      detailPurchaseOrderVendor?.progress_type_code ===
        "ORDER_RECEIVED_WAREHOUSE"
    )
      return null;

    return !isEditMode && detailPurchaseOrderVendor ? (
      <Button onClick={handleEdit} className="flex items-center gap-2">
        <Pencil className="w-4 h-4" />
        Edit
      </Button>
    ) : (
      <Button
        variant="outline"
        onClick={handleCancel}
        className="flex items-center gap-2"
      >
        <PencilOff className="w-4 h-4" />
        Batal
      </Button>
    );
  };
  console.log(form, "oke");
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Pesanan</h1>
          <p className="text-muted-foreground">Edit Pesanan Perusahaan</p>
        </div>
      </div>
      {detailPurchaseOrderVendor?.progress_type_code ===
        "VENDOR_ORDER_REJECTED" && (
        <section className="mt-6 bg-white dark:bg-zinc-900 border border-destructive/20 rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-destructive/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-destructive rounded-full"></div>
              <div>
                <h2 className="text-xl font-bold text-destructive">
                  Pesanan Ini Ditolak
                </h2>
                <p className="text-sm mt-1">Ditolak oleh tim finance pada </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Status Card */}
            <div className="group bg-gradient-to-br from-destructive/5 to-red-50 dark:from-destructive/10 dark:to-red-900/20 border border-destructive/20 hover:border-destructive/30 hover:shadow-lg transition-all duration-300 rounded-xl p-5 cursor-pointer">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 space-y-3">
                  {/* Reason */}
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Alasan Penolakan
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {detailPurchaseOrderVendor?.finance_callback_reason ||
                          "Tidak ada alasan yang diberikan"}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Ditolak pada:{" "}
                      {formatDate(
                        detailPurchaseOrderVendor?.finance_callback_at,
                        "DD MMMM YYYY HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>
                      Finance: {detailPurchaseOrderVendor?.finance_callback_by}
                    </span>
                  </div>
                </div>

                {/* Right Content - Status Badge & Button */}
                <div className="flex flex-col gap-3 items-start lg:items-end">
                  {/* Status Badge */}
                  <span className="text-sm font-semibold text-destructive">
                    {getStatusBadge(
                      detailPurchaseOrderVendor?.type,
                      String(
                        detailPurchaseOrderVendor?.type_badge,
                      ) as BadgeVariant,
                    )}
                  </span>

                  {/* Button dengan styling yang lebih baik */}
                  {!isEditMode && (
                    <Button
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors duration-200 font-medium px-4 py-2 rounded-lg"
                      onClick={() => handleResubmitOrder()}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Ajukan Ulang Pesanan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {buttonEdit()}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client */}
            <div className="space-y-2 relative">
              <Label>Vendor</Label>
              <Input
                placeholder="Cari Vendor"
                readOnly={!isEditMode}
                value={clientSearch}
                onChange={(e) => handleSearchVendor(e.target.value)}
              />

              {/* Suggestion List */}
              {filteredClients.length > 0 && (
                <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      onClick={() => {
                        setSelectedSupplier(c);
                        handleSelectClient(c as Client);
                        setClientSearch(c.name); // Set input value ke nama klien yang dipilih
                        setFilteredClients([]); // clear suggestions
                        setForm((prev) => ({
                          ...prev,
                          vendor_id: Number(c.id),
                        }));
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Jika tidak ada hasil dan input tidak kosong, TAPI hanya tampilkan jika belum memilih klien yang existing */}
              {filteredClients.length === 0 &&
                clientSearch.trim() !== "" &&
                !vendors.some(
                  (c) => c.name.toLowerCase() === clientSearch.toLowerCase(),
                ) && (
                  <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                    <button
                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      onClick={() => setIsAddClientModalOpen(true)}
                    >
                      + Tambah klien "{clientSearch}"
                    </button>
                  </div>
                )}
            </div>
            {selectedSupplier && (
              <div className="p-3 bg-accent rounded-lg">
                <div className="text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    Vendor terpilih:{" "}
                    <span className="font-semibold">
                      {selectedSupplier.name}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {clientSearch &&
              !selectedSupplier &&
              filteredClients.length === 0 &&
              !vendors.some(
                (v) => v.name.toLowerCase() === clientSearch?.toLowerCase(),
              ) && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800">
                    Tekan Enter atau pilih dari dropdown untuk memastikan vendor
                    terpilih
                  </div>
                </div>
              )}
            {/* Detail vendor */}
            {selectedSupplier && (
              <Card className="bg-muted/50 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {selectedSupplier.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Vendor Terpilih
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {selectedSupplier.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedSupplier.phone}</span>
                          </div>
                        )}

                        {selectedSupplier.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{selectedSupplier.email}</span>
                          </div>
                        )}
                      </div>

                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => {
                            setSelectedSupplier(null);
                            setClientSearch("");
                            setForm((prev) => ({ ...prev, vendor_id: null }));
                          }}
                        >
                          Hapus pilihan
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Tanggal & Payment */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal Input</Label>
                <Input
                  type="date"
                  readOnly={!isEditMode}
                  value={form.input_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      input_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Kirim</Label>
                <Input
                  type="date"
                  readOnly={!isEditMode}
                  value={form.send_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      send_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo (hari)</Label>
                <Input
                  type="number"
                  readOnly={!isEditMode}
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select
                  disabled={!isEditMode}
                  value={form.payment_method_code}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      payment_method_code: val,
                    }))
                  }
                >
                  <SelectTrigger>
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
                {form.progress_type_code === "WAIT_FOR_APPROVAL" ||
                  (form.progress_type_code === "VENDOR_ORDER_REJECTED" && (
                    <Button size="sm" onClick={addItem}>
                      + Tambah Item
                    </Button>
                  ))}
              </div>
              {form.items.map((item, idx) => {
                const {
                  subtotalBeforeDiscount,
                  discountAmount,
                  ppnAmount,
                  itemTotal,
                } = calculateItemTotals(item);

                return (
                  <div
                    key={idx}
                    className="p-4 border rounded-md grid gap-4 md:grid-cols-3"
                  >
                    {/* Produk */}
                    <div className="space-y-2 relative">
                      <Label>Produk</Label>
                      <Select
                        value={item.product_id?.toString() || ""}
                        disabled={!isEditMode}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(
                            (p) => p.id.toString() === value,
                          );
                          if (selectedProduct) {
                            updateItem(idx, "product_id", selectedProduct.id);
                            updateItem(idx, "name", selectedProduct.name);
                            updateItem(idx, "description", null);
                            updateItem(idx, "product_detail_id", null);
                            updateItem(idx, "unit_code", "");
                            updateItem(idx, "price", null);
                            fetchProductDetail(selectedProduct.id, idx, 0);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Nama Produk" />
                        </SelectTrigger>

                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Cari produk..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="h-8"
                            />
                          </div>

                          {(products || [])
                            .filter((p) =>
                              p.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                            )
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </SelectItem>
                            ))}

                          {products.filter((p) =>
                            p.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">
                              Tidak ada produk ditemukan
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Deskripsi */}
                    <div className="space-y-2 relative">
                      <Label>Deskripsi</Label>
                      <Select
                        disabled={
                          !item.product_id ||
                          item.product_id === null ||
                          !isEditMode
                        }
                        value={item.product_detail_id?.toString() || ""}
                        onValueChange={(value) => {
                          const selectedDetail = productDetails[idx]?.find(
                            (pd) => pd.id.toString() === value,
                          );
                          if (selectedDetail) {
                            updateItem(
                              idx,
                              "description",
                              selectedDetail.description,
                            );
                            updateItem(
                              idx,
                              "product_detail_id",
                              selectedDetail.id,
                            );
                            updateItem(idx, "unit_code", "");
                            updateItem(idx, "price", null);

                            // Extract units dari product detail yang dipilih
                            const units: ProductUnit[] = [];
                            if (
                              selectedDetail.units &&
                              Array.isArray(selectedDetail.units)
                            ) {
                              selectedDetail.units.forEach((unit: any) => {
                                units.push({
                                  unit_code: unit.unit_code,
                                  price: unit.price,
                                  product_detail_id: selectedDetail.id,
                                });
                              });
                            }
                            setProductUnits((prev) => ({
                              ...prev,
                              [idx]: units,
                            }));

                            // reset search setelah pilih
                            setDescSearchTerm("");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih deskripsi" />
                        </SelectTrigger>

                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Cari deskripsi..."
                              value={descSearchTerm}
                              onChange={(e) =>
                                setDescSearchTerm(e.target.value)
                              }
                              className="h-8"
                            />
                          </div>

                          {(productDetails[idx] || [])
                            .filter((pd) =>
                              pd.description
                                .toLowerCase()
                                .includes(descSearchTerm.toLowerCase()),
                            )
                            .map((pd) => (
                              <SelectItem key={pd.id} value={pd.id.toString()}>
                                {pd.description}
                              </SelectItem>
                            ))}

                          {(productDetails[idx] || []).filter((pd) =>
                            pd.description
                              .toLowerCase()
                              .includes(descSearchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">
                              Tidak ada deskripsi ditemukan
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Unit */}
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        value={item.unit_code}
                        disabled={!isEditMode}
                        onValueChange={(value) => handleUnitChange(idx, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {(productUnits[idx] || []).map((unit) => (
                            <SelectItem
                              key={unit.unit_code}
                              value={unit.unit_code}
                            >
                              {unit.unit_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Harga Satuan</Label>
                      <PriceInput
                        value={item.price || null}
                        onChange={(val) => updateItem(idx, "price", val)}
                        readOnly={!isEditMode || item.unit_code === ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        readOnly={!isEditMode}
                        type="number"
                        value={item.quantity === null ? "" : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(
                            idx,
                            "quantity",
                            val === "" ? null : Number(val),
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%) Opsional</Label>
                      <Input
                        readOnly={!isEditMode}
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={item.discount_percentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(
                            idx,
                            "discount_percentage",
                            val === "" ? "" : String(val),
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Amount</Label>
                      <PriceInput
                        readOnly={!isEditMode}
                        onChange={(value) =>
                          updateItem(idx, "discount_amount", value || 0)
                        }
                        value={discountAmount}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        disabled={!isEditMode}
                        checked={item?.is_ppn}
                        onCheckedChange={(val) =>
                          updateItem(idx, "is_ppn", Boolean(val))
                        }
                      />
                      <Label>PPN(11%)</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>PPN(11%)</Label>
                      <PriceInput
                        readOnly={true}
                        onChange={(val) => null}
                        value={ppnAmount}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sub Total</Label>
                      <PriceInput
                        readOnly={true}
                        onChange={(val) => null}
                        value={subtotalBeforeDiscount}
                      />
                    </div>
                    {form.items.length > 1 &&
                    form.progress_type_code === "WAIT_FOR_APPROVAL" ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="self-end md:col-span-3"
                        onClick={() => removeItem(idx)}
                      >
                        Hapus
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Summary Section */}
            <div className="border-t pt-4 space-y-2">
              {/* Sub Total */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Sub Total</span>
                <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.sub_total)}
                </span>
              </div>

              {/* Discount Total */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Total Discount</span>
                <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5 text-red-600">
                  - {formatIDR(totalCalculation.discount_total)}
                </span>
              </div>

              {/* PPN */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">PPN (11%)</span>
                <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.tax_total)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-semibold bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.total)}
                </span>
              </div>

              {isEditMode && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Batal</Button>
                  <Button onClick={() => handleSubmit()}>Simpan</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
