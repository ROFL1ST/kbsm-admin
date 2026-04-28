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
import { useNavigate } from "react-router-dom";
import { number } from "zod";
import PriceInput from "@/components/ui/PriceInput";
import { useAuth } from "@/contexts/Auth.Context";

interface FormStateUser {
  name: string;
  email: string;
  phone: string;
  responsibilities_code: string[];
}
export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    admin_id: undefined,
    email: "",
    phone: "",
    password: undefined,
    responsibilities_code: [],
  });
  const { toast } = useToast();
  const { createUser, responsibleList, responsibles, isLoading } = useAuth();

  const fetchData = async () => {
    try {
      await responsibleList();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectResponsible = (code: string) => {
    setForm((prev) => {
      const isSelected = prev.responsibilities_code.includes(code);
      if (isSelected) {
        return {
          ...prev,
          responsibilities_code: prev.responsibilities_code.filter(
            (c) => c !== code
          ),
        };
      } else {
        return {
          ...prev,
          responsibilities_code: [...prev.responsibilities_code, code],
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      if (!form.responsibilities_code.length) {
        toast({
          title: "Validasi",
          description: "Masukan Responsibilitas",
          variant: "destructive",
        });
        return;
      }
      const res = await createUser(form);

      if (res.status) {
        toast({
          title: "Berhasil!",
          description: "User berhasil dibuat.",
          variant: "default",
        });
        navigate("/users");
      } else {
        toast({
          title: "Gagal!",
          description:
            res?.messages || "Gagal membuat user. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat membuat user. Silakan coba lagi.",
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center ">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tambah Admin</h1>
          <p className="text-muted-foreground">
            Tambah admin baru untuk mengelola sistem.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* nama */}
            <div className="space-y-2 relative">
              <Label>Nama Akun</Label>
              <Input
                placeholder="Masukkan nama akun"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* email */}
            <div className="space-y-2 relative">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            {/* phone */}
            <div className="space-y-2 relative">
              <Label>Nomor Telepon</Label>
              <Input
                type="number"
                placeholder="Masukkan nomor telepon"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 flex">
              <div className="flex-1 space-y-2">
                <Label className="">Responsibilitas</Label>
                <div className=" grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                  {responsibles &&
                    responsibles.map((resp) => (
                      <div key={resp.code} className="flex items-center">
                        <Checkbox
                          checked={form.responsibilities_code.includes(
                            resp.code
                          )}
                          onCheckedChange={() =>
                            handleSelectResponsible(resp.code)
                          }
                        />
                        <span className="ml-2">{resp.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/users");
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleSubmit}>Simpan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
