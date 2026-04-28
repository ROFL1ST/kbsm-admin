"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Printer, TowerControl } from "lucide-react";
import PriceInput from "@/components/ui/PriceInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";

interface Item {
  product_id: number | null;
  product_detail_id: number | null;
  name: string;
  description: string | null;
  quantity: number | null;
  is_ppn: boolean;
  unit_code: string | null;
  price: number | null;
  discount_percentage: string;
  discount_amount: number;
  price_percentage_up: string;
  price_amount_up: number;
}

interface Calculation {
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
}

interface ProductUnit {
  unit_code: string;
  price: number | null;
  product_detail_id: number;
}

export default function EditPurchaseOrderClient() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {},
  );
  const {
    clients,
    products,
    detailPurchaseOrderClient,
    getAssets,
    handleDetailPurchaseOrderClient,
    updatePurchaseOrderClient,
  } = usePurchaseOrderClients();
  const { getProductDetails } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const navigate = useNavigate();
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({});
  const [form, setForm] = useState<FormStatePurchaseOrderClient>({
    purchase_order_client_id: undefined,
    progress_type_code: undefined,
    status_trx_code: undefined,
    client_id: null,
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
        description: null,
        quantity: null,
        is_ppn: false,
        unit_code: "PCS",
        price: null,
        discount_percentage: "",
        discount_amount: 0,
        price_percentage_up: "",
        price_amount_up: 0,
      },
    ],
  });

  const [originalForm, setOriginalForm] =
    useState<FormStatePurchaseOrderClient | null>(null);
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [descSearchTerm, setDescSearchTerm] = useState("");

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
      0,
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
  const formatDecimal = (number: number): number => {
    return Math.round(number * 100) / 100; // 2 digit desimal
  };
  useEffect(() => {
    if (detailPurchaseOrderClient) {
      const data = detailPurchaseOrderClient;
      setClientSearch(data.name);
      console.log(data, "detailPurchaseOrderClient");
      const formattedItems: Item[] = data.products.map((product) => ({
        product_id: product.product_id,
        product_detail_id: product.product_detail_id,
        name: product.product_name,
        description: product.description ?? null,
        quantity: product.quantity,
        is_ppn: product.ppn_percentage > 0,
        unit_code: product.unit_code ?? null,
        price: product.price ?? null,
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

      const sendDate = data?.send_date
        ? new Date(data.send_date).toLocaleDateString("en-CA")
        : "";
      const dueDate = data?.due_date
        ? new Date(data.due_date).toLocaleDateString("en-CA")
        : "";

      const newForm: FormStatePurchaseOrderClient = {
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

      // fetch product details per item (if product_id exists)
      formattedItems.forEach((item, idx) => {
        if (item.product_id) {
          // pass product_detail_id so fetchProductDetail can preselect
          fetchProductDetail(
            item.product_id!,
            idx,
            item.product_detail_id ?? 0,
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPurchaseOrderClient]);

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
      await handleDetailPurchaseOrderClient({
        purchase_order_client_id: location?.state,
      });
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };

  useEffect(() => {
    fetchData();
    getAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProductDetail = async (
    product_id: number,
    index: number,
    product_detail_id: number,
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
          (detail: any) => detail?.id === product_detail_id,
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
          ]),
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
          description: null,
          quantity: 0,
          is_ppn: true,
          unit_code: "PCS",
          price: 0,
          discount_percentage: "",
          discount_amount: 0,
          price_percentage_up: "",
          price_amount_up: 0,
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
        { sub_total: 0, discount_total: 0, tax_total: 0, total: 0 },
      );

      setTotalCalculation(totals);

      return { ...prev, items, total: totals.total };
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await updatePurchaseOrderClient(form);

      if (response?.status) {
        toast({
          title: "Berhasil!",
          description: `Berhasil Update Pesanan Klien`,
        });

        if (isEditMode) {
          setIsEditMode(false);
          fetchData();
        } else {
          navigate("/po-clients");
        }
      } else {
        toast({
          title: "Gagal!",
          description: "Form harus diisi semuanya",
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
      c.name.toLowerCase().includes(val.toLowerCase()),
    );
    setFilteredClients(results);
  };

  const handleSelectClient = (client: Client) => {
    setForm((prev) => ({ ...prev, client_id: Number(client.id) }));
    setClientSearch(client.name);
    setSelectedClient(client);
    setFilteredClients([]);
  };

  const handleUnitChange = (index: number, unitCode: string) => {
    const units = productUnits[index] || [];
    const selectedUnit = units.find((unit) => unit.unit_code === unitCode);

    if (selectedUnit) {
      updateItem(index, "unit_code", selectedUnit.unit_code);
      updateItem(index, "price", selectedUnit.price);
    } else {
      updateItem(index, "unit_code", unitCode);
    }
  };

  useEffect(() => {
    if (form.progress_type_code !== "FOLLOW_UP") {
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  }, [form.progress_type_code]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Pesanan</h1>
          <p className="text-muted-foreground">Edit Pesanan Klien</p>
        </div>
        <div className="flex"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={() =>
                navigate("/manage-adjusment-products", {
                  state: {
                    purchase_order_client_id: location?.state,
                    client_name: clientSearch,
                  },
                })
              }
            >
              Ajukan Pengembalian Barang
            </Button>
            {/* Client */}
            <div className="space-y-2 relative">
              <Label>Klien</Label>
              <Input
                placeholder="Cari klien"
                readOnly={!isEditMode}
                value={clientSearch}
                onChange={(e) => handleSearchClient(e.target.value)}
                className={!isEditMode ? "bg-muted" : ""}
              />

              {/* Suggestion List */}
              {filteredClients.length > 0 && (
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

              {filteredClients.length === 0 &&
                clientSearch.trim() !== "" &&
                !clients.some(
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
                <Label>Tanggal Input</Label>
                <Input
                  type="date"
                  readOnly={!isEditMode}
                  value={form.input_date}
                  className={!isEditMode ? "bg-muted" : ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, input_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Kirim</Label>
                <Input
                  type="date"
                  readOnly={!isEditMode}
                  value={form.send_date}
                  className={!isEditMode ? "bg-muted" : ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, send_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo (hari)</Label>
                <Input
                  type="date"
                  readOnly={!isEditMode}
                  value={form.due_date}
                  className={!isEditMode ? "bg-muted" : ""}
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
                  <SelectTrigger
                    className={!isEditMode ? "bg-muted w-full" : "w-full"}
                  >
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
                {form.progress_type_code === "FOLLOW_UP" && (
                  <Button size="sm" onClick={addItem}>
                    + Tambah Item
                  </Button>
                )}
              </div>

              {form?.items?.map((item, idx) => {
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
                        disabled={!isEditMode}
                        value={item.product_id?.toString() || ""}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(
                            (p) => p.id.toString() === value,
                          );
                          if (selectedProduct) {
                            updateItem(idx, "product_id", selectedProduct.id);
                            updateItem(idx, "name", selectedProduct.name);
                            updateItem(idx, "description", null);
                            updateItem(idx, "product_detail_id", null);
                            updateItem(idx, "unit_code", null);
                            updateItem(idx, "price", null);
                            // fetch product details list; pass 0 to indicate no preselected detail
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

                    {/* Deskripsi Produk */}
                    <div className="space-y-2 relative">
                      <Label>Deskripsi</Label>
                      <Select
                        value={item.product_detail_id?.toString() || ""}
                        disabled={!isEditMode}
                        onValueChange={(value) => {
                          const selectedDetail = productDetails[idx]?.find(
                            (pd) => pd.id.toString() === value,
                          );
                          if (selectedDetail) {
                            updateItem(
                              idx,
                              "description",
                              selectedDetail.description ?? null,
                            );
                            updateItem(
                              idx,
                              "product_detail_id",
                              selectedDetail.id,
                            );
                            updateItem(idx, "unit_code", null);
                            updateItem(idx, "price", null);

                            // Extract units dari product detail yang dipilih
                            const units: ProductUnit[] = [];
                            if (
                              selectedDetail.units &&
                              Array.isArray(selectedDetail.units)
                            ) {
                              selectedDetail.units.forEach((unit: any) => {
                                units.push({
                                  unit_code: String(unit.unit_code),
                                  price: unit.price ?? null,
                                  product_detail_id: selectedDetail.id,
                                });
                              });
                            }

                            // dedup unit_code (jaga-jaga)
                            const uniqueUnits = Array.from(
                              new Map(
                                units.map((u) => [u.unit_code, u]),
                              ).values(),
                            );

                            setProductUnits((prev) => ({
                              ...prev,
                              [idx]: uniqueUnits,
                            }));

                            // reset search setelah pilih
                            setDescSearchTerm("");
                          }
                        }}
                      >
                        <SelectTrigger
                          className={!isEditMode ? "bg-muted w-full" : "w-full"}
                        >
                          <SelectValue placeholder="Pilih deskripsi">
                            {item.description || ""}
                          </SelectValue>
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
                        value={item.unit_code || ""}
                        disabled={!isEditMode}
                        onValueChange={(value) => handleUnitChange(idx, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Unit" />
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
                        readOnly={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        readOnly={!isEditMode}
                        type="number"
                        value={item.quantity === null ? "" : item.quantity}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        className={!isEditMode ? "bg-muted" : ""}
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
                    <div className="space-y-2">
                      <Label>Naikan Harga Satuan (%)</Label>
                      <Input
                        type="text"
                        disabled={!isEditMode}
                        placeholder="0"
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
                              val === "" ? "" : val,
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Naikan Harga Satuan (Amount)</Label>
                      <PriceInput
                        readOnly={!isEditMode}
                        onChange={(value) =>
                          updateItem(idx, "price_amount_up", value || 0)
                        }
                        value={item.price_amount_up || 0} // Gunakan price_amount_up dari item
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
                        onChange={() => null}
                        value={ppnAmount}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sub Total</Label>
                      <PriceInput
                        readOnly={true}
                        onChange={() => null}
                        value={itemTotal}
                      />
                    </div>

                    {form.items.length > 1 &&
                    form.progress_type_code === "FOLLOW_UP" ? (
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
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Sub Total</span>
                <span className="text-sm font-medium bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.sub_total)}
                </span>
              </div>

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

              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-semibold bg-muted rounded-md px-3 py-1.5">
                  {formatIDR(totalCalculation.total)}
                </span>
              </div>

              {form.progress_type_code === "FOLLOW_UP" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    onClick={() => {
                      navigate("/po-clients");
                    }}
                    variant="outline"
                  >
                    Batal
                  </Button>
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
