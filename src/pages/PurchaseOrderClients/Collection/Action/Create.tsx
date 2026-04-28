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
import { Mail, Phone } from "lucide-react";

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
    {}
  );
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({}); // State untuk menyimpan units per item
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
        price: 0,
        discount_percentage: "",
        discount_amount: 0,
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
      setClientSearch(clientFromCreation.name);
      setSelectedClient(clientFromCreation);

      toast({
        title: "Klien berhasil dibuat!",
        description: `Sekarang buat purchase order untuk ${clientFromCreation.name}.`,
      });
    }
  }, [clientFromCreation, fromClientCreation, toast]);

  const fetchClients = async () => {
    try {
      await getClients();
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
    }
  };

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
    getAssets();
  }, [clients]);

  // 🔹 Fungsi untuk menghitung discount amount dan total per item
  const calculateItemTotals = (item: Item) => {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const discountPercentage = item.discount_percentage
      ? parseFloat(item.discount_percentage)
      : 0;

    const subtotalBeforeDiscount = qty * price;
    const discountAmount = (subtotalBeforeDiscount * discountPercentage) / 100;
    const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
    const ppnAmount = item.is_ppn ? subtotalAfterDiscount * 0.11 : 0;
    const itemTotal = subtotalAfterDiscount + ppnAmount;

    return {
      subtotalBeforeDiscount,
      discountAmount,
      subtotalAfterDiscount,
      ppnAmount,
      itemTotal,
    };
  };

  // 🔹 Fetch detail product dan units
  const fetchProductDetail = async (product_id: number, index: number) => {
    try {
      const data = await getProductDetails(product_id);
      setProductDetails((prev) => ({ ...prev, [index]: data }));

      // Extract units dari product details
      const units: ProductUnit[] = [];
      data.forEach((detail: any) => {
        if (detail.units && Array.isArray(detail.units)) {
          detail.units.forEach((unit: any) => {
            units.push({
              unit_code: unit.unit_code,
              price: unit.price,
              product_detail_id: detail.id,
            });
          });
        }
      });

      setProductUnits((prev) => ({ ...prev, [index]: units }));

      setForm((prev) => {
        const items = [...prev.items];
        items[index].description = data.length > 0 ? data[0].description : "";
        items[index].product_detail_id = data.length > 0 ? data[0].id : null;
        return { ...prev, items };
      });
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

  const updateItem = (index: number, field: keyof Item, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      (items[index] as any)[field] = value;

      if (
        ["quantity", "price", "discount_percentage", "is_ppn"].includes(field)
      ) {
        const item = items[index];
        const { discountAmount } = calculateItemTotals(item);
        items[index].discount_amount = discountAmount;
      }

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
        description: "Gagal menambahkan pesanan klien.",
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
      c.name.toLowerCase().includes(val.toLowerCase())
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
            <div className="space-y-2 relative">
              <Label>Klien</Label>
              <Input
                placeholder="Cari klien"
                value={clientSearch}
                onChange={(e) => handleSearchClient(e.target.value)}
              />

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
                clientSearch?.trim() !== "" &&
                !clients.some(
                  (c) => c.name.toLowerCase() === clientSearch?.toLowerCase()
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
                      </div>

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
                  type="number"
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
                      <Input
                        placeholder="Cari produk"
                        value={item.name}
                        onChange={(e) =>
                          handleSearchProduct(e.target.value, idx)
                        }
                      />

                      {productSearch.length > 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                          {productSearch.map((p, i) => (
                            <div
                              key={i}
                              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                              onClick={() => {
                                updateItem(idx, "name", p);
                                const selected = products.find(
                                  (prod) => prod.name === p
                                );
                                if (selected) {
                                  updateItem(idx, "product_id", selected.id);
                                  fetchProductDetail(selected.id, idx);
                                }
                                setProductSearch([]);
                              }}
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-2 relative">
                      <Label>Deskripsi</Label>
                      <Select
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
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih deskripsi" />
                        </SelectTrigger>
                        <SelectContent>
                          {(productDetails[idx] || []).map((pd) => (
                            <SelectItem key={pd.id} value={pd.id.toString()}>
                              {pd.description}
                            </SelectItem>
                          ))}
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
                        readOnly={false}
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount Amount</Label>
                      <PriceInput
                        readOnly={true}
                        onChange={() => null}
                        value={discountAmount}
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
                            val === "" ? 0 : Number(val)
                          );
                        }}
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
