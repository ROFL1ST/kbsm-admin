"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import {
  Vendor,
  FormStatePurchaseOrderVendor,
  usePurchaseOrderVendors,
} from "@/contexts/PurchaseOrderVendors.Context";
import { ProductUnitID, useProducts } from "@/contexts/Products.Context";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/components/format/IDR";
import { useNavigate } from "react-router-dom";
import { number } from "zod";
import PriceInput from "@/components/ui/PriceInput";
import { AddVendorModal } from "@/pages/Vendors/Action/Create";
import { PurchaseOrderClientFollowUP } from "@/components/ui/PurchaseOrderClientsFollowUp";
import { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Check, Mail, Phone, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParameter } from "@/contexts/Parameter.context";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";

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
  discount_amount: number; // Tambahkan field discount_amount
}

interface Calculation {
  sub_total: number;
  discount_total: number; // Tambahkan discount_total
  tax_total: number;
  total: number;
}
interface ProductUnit {
  unit_code: string;
  price: number;
  hpp: number;
  product_detail_id: number;
}
export default function CreatePurchaseOrderVendor() {
  const [productDetails, setProductDetails] = useState<Record<number, any[]>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [descSearchTerm, setDescSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState();
  const [purchaseOrderDetail, setPurchaseOrderDetail] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState<string>("");
  const [vendorFromCreation, setVendorFromCreation] = useState<Vendor | null>(
    null,
  );

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [indexItem, setIndexItem] = useState(null);

  const { vendors, getAssets, products, createPurchaseOrderVendor } =
    usePurchaseOrderVendors();
  const {
    getProductDetails,
    getProductsByVendorID,
    getProductsFollowUP,
    getProductsFollowUPDetail,
    productsFollowUP,
  } = useProducts();

  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
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
        is_ppn: true,
        unit_code: "PCS",
        price: null,
        discount_percentage: "",
        discount_amount: 0, // Tambahkan discount_amount
      },
    ],
  });

  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [totalCalculation, setTotalCalculation] = useState<Calculation>({
    sub_total: 0,
    discount_total: 0, // Tambahkan discount_total
    tax_total: 0,
    total: 0,
  });
  const [productUnits, setProductUnits] = useState<
    Record<number, ProductUnit[]>
  >({});
  const [descSearch, setDescSearch] = useState<Record<number, string[]>>({});
  const { toast } = useToast();
  const { getValueCode, valueCode } = useParameter();

  useEffect(() => {
    getAssets();
    getValueCode({
      size: 999999,
      page: 1,
      lookup_code: "UOM",
    });
    getProductsFollowUP();
  }, []);
  // 🔹 Fungsi untuk menghitung discount amount dan total per item
  const calculateItemTotals = (item: Item) => {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    let discountPercentage = item.discount_percentage
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

  // 🔹 Fetch detail product
  const fetchProductDetail = async (
    product_id: number,
    index: number,
    product_detail_id: number,
  ) => {
    try {
      const data = await getProductDetails(product_id); // expect array

      if (!Array.isArray(data) || data.length === 0) {
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
          unit_code: "",
          price: 0,
          discount_percentage: "",
          discount_amount: 0, // Tambahkan discount_amount
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

  const handleSubmit = async () => {
    const response = await createPurchaseOrderVendor(form);
    if (response?.status) {
      toast({
        title: "Berhasil!",
        description: "Berhasil menambahkan pesanan perusahaan.",
      });
      navigate("/po-vendors");
    } else {
      toast({
        title: "Peringatan!",
        description:
          response?.messages === "STOCK_DEMAND_NOT_MATCH"
            ? "Tolong Masukan Quantity Sesuai dengan jumlah Permintaan di atas."
            : response?.messages === "STOCK_DEMAND_NOT_ORDER"
              ? "Prioritaskan Pesanan Klien terlebih dahulu yang ada diatas"
              : "Form harus diisi semuanya",
        variant: "destructive",
      });
    }
  };

  // state
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  // ketika user ketik
  const handleSearchVendor = (val: string) => {
    setVendorSearch(val);

    if (val.trim() === "") {
      setFilteredVendors([]);
      return;
    }

    const results = vendors.filter((c) =>
      c.name.toLowerCase().includes(val.toLowerCase()),
    );
    setFilteredVendors(results);
  };

  // ketika pilih suggestion
  const handleSelectVendor = (client: Vendor) => {
    setForm((prev) => ({ ...prev, vendor_id: Number(client.id) }));
    setVendorSearch(client.name); // tampilkan nama di input
    setFilteredVendors([]);
  };
  const handleProductFollowUpDetail = async (params) => {
    try {
      // Panggil API untuk mendapatkan detail purchase order
      const response = await getProductsFollowUPDetail({
        product_unit_id: params.product_unit_id,
      });
      setPurchaseOrderDetail(response.data);
      setSelectedProduct(params || null);

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching purchase order detail:", error);
    }
  };
  useEffect(() => {
    if (productsFollowUP && Array.isArray(productsFollowUP)) {
      const formattedItems: Item[] = productsFollowUP.map((product) => ({
        product_id: product.product_id,
        product_detail_id: product.product_detail_id,
        name: product.product_name,
        description: product.description,
        quantity: product.quantity,
        is_ppn: product.ppn_percentage > 0,
        unit_code: product.unit_code,
        price: product.hpp,
        discount_percentage: product.discount_percentage
          ? String(product.discount_percentage)
          : "",
        discount_amount: product.discount_amount || 0,
      }));

      formattedItems.forEach((item, idx) => {
        console.log(item.product_id, "okasa");
        if (item.product_id) {
          fetchProductDetail(item.product_id, idx, item.product_detail_id ?? 0);
        }
      });
      // Hitung ulang total keseluruhan
      const totals = formattedItems.reduce(
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
      setForm((prev) => ({
        ...prev,
        items: formattedItems,
      }));
    } else {
      // Jika belum ada data productsFollowUP → isi null
      setForm({
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
            is_ppn: true,
            unit_code: null,
            price: null,
            discount_percentage: "",
            discount_amount: 0, // Tambahkan discount_amount
          },
        ],
      });
    }
  }, [productsFollowUP]);
  const handleGetProductsByVendorID = (params) => {
    getProductsByVendorID(params);
  };
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

  const getStatusBadge = (status: string, color: BadgeVariant) => {
    return <Badge variant={color}>{status}</Badge>;
  };
  const handleUnitChange = (index: number, unitCode: string) => {
    const units = productUnits[index] || [];
    const selectedUnit = units.find((unit) => unit.unit_code === unitCode);
    console.log(selectedUnit, "unit");
    if (selectedUnit) {
      // Update unit code dan price secara bersamaan
      updateItem(index, "unit_code", selectedUnit.unit_code);
      updateItem(index, "price", selectedUnit.hpp);
    } else {
      updateItem(index, "price", 0);
      // Jika unit tidak ditemukan, hanya update unit code
      updateItem(index, "unit_code", unitCode);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:gap-8 md:flex-row md:items-start md:justify-between">
        <div className="w-full">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              Tambah Pesanan
            </h1>
            <p className="text-muted-foreground">
              Buat pesanan perusahaan berdasarkan stok yang kurang.
            </p>
          </div>
          {/* Section: Produk yang harus dibeli */}
          {productsFollowUP.length > 0 && (
            <section className="mt-6 bg-white dark:bg-zinc-900 border border-primary/30 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold text-primary">
                  Produk yang Harus Dibeli
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Daftar produk berikut perlu dibeli karena stoknya tidak
                mencukupi permintaan klien.
              </p>

              {/* List produk */}
              <div className="space-y-4">
                {productsFollowUP?.map((item) => (
                  <div
                    key={item.product_detail_id}
                    className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl p-4 cursor-pointer"
                    onClick={() => handleProductFollowUpDetail(item)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-primary group-hover:text-primary/90">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Unit:{" "}
                            <span className="font-medium text-foreground">
                              {item.unit_code}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Permintaan:{" "}
                            <span className="font-semibold text-primary">
                              {item.quantity}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Stok Sekarang:{" "}
                            <span className="font-semibold text-destructive">
                              {item.total_quantity}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-destructive">
                              {getStatusBadge(item.status, item?.status_badge)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vendor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                Vendor *
              </Label>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari atau tambah vendor..."
                    value={vendorSearch}
                    onChange={(e) => handleSearchVendor(e.target.value)}
                    onFocus={() =>
                      vendorSearch &&
                      setFilteredVendors(
                        vendors.filter((vendor) =>
                          vendor.name
                            .toLowerCase()
                            .includes(vendorSearch.toLowerCase()),
                        ),
                      )
                    }
                    className="pl-10 pr-4"
                  />
                </div>

                {/* Dropdown hasil pencarian */}
                {filteredVendors.length > 0 && (
                  <div className="absolute mt-1 w-full rounded-lg border bg-accent shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="cursor-pointer px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0 flex items-center justify-between"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          handleGetProductsByVendorID({
                            vendor_id: vendor?.id,
                          });
                          handleSelectVendor(vendor);
                          setVendorSearch(vendor.name);
                          setFilteredVendors([]);
                          setForm((prev) => ({
                            ...prev,
                            vendor_id: Number(vendor.id),
                          }));
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full"></div>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            {vendor.email && (
                              <div className="text-xs text-muted-foreground">
                                {vendor.email}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedVendor?.id === vendor.id && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Opsi tambah vendor baru */}
                {filteredVendors.length === 0 &&
                  vendorSearch?.trim() !== "" &&
                  !vendors.some(
                    (v) => v.name.toLowerCase() === vendorSearch?.toLowerCase(),
                  ) && (
                    <div className="absolute mt-1 w-full rounded-lg border bg-accent shadow-lg z-50">
                      <button
                        className="w-full px-4 py-3 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => setIsAddVendorModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Tambah vendor baru</div>
                          <div className="text-muted-foreground">
                            "{vendorSearch}"
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
              </div>

              {/* Selected vendor info */}
              {selectedVendor && (
                <div className="p-3 bg-accent rounded-lg">
                  <div className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>
                      Vendor terpilih:{" "}
                      <span className="font-semibold">
                        {selectedVendor.name}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Validation state */}
              {vendorSearch &&
                !selectedVendor &&
                filteredVendors.length === 0 &&
                !vendors.some(
                  (v) => v.name.toLowerCase() === vendorSearch?.toLowerCase(),
                ) && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      Tekan Enter atau pilih dari dropdown untuk memastikan
                      vendor terpilih
                    </div>
                  </div>
                )}
            </div>

            {/* Card info vendor terpilih */}
            {(selectedVendor || vendorFromCreation) && (
              <Card className="bg-muted/50 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {(selectedVendor ?? vendorFromCreation).name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Vendor Terpilih
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {(selectedVendor ?? vendorFromCreation).phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>
                              {(selectedVendor ?? vendorFromCreation).phone}
                            </span>
                          </div>
                        )}

                        {(selectedVendor ?? vendorFromCreation).email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>
                              {(selectedVendor ?? vendorFromCreation).email}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => {
                          setSelectedVendor(null);
                          setVendorSearch("");
                          setForm((prev) => ({ ...prev, vendor_id: null }));
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
                        disabled={!item.product_id || item.product_id === null}
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
                                  hpp: unit.hpp,
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
                        onValueChange={(value) => handleUnitChange(idx, value)}
                        disabled={item.product_detail_id === null}
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
                        readOnly={item.unit_code === ""}
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
                            val === "" ? null : Number(val),
                          );
                        }}
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
                    {form.items.length > 1 ? (
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
              <div className="flex justify-between items-center">
                <Button size="sm" onClick={addItem}>
                  + Tambah Item
                </Button>
              </div>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Batal</Button>
                <Button onClick={() => handleSubmit()}>Simpan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AddVendorModal
        open={isAddVendorModalOpen}
        onOpenChange={setIsAddVendorModalOpen}
        initialName={vendorSearch}
        onVendorAdded={(newVendor) => {
          setVendorSearch(newVendor.name);
        }}
      />
      {/* Modal */}
      <PurchaseOrderClientFollowUP
        purchaseOrders={purchaseOrderDetail}
        productData={selectedProduct}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
