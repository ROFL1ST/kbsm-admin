"use client";
import { VariantProps } from "class-variance-authority";

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
  PrintTravelDocumentKey,
  usePurchaseOrderClients,
} from "@/contexts/PurchaseOrderClient.Context";
import {
  RequestPurchaseOrderStock,
  useProducts,
} from "@/contexts/Products.Context";
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
import { Edit, Pencil, PencilOff, Printer, TowerControl } from "lucide-react";
import { NotesClientModal } from "@/components/ui/NotesClientsModal";
import { ApiResponse } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import PriceInput from "@/components/ui/PriceInput";
import { UpdateRefundProofModal } from "./RefundProofTrxModal";

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
  price_percentage_up: string;
  price_amount_up: number;
  adjustment_quantity: string;
  adjustment_type: string | null;
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

export default function EditPurchaseOrderClientDetail({
  purchase_order_client_id,
}: {
  purchase_order_client_id?: string;
}) {
  const [problemProduct, setProblemProduct] = useState({
    purchase_order_client_id: null,
    assignment_by: null,
    driver_id: null,
    received_warehouse_proof: null,
    received_warehouse_date: null,
    send_to_client_date: null,
    is_return: null,
    refund: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {}
  );
  const {
    clients,
    products,
    detailPurchaseOrderClient,
    isLoading,
    updatePurchaseOrderClientRefundProduct,
    getAssets,
    printTravelDocument,
    handleDetailPurchaseOrderClient,
    getValidationStockByID,
    updatePurchaseOrderClient,
    getPurchaseOrderClientProblemProduct,
  } = usePurchaseOrderClients();
  const { requestPurchaseOrderStock } = useProducts();

  const { getProductDetails } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const navigate = useNavigate();

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
        adjustment_quantity: "0",
        adjustment_type: null,
      },
    ],
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [originalForm, setOriginalForm] = useState(null);
  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [travelDocument, setTravelDocument] = useState<ApiResponse>(null);
  const [totalCalculation, setTotalCalculation] = useState<Calculation>({
    sub_total: 0,
    discount_total: 0,
    tax_total: 0,
    total: 0,
  });
  const [descSearch, setDescSearch] = useState<Record<number, string[]>>({});
  const { toast } = useToast();
  const location = useLocation();
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({});
  // 🔹 Fungsi untuk menghitung discount amount dan total per item
  const calculateItemTotals = (item: Item) => {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const priceUp = item.price_amount_up || 0;

    // Validasi discount_percentage max 100 juga di sini untuk konsistensi
    let discountPercentage = item.discount_percentage
      ? parseFloat(item.discount_percentage)
      : 0;
    let priceUpPercentage = item.price_percentage_up
      ? parseFloat(item.price_percentage_up)
      : 0;

    if (discountPercentage > 100) {
      discountPercentage = 100;
    }
    if (discountPercentage < 0) {
      discountPercentage = 0;
    }
    if (priceUpPercentage > 100) {
      priceUpPercentage = 100;
    }
    if (priceUpPercentage < 0) {
      priceUpPercentage = 0;
    }

    const subtotalBeforeDiscount = qty * (price + priceUp);
    const discountAmount =
      item.discount_amount !== undefined
        ? Math.min(item.discount_amount, subtotalBeforeDiscount)
        : (subtotalBeforeDiscount * discountPercentage) / 100;

    // Pastikan discount percentage konsisten dengan amount dan max 100
    const actualDiscountPercentage =
      subtotalBeforeDiscount > 0
        ? Math.min((discountAmount / subtotalBeforeDiscount) * 100, 100)
        : 0;

    const subtotalAfterDiscount = Math.max(
      subtotalBeforeDiscount - discountAmount,
      0
    );
    const ppnAmount = item.is_ppn ? subtotalAfterDiscount * 0.11 : 0;
    const itemTotal = subtotalAfterDiscount + ppnAmount;

    return {
      subtotalBeforeDiscount,
      discountAmount,
      discountPercentage: formatDecimal(actualDiscountPercentage), // Format decimal
      subtotalAfterDiscount,
      ppnAmount,
      itemTotal,
    };
  };

  useEffect(() => {
    if (detailPurchaseOrderClient) {
      const data = detailPurchaseOrderClient;
      setClientSearch(data.name);
      const formattedItems = data.products.map((product) => ({
        product_id: product.product_id,
        product_detail_id: product.product_detail_id,
        name: product.product_name,
        description: product.description,
        quantity: product.quantity,
        is_ppn: product.ppn_percentage > 0,
        unit_code: product.unit_code,
        price: product.price,
        adjustment_quantity: product.adjustment_quantity,
        adjustment_type: product.adjustment_type,
        discount_percentage: product.discount_percentage
          ? String(product.discount_percentage)
          : "",
        discount_amount: product.discount_amount || 0,
        price_percentage_up: product.price_percentage_up
          ? String(product.price_percentage_up)
          : "",
        price_amount_up: product.price_amount_up || 0,
      }));

      const inputDate = data?.input_date
        ? new Date(data.input_date).toLocaleDateString("en-CA")
        : "";

      const dueDate = data?.due_date
        ? new Date(data.due_date).toLocaleDateString("en-CA")
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
        due_date: dueDate,
        payment_method_code: data.payment_method_code,
        items: formattedItems,
      };

      setForm(newForm);
      setOriginalForm(newForm);
      calculateTotals(formattedItems);

      const foundClient = clients.find((c) => c.id === Number(data.client_id));
      if (foundClient) {
        setSelectedClient(foundClient);
        setClientSearch(foundClient.name);
      }
      formattedItems.forEach((item, idx) => {
        if (item.product_id) {
          fetchProductDetail(
            item.product_id!,
            idx,
            item.product_detail_id ?? 0
          );
        }
      });
    }
  }, [detailPurchaseOrderClient]);

  const calculateTotals = (items) => {
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

  const fetchData = async () => {
    try {
      const data = await handleDetailPurchaseOrderClient({
        purchase_order_client_id: purchase_order_client_id,
      });
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };
  const validationStock = async () => {
    try {
      const response = await getValidationStockByID({
        purchase_order_client_id: purchase_order_client_id,
        purchase_order_client_problem_id: "N",
      });
      setTravelDocument(response);
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };
  const fetchProblemProduct = async () => {
    const response = await getPurchaseOrderClientProblemProduct({
      purchase_order_client_id,
    });
    setProblemProduct(response.data);
  };
  useEffect(() => {
    validationStock();
    fetchData();
    getAssets();
    fetchProblemProduct();
  }, []);

  const fetchProductDetail = async (
    product_id: number,
    index: number,
    product_detail_id: number
  ) => {
    try {
      const data = await getProductDetails(product_id); // expect array
      console.log(product_id, index, product_detail_id, "ok");

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
          (detail: any) => detail?.id === product_detail_id
        );
        if (!selectedDetail) {
          console.warn(`Product detail ID ${product_detail_id} not found`);
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
          ])
        );
        const uniqueUnits: ProductUnit[] = Array.from(uniqueUnitsMap.values());

        setProductUnits((prev) => ({ ...prev, [index]: uniqueUnits }));
        setProductDetails((prev) => ({ ...prev, [index]: data })); // store full array for description selection
        return;
      }

      // Jika tidak ada product_detail_id:
      // - Jika hanya 1 detail -> auto select it
      // - Jika banyak detail -> tampilkan daftar deskripsi, units kosong sampai user pilih deskripsi
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
          ])
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
          price_percentage_up: "",
          price_amount_up: 0,
          adjustment_quantity: "0",
          adjustment_type: null,
        },
      ],
    }));
  };
  const formatDecimal = (number: number): number => {
    return Math.round(number * 100) / 100; // 2 digit desimal
  };
  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

    setProductUnits((prev) => {
      const newUnits = { ...prev };
      delete newUnits[index];
      return newUnits;
    });
  };
  const handleUnitChange = (index: number, unitCode: string) => {
    const units = productUnits[index] || [];
    const selectedUnit = units.find((unit) => unit.unit_code === unitCode);

    if (selectedUnit) {
      // Update unit code dan price secara bersamaan
      updateItem(index, "unit_code", selectedUnit.unit_code);
      updateItem(index, "price", selectedUnit.price);
    } else {
      // Jika unit tidak ditemukan, hanya update unit code
      updateItem(index, "unit_code", unitCode);
    }
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      const currentItem = { ...items[index] };

      // Update field yang diubah
      (currentItem as any)[field] = value;

      // Handle two-way calculation untuk field yang saling terkait
      if (["quantity", "is_ppn"].includes(field)) {
        // Jika quantity atau is_ppn berubah, hitung ulang semua nilai terkait
        const { discountAmount, discountPercentage } =
          calculateItemTotals(currentItem);
        currentItem.discount_amount = discountAmount;
        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
      } else if (field === "price") {
        // Jika price diubah secara manual, reset price_percentage_up dan price_amount_up
        const newPrice = value === "" ? 0 : parseFloat(value) || 0;

        // Reset price increase fields karena harga dasar berubah
        currentItem.price_percentage_up = "0";
        currentItem.price_amount_up = 0;
        currentItem.price = newPrice;

        // Hitung ulang discount berdasarkan harga baru
        const { discountAmount, discountPercentage } =
          calculateItemTotals(currentItem);
        currentItem.discount_amount = discountAmount;
        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
      } else if (field === "discount_percentage") {
        // Jika discount_percentage diubah, validasi max 100 dan hitung discount_amount
        let discountPercentage = value === "" ? 0 : parseFloat(value) || 0;

        // Validasi: discount_percentage tidak boleh lebih dari 100
        if (discountPercentage > 100) {
          discountPercentage = 100;
        }
        // Validasi: discount_percentage tidak boleh kurang dari 0
        if (discountPercentage < 0) {
          discountPercentage = 0;
        }

        const qty = currentItem.quantity || 0;
        const price = currentItem.price || 0;
        const priceAmountUp = currentItem.price_amount_up || 0;

        // Hitung harga setelah penambahan (price increase)
        const priceAfterIncrease = price + priceAmountUp;
        const subtotalBeforeDiscount = qty * priceAfterIncrease;

        const discountAmount =
          (subtotalBeforeDiscount * discountPercentage) / 100;

        currentItem.discount_amount = discountAmount;
        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
      } else if (field === "discount_amount") {
        // Jika discount_amount diubah, hitung discount_percentage (otomatis terbatas max 100)
        const qty = currentItem.quantity || 0;
        const price = currentItem.price || 0;
        const priceAmountUp = currentItem.price_amount_up || 0;
        const discountAmount = value || 0;

        // Hitung harga setelah penambahan (price increase)
        const priceAfterIncrease = price + priceAmountUp;
        const subtotalBeforeDiscount = qty * priceAfterIncrease;

        let discountPercentage = 0;
        if (subtotalBeforeDiscount > 0) {
          discountPercentage = (discountAmount / subtotalBeforeDiscount) * 100;

          // Validasi: discount_percentage tidak boleh lebih dari 100
          if (discountPercentage > 100) {
            discountPercentage = 100;
            // Sesuaikan juga discount_amount agar konsisten
            currentItem.discount_amount = subtotalBeforeDiscount;
          }
        }

        // Validasi: discount_percentage tidak boleh kurang dari 0
        if (discountPercentage < 0) {
          discountPercentage = 0;
          currentItem.discount_amount = 0;
        }

        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
        currentItem.discount_amount =
          currentItem.discount_amount || discountAmount;
      } else if (field === "price_percentage_up") {
        // Jika price_percentage_up diubah, hitung price_amount_up dan update harga
        let percentageUp = value === "" ? 0 : parseFloat(value) || 0;

        // Validasi: percentage_up tidak boleh kurang dari 0
        if (percentageUp < 0) {
          percentageUp = 0;
        }

        const basePrice = currentItem.price || 0;
        const amountUp = (basePrice * percentageUp) / 100;

        currentItem.price_amount_up = amountUp;
        currentItem.price_percentage_up =
          formatDecimal(percentageUp).toString();

        // Hitung ulang discount berdasarkan harga baru
        const { discountAmount, discountPercentage } =
          calculateItemTotals(currentItem);
        currentItem.discount_amount = discountAmount;
        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
      } else if (field === "price_amount_up") {
        // Jika price_amount_up diubah, hitung price_percentage_up dan update harga
        let amountUp = value === "" ? 0 : parseFloat(value) || 0;

        // Validasi: amount_up tidak boleh kurang dari 0
        if (amountUp < 0) {
          amountUp = 0;
        }

        const basePrice = currentItem.price || 0;

        let percentageUp = 0;
        if (basePrice > 0) {
          percentageUp = (amountUp / basePrice) * 100;
          // Bisa lebih dari 100% (tidak ada batasan maksimal)
        }

        currentItem.price_amount_up = amountUp;
        currentItem.price_percentage_up =
          formatDecimal(percentageUp).toString();

        // Hitung ulang discount berdasarkan harga baru
        const { discountAmount, discountPercentage } =
          calculateItemTotals(currentItem);
        currentItem.discount_amount = discountAmount;
        currentItem.discount_percentage =
          formatDecimal(discountPercentage).toString();
      }

      items[index] = currentItem;

      // Hitung totals untuk semua items
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
        { sub_total: 0, discount_total: 0, tax_total: 0, total: 0 }
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
      const response = await updatePurchaseOrderClient(form);

      if (response?.status) {
        toast({
          title: "Berhasil!",
          description: `Berhasil Update Pesanan Klien`,
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
            `Gagal ${isEditMode ? "mengupdate" : "menambahkan"} pesanan klien.`,
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

  const handleSelectClient = (client: Client) => {
    setForm((prev) => ({ ...prev, client_id: Number(client.id) }));
    setClientSearch(client.name);
    setSelectedClient(client);
    setFilteredClients([]);
  };
  const handlePrint = async (data: PrintTravelDocumentKey) => {
    const response = await printTravelDocument({
      purchase_order_client_id: purchase_order_client_id,
      description: data.description,
      driver_id: data.driver_id,
    });

    if (!response.status)
      toast({
        title: "Peringatan",
        description: response.messages,
        variant: "destructive",
      });
  };
  const handleRequestPOV = async (data: RequestPurchaseOrderStock) => {
    const response = await requestPurchaseOrderStock(data);
    if (response.status)
      toast({
        title: "Permintaan Stok",
        description: "Permintaan anda sudah dikirim",
      });
  };
  const handleValidationStock = (params) => {
    if (travelDocument?.status) {
      handlePrint(params);
    } else {
      handleRequestPOV({
        purchase_order_client_id: purchase_order_client_id,
        request: travelDocument.data,
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [descSearchTerm, setDescSearchTerm] = useState("");
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  const getStatusBadge = (status: string, color: BadgeVariant) => {
    return <Badge variant={color}>{status}</Badge>;
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Pesanan" : "Detail Pesanan"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Edit Pesanan Klien" : "Lihat Detail Pesanan Klien"}
          </p>
        </div>

        <div className="flex gap-2">
          <NotesClientModal
            title={`${
              !travelDocument?.status ? "Validasi Stok" : "Print Surat Jalan"
            }`}
            data={travelDocument}
            confirmText={`${
              !travelDocument?.status ? "Permintaan Penambahan Stok" : "Print"
            }`}
            cancelText="Batal"
            variant="outline"
            showIcon={false}
            handlePrint={handleValidationStock}
            trigger={
              <Button>
                <Printer />
                Print Surat Jalan
              </Button>
            }
          />
          {!isEditMode ? (
            <>
              <Button onClick={handleEdit}>
                <Pencil />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <PencilOff />
                Batal
              </Button>
            </>
          )}
        </div>
      </div>
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
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
              {isEditMode && filteredClients.length > 0 && (
                <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                      onClick={() => {
                        handleSelectClient(c);
                        setClientSearch(c.name);
                        setFilteredClients([]);
                        setForm((prev) => ({
                          ...prev,
                          client_id: Number(c.id),
                        }));
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}

              {isEditMode &&
                filteredClients.length === 0 &&
                clientSearch.trim() !== "" &&
                !clients.some(
                  (c) => c.name.toLowerCase() === clientSearch.toLowerCase()
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
            {selectedClient && (
              <Card className="bg-muted/50 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedClient.path}
                        alt={selectedClient.name}
                      />
                      <AvatarFallback>
                        {selectedClient.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {selectedClient.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Klien Terpilih
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {selectedClient.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}

                        {selectedClient.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{selectedClient.email}</span>
                          </div>
                        )}
                        {selectedClient.type_value && (
                          <div className="flex items-center gap-1">
                            <TowerControl className="h-3 w-3" />
                            <span>{selectedClient.type_value}</span>
                          </div>
                        )}
                      </div>
                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className=" text-xs text-muted-foreground"
                          onClick={() => {
                            setSelectedClient(null);
                            setClientSearch("");
                            setForm((prev) => ({ ...prev, client_id: null }));
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
                <Label>Sales</Label>
                <Input
                  type="text"
                  value={detailPurchaseOrderClient?.created_by}
                  readOnly={true}
                  className="bg-muted"
                />
              </div>
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
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-muted" : ""}
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
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo (hari)</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-muted" : ""}
                />
                {/* <Input
                  type="number"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-muted" : ""}
                /> */}
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-2">
                <Label>Status Pembayaran: </Label>
                {form?.status_trx_code === "PAID"
                  ? getStatusBadge(
                      form?.status_trx_code === "PAID" && "Sudah Lunas",
                      "green"
                    )
                  : getStatusBadge(
                      form?.status_trx_code === "PENDING" && "Belum Lunas",
                      "yellow"
                    )}
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
                  disabled={!isEditMode}
                >
                  <SelectTrigger className={!isEditMode ? "bg-muted" : ""}>
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
                {isEditMode && (
                  <Button size="sm" onClick={addItem}>
                    + Tambah Item
                  </Button>
                )}
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
                        disabled={isEditMode === false}
                        value={item.product_id?.toString() || ""}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(
                            (p) => p.id.toString() === value
                          );
                          if (selectedProduct) {
                            updateItem(idx, "product_id", selectedProduct.id);
                            updateItem(idx, "name", selectedProduct.name);
                            fetchProductDetail(selectedProduct.id, idx, 0);
                          }
                        }}
                      >
                        <SelectTrigger
                          className={!isEditMode ? "bg-muted w-full" : "w-full"}
                        >
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
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </SelectItem>
                            ))}

                          {products.filter((p) =>
                            p.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
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
                          isEditMode === false
                        }
                        value={item.product_detail_id?.toString() || ""}
                        onValueChange={(value) => {
                          const selectedDetail = productDetails[idx]?.find(
                            (pd) => pd.id.toString() === value
                          );
                          if (selectedDetail) {
                            updateItem(
                              idx,
                              "description",
                              selectedDetail.description
                            );
                            updateItem(
                              idx,
                              "product_detail_id",
                              selectedDetail.id
                            );

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
                        <SelectTrigger
                          className={!isEditMode ? "bg-muted w-full" : "w-full"}
                        >
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
                                .includes(descSearchTerm.toLowerCase())
                            )
                            .map((pd) => (
                              <SelectItem key={pd.id} value={pd.id.toString()}>
                                {pd.description}
                              </SelectItem>
                            ))}

                          {(productDetails[idx] || []).filter((pd) =>
                            pd.description
                              .toLowerCase()
                              .includes(descSearchTerm.toLowerCase())
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
                        disabled={isEditMode === false}
                        value={item.unit_code}
                        onValueChange={(value) => handleUnitChange(idx, value)}
                      >
                        <SelectTrigger
                          className={!isEditMode ? "bg-muted w-full" : "w-full"}
                        >
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
                        value={item.price || 0}
                        onChange={(val) => updateItem(idx, "price", val)}
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity === null ? "" : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(
                            idx,
                            "quantity",
                            val === "" ? null : Number(val)
                          );
                        }}
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%) Opsional</Label>
                      <Input
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
                            val === "" ? "" : String(val)
                          );
                        }}
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount Amount</Label>
                      <PriceInput
                        value={discountAmount}
                        readOnly={!isEditMode}
                        onChange={(val) =>
                          updateItem(idx, "discount_amount", val)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Naikan Harga (%)</Label>
                      <Input
                        type="text"
                        placeholder="0"
                        disabled={!isEditMode}
                        min={"0"}
                        // Hapus max={"100"} karena bisa lebih dari 100%
                        value={item.price_percentage_up ?? ""} // Gunakan nullish coalescing untuk handle undefined
                        onChange={(e) => {
                          const val = e.target.value;
                          // Validasi input hanya angka dan decimal
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            updateItem(
                              idx,
                              "price_percentage_up",
                              val === "" ? "" : val
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Naikan Harga (Amount)</Label>
                      <PriceInput
                        onChange={(value) =>
                          updateItem(idx, "price_amount_up", value || 0)
                        }
                        value={item.price_amount_up || 0} // Gunakan price_amount_up dari item
                        readOnly={!isEditMode}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item?.is_ppn}
                        onCheckedChange={(val) =>
                          updateItem(idx, "is_ppn", Boolean(val))
                        }
                        disabled={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                      <Label>PPN(11%)</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>PPN(11%)</Label>
                      <PriceInput
                        value={ppnAmount}
                        readOnly={!isEditMode}
                        onChange={(val) => null}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sub Total</Label>
                      <PriceInput
                        value={subtotalBeforeDiscount}
                        readOnly={!isEditMode}
                        onChange={(val) => null}
                      />
                    </div>
                    {item.adjustment_quantity && (
                      <>
                        <div className="space-y-2">
                          <Label>Quantity Pengambilan</Label>
                          <Input
                            type="number"
                            value={item.adjustment_quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateItem(
                                idx,
                                "adjustment_quantity",
                                val === "" ? null : Number(val)
                              );
                            }}
                            readOnly={!isEditMode}
                            className={`${!isEditMode} ? "bg-muted" : ""  border border-red-500`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Realisasi Quantity</Label>
                          <Input
                            type="number"
                            value={
                              item.quantity -
                              Number(item.adjustment_quantity || 0)
                            }
                            readOnly={true}
                            className={`border border-red-500 bg-muted`}
                          />
                        </div>
                        {/* Tipe Pengembalian */}
                        {/* <div className="space-y-2">
                          <Label className="text-sm">Tipe Pengembalian</Label>
                          <Select
                            value={item.adjustment_type}
                            disabled={!isEditMode}
                            onValueChange={(e) =>
                              updateItem(idx, "adjustment_type", e)
                            }
                          >
                            <SelectTrigger
                              className={`${!isEditMode} ? "bg-muted" : ""  border border-red-500`}
                            >
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
                        </div> */}
                      </>
                    )}

                    {isEditMode && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="self-end md:col-span-3"
                        onClick={() => removeItem(idx)}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary Section */}
            <div className="border-t pt-4 space-y-2">
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

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">PPN (11%)</span>
                <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.tax_total)}
                </span>
              </div>

              {detailPurchaseOrderClient?.refund && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium cursor-pointer">
                    Total Refund
                  </span>

                  <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5 text-red-600">
                    -{" "}
                    {formatIDR(detailPurchaseOrderClient?.refund?.total_refund)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-semibold bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(
                    detailPurchaseOrderClient?.refund
                      ? totalCalculation.total -
                          detailPurchaseOrderClient?.refund?.total_refund
                      : totalCalculation.total
                  )}
                </span>
              </div>

              {isEditMode && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>Simpan</Button>
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
