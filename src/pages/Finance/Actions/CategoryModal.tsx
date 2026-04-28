"use client";
import React, { useEffect, useState } from "react";
import {
  useFinance,
  FormStateFinanceInOut,
  FormStateCategoryCode,
  CategoryCode,
  CategoryCodeKeyDetail,
} from "@/contexts/Finance.context";
import PriceInput from "@/components/ui/PriceInput";
import { Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
interface CategoryModalProps {
  type: string;
  onSubmit: (data: FormStateCategoryCode) => void;
  initialData?: FormStateCategoryCode;
  categoryCodeData?: CategoryCode | null;
  categoryForms: FormStateCategoryCode | CategoryCodeKeyDetail;
  setCategoryForms: React.Dispatch<
    React.SetStateAction<FormStateCategoryCode | CategoryCodeKeyDetail>
  >;
  children: React.ReactNode;
  isEdit?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  onSubmit,
  categoryCodeData,
  type,
  categoryForms,
  setCategoryForms,
  children,
  isEdit = false,
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      if (categoryCodeData && isEdit) {
        setCategoryForms({
          value: categoryCodeData.value,
          description: categoryCodeData.description || "",
          lookup_code:
            type === "INCOME" ? "CATEGORY_INCOME" : "CATEGORY_EXPENSE",
          lookup_value_code: categoryCodeData.lookup_value_code,
          lookup_value_id: categoryCodeData.lookup_value_id,
        } as CategoryCodeKeyDetail);
      } else {
        setCategoryForms({
          value: "",
          description: "",
          lookup_code:
            type === "INCOME" ? "CATEGORY_INCOME" : "CATEGORY_EXPENSE",
          lookup_value_code: "",
        });
      }
    }
  }, [open, categoryCodeData, isEdit]);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah Kategori Baru</AlertDialogTitle>
          <AlertDialogDescription>
            Masukkan nama kategori yang ingin ditambahkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nama Kategori</Label>
            <Input
              type="text"
              value={categoryForms.value}
              onChange={(e) =>
                setCategoryForms({
                  ...categoryForms,
                  value: e.target.value,
                })
              }
              placeholder="Contoh: Investasi"
            />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              type="text"
              value={categoryForms.description}
              onChange={(e) =>
                setCategoryForms({
                  ...categoryForms,
                  description: e.target.value,
                })
              }
              placeholder="Contoh: Kategori untuk investasi"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onSubmit(categoryForms);
            }}
            className=" text-white bg-primary hover:bg-primary/90"
          >
            Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
