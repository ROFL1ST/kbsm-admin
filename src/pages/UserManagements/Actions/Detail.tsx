"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, PencilOff, Printer } from "lucide-react";
import { useAuth } from "@/contexts/Auth.Context";

export interface FormStateUser {
  admin_id: string;
  name: string;
  email: string;
  password: string | null;
  phone: string;
  responsibilities_code: string[];
}

export default function ReviewUserDetail() {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    userDetail,
    detailUser,
    responsibleList,
    responsibles,
    isLoading,
    updateUser,
  } = useAuth();

  const [form, setForm] = useState<FormStateUser>({
    name: "",
    email: "",
    password: null,
    phone: "",
    admin_id: "",
    responsibilities_code: [],
  });
  const [originalForm, setOriginalForm] = useState<FormStateUser | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (userDetail) {
      const data = userDetail;
      const newForm: FormStateUser = {
        admin_id: data.id,
        name: data.name,
        email: data.email,
        password: null,
        phone: data.phone,
        responsibilities_code: data.responsibilities
          ? data.responsibilities.map((resp) => resp.code)
          : [],
      };
      setForm(newForm);
      setOriginalForm(newForm);
    }
  }, [userDetail]);

  const fetchData = async () => {
    try {
      const responsible = await responsibleList();
      const data = await detailUser({ id: location.state as string });
    } catch (error) {
      console.log("Error fetching responsibles: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditMode(true);
  };
  const handleCancel = () => {
    if (originalForm) {
      setForm(originalForm);
    }
    setIsEditMode(false);
  };

  const handleSelectResponsible = (code: string) => {
    setForm((prevForm) => {
      const isSelected = prevForm.responsibilities_code.includes(code);
      let updatedResponsibilities: string[];
      if (isSelected) {
        updatedResponsibilities = prevForm.responsibilities_code.filter(
          (resp) => resp !== code
        );
      } else {
        updatedResponsibilities = [...prevForm.responsibilities_code, code];
      }
      return {
        ...prevForm,
        responsibilities_code: updatedResponsibilities,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await updateUser(form);
      if (res.status) {
        toast({
          title: "Berhasil!",
          description: "Data berhasil disimpan.",
          variant: "default",
        });
        if (isEditMode) {
          setIsEditMode(false);
          fetchData();
        } else {
          navigate("/users");
        }
      } else {
        toast({
          title: "Gagal!",
          description:
            res?.messages ||
            `Gagal ${isEditMode ? "mengupdate" : "menambahkan"} admin.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
      console.log("Error updating user: ", error);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Admin" : "Detail Admin"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Edit Admin" : "Lihat Detail Admin"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              {/* <Button variant="outline" onClick={() => navigate("/po-clients")}>
                        Kembali
                      </Button> */}
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
              {/* <Button onClick={handleSubmit}>Simpan</Button> */}
            </>
          )}
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
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
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
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
            </div>
            {/* password */}
            {isEditMode && (
              <div className="space-y-2 relative">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Masukkan password"
                  autoComplete="new-password"
                  value={form.password || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-muted" : ""}
                />
              </div>
            )}
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
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
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
                          disabled={!isEditMode}
                          className={!isEditMode ? "bg-muted" : ""}
                        />
                        <span className="ml-2">{resp.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
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
    </div>
  );
}
