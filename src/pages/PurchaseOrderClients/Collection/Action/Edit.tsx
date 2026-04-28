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
import { Printer } from "lucide-react";
import PriceInput from "@/components/ui/PriceInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
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
}

interface Calculation {
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
}

export default function EditPurchaseOrderClient() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {}
  );
  const {
    clients,
    products,
    detailPurchaseOrderClient,
    getClients,
    getAssets,
    printTravelDocument,
    handleDetailPurchaseOrderClient,
    updatePurchaseOrderClient,
  } = usePurchaseOrderClients();
  const { getProductDetails } = useProducts();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const navigate = useNavigate();

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
        quantity: null,
        is_ppn: false,
        unit_code: "PCS",
        price: null,
        discount_percentage: "",
        discount_amount: 0, // Tambahkan discount_amount
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
    if (detailPurchaseOrderClient) {
      const data = detailPurchaseOrderClient;
      setClientSearch(data.name);

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

      const newForm: FormStatePurchaseOrderClient = {
        purchase_order_client_id: data.id,
        client_id: data.client_id,
        total: data.total,
        status_trx_code: data.status_trx_code,
        progress_type_code: data.progress_type_code,
        input_date: inputDate,
        send_date: sendDate,
        due_date: String(data.due_date),
        payment_method_code: data.payment_method_code,
        items: formattedItems,
      };

      setForm(newForm);
      setOriginalForm(newForm);
      calculateTotals(formattedItems);

      // 👉 Tambahkan ini: otomatis pilih client dari data yang di-fetch
      const foundClient = clients.find((c) => c.id === Number(data.client_id));
      if (foundClient) {
        setSelectedClient(foundClient);
        setClientSearch(foundClient.name);
      }
    }
  }, [detailPurchaseOrderClient, clients]);

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

  const fetchClients = async () => {
    try {
      await getClients();
    } catch (error) {
      console.error("Failed to fetch purchase order clients:", error);
    }
  };

  const fetchData = async () => {
    try {
      const data = await handleDetailPurchaseOrderClient({
        purchase_order_client_id: location?.state,
      });
    } catch (e) {
      console.error("Failed to fetch detail:", e);
    }
  };

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
    fetchData();
    getAssets();
  }, [clients]);

  const fetchProductDetail = async (product_id: number, index: number) => {
    try {
      const data = await getProductDetails(product_id);
      setProductDetails((prev) => ({ ...prev, [index]: data }));
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
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      (items[index] as any)[field] = value;

      // Jika mengupdate quantity, price, discount_percentage, atau is_ppn, hitung ulang discount_amount
      if (
        ["quantity", "price", "discount_percentage", "is_ppn"].includes(field)
      ) {
        const item = items[index];
        const { discountAmount } = calculateItemTotals(item);
        items[index].discount_amount = discountAmount;
      }

      calculateTotals(items);

      return {
        ...prev,
        items,
        total: totalCalculation.total,
      };
    });
  };

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

  // readonly
  const [isReadonly, setIsReadonly] = useState(true);
  useEffect(() => {
    if (form.progress_type_code === "FOLLOW_UP") {
      setIsReadonly(false);
    } else {
      setIsReadonly(true);
    }
  }, [form.progress_type_code]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Pesanan</h1>
          <p className="text-muted-foreground">Edit Pesanan Klien</p>
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
                readOnly={isReadonly}
                value={clientSearch}
                onChange={(e) => handleSearchClient(e.target.value)}
                className={isReadonly ? "bg-muted" : ""}
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
                        setClientSearch(c.name); // Set input value ke nama klien yang dipilih
                        setFilteredClients([]); // clear suggestions
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

              {/* Jika tidak ada hasil dan input tidak kosong, TAPI hanya tampilkan jika belum memilih klien yang existing */}
              {filteredClients.length === 0 &&
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
                  readOnly={isReadonly}
                  value={form.input_date}
                  className={isReadonly ? "bg-muted" : ""}
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
                  readOnly={isReadonly}
                  value={form.send_date}
                  className={isReadonly ? "bg-muted" : ""}
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
                  readOnly={isReadonly}
                  value={form.due_date}
                  className={isReadonly ? "bg-muted" : ""}
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
                  disabled={isReadonly}
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
                {form.progress_type_code === "FOLLOW_UP" && (
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
                      <Input
                        placeholder="Cari produk"
                        className={isReadonly ? "bg-muted" : ""}
                        readOnly={isReadonly}
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
                      <Input
                        readOnly={isReadonly}
                        placeholder="Cari deskripsi"
                        className={isReadonly ? "bg-muted" : ""}
                        value={item.description}
                        onChange={(e) => handleSearchDesc(e.target.value, idx)}
                      />
                      {(descSearch[idx] ?? []).length > 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                          {descSearch[idx].map((d, i) => (
                            <div
                              key={i}
                              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                              onClick={() => {
                                updateItem(idx, "description", d);
                                setDescSearch((prev) => ({
                                  ...prev,
                                  [idx]: [],
                                }));
                              }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        readOnly={isReadonly}
                        type="number"
                        value={item.quantity === null ? "" : item.quantity}
                        className={isReadonly ? "bg-muted" : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(
                            idx,
                            "quantity",
                            val === "" ? null : Number(val)
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga Satuan</Label>
                      <PriceInput
                        value={item.price || null}
                        onChange={(val) => updateItem(idx, "price", val)}
                        readOnly={isReadonly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%) Opsional</Label>
                      <Input
                        readOnly={isReadonly}
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={item.discount_percentage}
                        className={isReadonly ? "bg-muted" : ""}
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
                        onChange={(val) => null}
                        value={discountAmount}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        disabled={isReadonly}
                        value={item.unit_code}
                        onValueChange={(value) =>
                          updateItem(idx, "unit_code", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CTN">CTN</SelectItem>
                          <SelectItem value="PCS">PCS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        disabled={isReadonly}
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
