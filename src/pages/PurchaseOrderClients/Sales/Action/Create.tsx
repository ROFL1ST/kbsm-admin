"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
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
import { set } from "date-fns";
import { formatIDR } from "@/components/format/IDR";
import { AddClientModal } from "@/pages/Clients/Actions/Create";
import { useLocation, useNavigate } from "react-router-dom";
import { number } from "zod";
import PriceInput from "@/components/ui/PriceInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Check,
  Mail,
  Phone,
  Plus,
  Search,
  TowerControl,
} from "lucide-react";

interface Item {
  product_id: number | null;
  product_detail_id: number | null;
  name: string; // untuk custom produk
  description: string;
  quantity: number;
  is_ppn: boolean;
  unit_code: string;
  price: number;
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

// Interface untuk unit produk
interface ProductUnit {
  unit_code: string;
  price: number;
  product_detail_id: number;
}

export default function CreatePurchaseOrderClient() {
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {},
  );
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({});
  const {
    clients,
    products,
    getClients,
    getAssets,
    createPurchaseOrderClient,
  } = usePurchaseOrderClients();
  const { getProductDetails } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
        description: "",
        quantity: 0,
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

  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [totalCalculation, setTotalCalculation] = useState<Calculation>({
    sub_total: 0,
    discount_total: 0,
    tax_total: 0,
    total: 0,
  });
  const [descSearch, setDescSearch] = useState<Record<number, string[]>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const clientFromCreation = location.state?.client;
  const fromClientCreation = location.state?.fromClientCreation ?? false;

  useEffect(() => {
    if (clientFromCreation && fromClientCreation) {
      setForm((prev) => ({
        ...prev,
        client_id: Number(clientFromCreation.id),
      }));
      setSelectedClient(clientFromCreation);
      setClientSearch(clientFromCreation.name);
      getAssets();
      // console.log("Client from creation:", clientFromCreation, form);
      toast({
        title: "Klien berhasil dibuat!",
        description: `Sekarang buat purchase order untuk ${clientFromCreation.name}.`,
      });
    }
  }, [clientFromCreation, fromClientCreation, toast]);
  const clientToShow =
    selectedClient ?? (fromClientCreation ? clientFromCreation : null);

  // const fetchClients = async () => {
  //   try {
  //     await getClients();
  //   } catch (error) {
  //     console.error("Failed to fetch purchase order clients:", error);
  //   }
  // };

  useEffect(() => {
    getAssets();
  }, []);

  // 🔹 Fungsi untuk menghitung discount amount dan total per item
  // const calculateItemTotals = (item: Item) => {
  //   const qty = item.quantity || 0;
  //   const price = item.price || 0;
  //   const discountPercentage = item.discount_percentage
  //     ? parseFloat(item.discount_percentage)
  //     : 0;

  //   const subtotalBeforeDiscount = qty * price;
  //   const discountAmount = (subtotalBeforeDiscount * discountPercentage) / 100;
  //   const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
  //   const ppnAmount = item.is_ppn ? subtotalAfterDiscount * 0.11 : 0;
  //   const itemTotal = subtotalAfterDiscount + ppnAmount;

  //   return {
  //     subtotalBeforeDiscount,
  //     discountAmount,
  //     subtotalAfterDiscount,
  //     ppnAmount,
  //     itemTotal,
  //   };
  // };

  // 🔹 Fetch detail product dan units
  const fetchProductDetail = async (product_id: number, index: number) => {
    try {
      const data = await getProductDetails(product_id);
      setProductDetails((prev) => ({ ...prev, [index]: data }));
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };
  // 🔹 Tambah item baru
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
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

    // Hapus juga data units untuk item ini
    setProductUnits((prev) => {
      const newUnits = { ...prev };
      delete newUnits[index];
      return newUnits;
    });
  };

  // tambahkan validasi ketika ada onChange price_percentage_up / price_amount_up maka naikan harga nya sesuai yang di input dan bisa input price_percentage_up lebih dari 100%, logic nya sama kaya discount akan tetapi ini tambah harga, karna kalo discount kurangi harga
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

  // Fungsi helper untuk memformat angka desimal (maksimal 2 digit)
  const formatDecimal = (number: number): number => {
    return Math.round(number * 100) / 100; // 2 digit desimal
  };

  // 🔹 Fungsi untuk handle perubahan unit
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

  // 🔹 Search produk suggestion
  const handleSearchProduct = (val: string, idx: number) => {
    updateItem(idx, "name", val);
    if (val.length > 1) {
      const filtered = products
        .filter((p) => p.name.toLowerCase().includes(val.toLowerCase()))
        .map((p) => p.name);
      setProductSearch(filtered);
    } else {
      setProductSearch([]);
    }
  };

  // 🔹 Search deskripsi suggestion
  const handleSearchDesc = (val: string, idx: number) => {
    updateItem(idx, "description", val);
    const details = productDetails[idx] ?? [];
    if (val.length > 1) {
      const filtered = details
        .filter((d) => d.description.toLowerCase().includes(val.toLowerCase()))
        .map((d) => d.description);
      setDescSearch((prev) => ({ ...prev, [idx]: filtered }));
    } else {
      setDescSearch((prev) => ({ ...prev, [idx]: [] }));
    }
  };

  const handleSubmit = async () => {
    const response = await createPurchaseOrderClient(form);
    if (response?.status) {
      toast({
        title: "Berhasil!",
        description: "Berhasil menambahkan pesanan klien.",
      });
      navigate("/po-clients");
    } else {
      toast({
        title: "Gagal!",
        description: "Form harus diisi semuanya",
        variant: "destructive",
      });
    }
  };

  // state
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // ketika user ketik
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

  // ketika pilih suggestion
  const handleSelectClient = (client: Client) => {
    setForm((prev) => ({ ...prev, client_id: Number(client.id) }));
    setClientSearch(client.name);
    setFilteredClients([]);
    setSelectedClient(client);
  };

  useEffect(() => {
    if (clientSearch === "") {
      setSelectedClient(null);
    }
  }, [clientSearch]);
  const [searchTerm, setSearchTerm] = useState("");
  const [descSearchTerm, setDescSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tambah Pesanan</h1>
          <p className="text-muted-foreground">Buat Pesanan Klien</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                Klien *
              </Label>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari atau tambah klien..."
                    value={clientSearch}
                    onChange={(e) => handleSearchClient(e.target.value)}
                    onFocus={() =>
                      clientSearch &&
                      setFilteredClients(
                        clients.filter((client) =>
                          client.name
                            .toLowerCase()
                            .includes(clientSearch.toLowerCase()),
                        ),
                      )
                    }
                    className="pl-10 pr-4"
                  />
                </div>

                {/* Dropdown hasil pencarian */}
                {filteredClients.length > 0 && (
                  <div className="absolute mt-1 w-full rounded-lg border bg-accent shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="cursor-pointer px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0 flex items-center justify-between"
                        onClick={() => {
                          handleSelectClient(client);
                          setClientSearch(client.name);
                          setFilteredClients([]);
                          setForm((prev) => ({
                            ...prev,
                            client_id: Number(client.id),
                          }));
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full"></div>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {client.email && (
                              <div className="text-xs text-muted-foreground">
                                {client.email}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedClient?.id === client.id && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Opsi tambah klien baru */}
                {filteredClients.length === 0 &&
                  clientSearch?.trim() !== "" &&
                  !clients.some(
                    (c) => c.name.toLowerCase() === clientSearch?.toLowerCase(),
                  ) && (
                    <div className="absolute mt-1 w-full rounded-lg border bg-accent shadow-lg z-50">
                      <button
                        className="w-full px-4 py-3 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setIsAddClientModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Tambah klien baru</div>
                          <div className="text-muted-foreground">
                            "{clientSearch}"
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
              </div>

              {/* Selected client info */}
              {selectedClient && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>
                      Klien terpilih:{" "}
                      <span className="font-semibold">
                        {selectedClient.name}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Validation state */}
              {clientSearch &&
                !selectedClient &&
                filteredClients.length === 0 &&
                !clients.some(
                  (c) => c.name.toLowerCase() === clientSearch?.toLowerCase(),
                ) && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      Tekan Enter atau pilih dari dropdown untuk memastikan
                      klien terpilih
                    </div>
                  </div>
                )}
            </div>

            {/* Card info klien terpilih */}
            {(selectedClient || clientFromCreation) && (
              <Card className="bg-muted/50 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={(selectedClient ?? clientFromCreation).path}
                        alt={(selectedClient ?? clientFromCreation).name}
                      />
                      <AvatarFallback>
                        {(selectedClient ?? clientFromCreation).name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {(selectedClient ?? clientFromCreation).name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Klien Terpilih
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {(selectedClient ?? clientFromCreation).phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>
                              {(selectedClient ?? clientFromCreation).phone}
                            </span>
                          </div>
                        )}

                        {(selectedClient ?? clientFromCreation).email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>
                              {(selectedClient ?? clientFromCreation).email}
                            </span>
                          </div>
                        )}

                        {(selectedClient ?? clientFromCreation).type !==
                          undefined && (
                          <div className="flex items-center gap-1">
                            <TowerControl className="h-3 w-3" />
                            <span>
                              {
                                (selectedClient ?? clientFromCreation)
                                  .type_value
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => {
                          setSelectedClient(null);
                          setClientSearch("");
                          setForm((prev) => ({ ...prev, client_id: null }));
                        }}
                      >
                        Hapus pilihan
                      </Button>
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
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                />
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
                            fetchProductDetail(selectedProduct.id, idx);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
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
                        <SelectTrigger className="w-full">
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
                        onValueChange={(value) => handleUnitChange(idx, value)}
                      >
                        <SelectTrigger className="w-full">
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
                        readOnly={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="text"
                        value={item.quantity === null ? "" : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(
                            idx,
                            "quantity",
                            val === "" ? 0 : Number(val),
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%) Opsional</Label>
                      <Input
                        type="text"
                        placeholder="0"
                        min={"0"}
                        max={"100"}
                        value={item.discount_percentage || 0}
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
                        onChange={(value) =>
                          updateItem(idx, "price_amount_up", value || 0)
                        }
                        value={item.price_amount_up || 0} // Gunakan price_amount_up dari item
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
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
                    {form.items.length > 1 && (
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

              <div className="flex justify-between items-center">
                <Button size="sm" onClick={addItem}>
                  + Tambah Item
                </Button>
              </div>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Batal</Button>
                <Button onClick={() => handleSubmit()}>Simpan</Button>
              </div>
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
