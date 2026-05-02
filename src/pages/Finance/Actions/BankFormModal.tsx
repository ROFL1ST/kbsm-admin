import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { Bank } from "@/contexts/Banks.Context";

interface BankFormData {
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo: File | null;
  is_active: boolean;
}

interface BankFormModalProps {
  children: React.ReactNode;
  isEdit?: boolean;
  initialData?: Bank | null;
  onSubmit: (data: BankFormData) => void;
}

export const BankFormModal: React.FC<BankFormModalProps> = ({
  children,
  isEdit = false,
  initialData = null,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setAccountNumber(initialData.account_number);
        setAccountName(initialData.account_name);
        setIsActive(initialData.is_active);
        setLogoPreview(initialData.logo);
        setLogoFile(null);
      } else {
        setCode("");
        setName("");
        setAccountNumber("");
        setAccountName("");
        setIsActive(true);
        setLogoFile(null);
        setLogoPreview(null);
      }
    }
  }, [open, initialData, isEdit]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    onSubmit({ code, name, account_number: accountNumber, account_name: accountName, logo: logoFile, is_active: isActive });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEdit ? "Edit Bank" : "Tambah Bank"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit
              ? "Ubah informasi bank yang dipilih."
              : "Masukkan informasi bank baru."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kode Bank</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: MANDIRI"
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bank Mandiri"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nomor Rekening</Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 9000017378580"
            />
          </div>

          <div className="space-y-2">
            <Label>Nama Pemilik Rekening</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Contoh: KASTATI"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo Bank {isEdit && "(opsional jika tidak diubah)"}</Label>
            {logoPreview ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-primary/20 bg-gray-50">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-primary/40 mb-1" />
                <p className="text-sm text-muted-foreground">
                  Klik untuk upload logo
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label>Status Aktif</Label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {isActive ? "Aktif" : "Tidak Aktif"}
            </span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="text-white bg-primary hover:bg-primary/90"
          >
            Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
