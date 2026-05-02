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
import { Category } from "@/contexts/Categories.Context";

interface CategoryFormModalProps {
  children: React.ReactNode;
  isEdit?: boolean;
  initialData?: Category | null;
  onSubmit: (name: string, path: File | null) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  children,
  isEdit = false,
  initialData = null,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        setName(initialData.name);
        setImagePreview(initialData.path);
        setImageFile(null);
      } else {
        setName("");
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [open, initialData, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    onSubmit(name, imageFile);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit
              ? "Ubah informasi kategori yang dipilih."
              : "Masukkan informasi kategori baru."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nama Kategori</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Acne Treatment"
            />
          </div>
          <div className="space-y-2">
            <Label>Gambar Kategori {isEdit && "(opsional jika tidak diubah)"}</Label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-primary/20">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-primary/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Klik untuk upload gambar
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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
