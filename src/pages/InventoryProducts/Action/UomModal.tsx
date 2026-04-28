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
import {
  FormStateValueCode,
  ValueCodeKeyDetail,
} from "@/contexts/Parameter.context";
interface UomModalProps {
  onSubmit: (data: FormStateCategoryCode) => void;
  initialData?: FormStateCategoryCode;
  categoryCodeData?: CategoryCode | null;
  uomForms: FormStateValueCode | ValueCodeKeyDetail;
  setValueForms: React.Dispatch<
    React.SetStateAction<FormStateValueCode | ValueCodeKeyDetail>
  >;
  children: React.ReactNode;
  isEdit?: boolean;
}

export const UomModal: React.FC<UomModalProps> = ({
  onSubmit,
  categoryCodeData,
  uomForms,
  setValueForms,
  children,
  isEdit = false,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (categoryCodeData && isEdit) {
        setValueForms({
          value: categoryCodeData.value,
          description: categoryCodeData.description || "",
          lookup_code: "UOM",
          lookup_value_code: categoryCodeData.lookup_value_code,
          lookup_value_id: categoryCodeData.lookup_value_id,
        } as CategoryCodeKeyDetail);
      } else {
        setValueForms({
          value: "",
          description: "",
          lookup_code: "UOM",
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
          <AlertDialogTitle>Tambah Satuan Baru</AlertDialogTitle>
          <AlertDialogDescription>
            Masukkan nama satuan yang ingin ditambahkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nama Satuan</Label>
            <Input
              type="text"
              value={uomForms.value}
              onChange={(e) =>
                setValueForms({
                  ...uomForms,
                  value: e.target.value,
                })
              }
              placeholder="Contoh: PCS,BALL"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onSubmit(uomForms);
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
