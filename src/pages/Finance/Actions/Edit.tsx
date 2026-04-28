"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useFinance,
  FormStateFinanceInOut,
  FormStateFinanceEdit,
} from "@/contexts/Finance.context";
import PriceInput from "@/components/ui/PriceInput";
import { Upload } from "lucide-react";

export default function EditFinanceInOutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const type = location.state?.type || "INCOME";
  const statusCode = location.state?.statusCode || [];
  const categoryCode = location.state?.categoryCode || [];
  const status_code = location.state?.status_code || "";
  const category_code = location.state?.category_code || "";
  const total = location.state?.total || 0;
  const description = location.state?.description || "";
  const inputDate = location?.state?.input_date
    ? new Date(location.state?.input_date).toLocaleDateString("en-CA")
    : "";
  const finance_id = location.state?.finance_id || 0;
  const path = location.state?.path || null;
  const source_table = location.state?.source_table || null;
  const source_id = location.state?.source_id || null;
  const { updateFinance } = useFinance();

  const [form, setForm] = useState<FormStateFinanceEdit>({
    finance_id: finance_id,
    finance_code: type,
    input_date: inputDate,
    description: description,
    category_code: category_code,
    total: total,
    status_code: status_code,
    path: path || null,
    source_id: source_id,
    source_table: source_table,
  });

  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (form.path && typeof form.path === "string") {
      setPreview(form.path);
    }
  }, [form.path]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm((prev) => ({ ...prev, path: base64 }));
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  console.log(form, "form");
  const handleSubmit = async () => {
    if (
      !form.input_date ||
      !form.description ||
      !form.category_code ||
      !form.status_code
    ) {
      toast({
        title: "Gagal",
        description: "Semua field wajib diisi (kecuali gambar).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Form submitted:", form);
      const res = await updateFinance(form);
      console.log(res, "oke");
      if (res.status) {
        toast({
          title: "Berhasil",
          description: `${
            type === "INCOME" ? "Pemasukan" : "Pengeluaran"
          } berhasil dibuat.`,
        });
        navigate(`${type === "INCOME" ? "/finance-in" : "/finance-out"}`);
      } else {
        toast({
          title: "Gagal",
          description:
            res?.messages || "Gagal memperbarui data. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-4/5">
          <h1 className="text-3xl font-bold text-foreground">
            Ubah {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
          </h1>
          <p className="text-muted-foreground">
            Ubah {type === "INCOME" ? "pemasukan" : "pengeluaran"} perusahaan.
          </p>
        </div>
        <Button onClick={handleSubmit}>
          {type === "INCOME" ? "Simpan Pemasukan" : "Simpan Pengeluaran"}
        </Button>
        {/* {source_table === "purchase_order_problem_clients" && (
          <Button
            onClick={() =>
              navigate("/review-order-client", {
                state: {
                  purchase_order_client_id: ,
                  page: "ADJUSTMENT",
                },
              })
            }
          >
            Lihat Detail Pesanan
          </Button>
        )} */}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              Informasi {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tanggal Input */}
              <div className="space-y-2">
                <Label>Tanggal Input</Label>
                <Input
                  type="date"
                  value={form.input_date}
                  onChange={(e) =>
                    setForm({ ...form, input_date: e.target.value })
                  }
                />
              </div>
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status_code}
                  onValueChange={(val) =>
                    setForm({ ...form, status_code: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusCode.map((item) => (
                      <SelectItem
                        key={item.lookup_value_code}
                        value={item.lookup_value_code}
                      >
                        {item.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Contoh: Beli Bitcoin"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Kategori */}
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category_code}
                  onValueChange={(val) =>
                    setForm({ ...form, category_code: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryCode.map((item) => (
                      <SelectItem
                        key={item.lookup_value_code}
                        value={item.lookup_value_code}
                      >
                        {item.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              <div className="space-y-2">
                <Label>Total</Label>
                <PriceInput
                  value={form.total}
                  onChange={(value) =>
                    setForm({ ...form, total: Number(value) })
                  }
                />
              </div>
            </div>

            {/* Upload Gambar */}
            <div className="space-y-2">
              <Label>Bukti Transaksi (Opsional)</Label>
              <div className="flex items-center gap-4">
                {preview && (
                  <div className="w-20 h-20 border rounded-md overflow-hidden">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="driver-photo"
                  />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="driver-photo" className="cursor-pointer">
                      <Button variant="outline" type="button" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Unggah Foto
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
