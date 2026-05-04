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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Star } from "lucide-react";
import { Review } from "@/contexts/Reviews.Context";

export interface ReviewFormData {
  image: File | null;
  name: string;
  role: string;
  review: string;
  rating: number;
}

interface ReviewFormModalProps {
  children: React.ReactNode;
  isEdit?: boolean;
  initialData?: Review | null;
  onSubmit: (data: ReviewFormData) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  children,
  isEdit = false,
  initialData = null,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        setName(initialData.name);
        setRole(initialData.role);
        setReview(initialData.review);
        setRating(initialData.rating);
        setImagePreview(initialData.image);
        setImageFile(null);
      } else {
        setName("");
        setRole("");
        setReview("");
        setRating(5);
        setHoverRating(0);
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

  const isValid = isEdit
    ? name.trim() !== "" && role.trim() !== "" && review.trim() !== ""
    : imageFile !== null && name.trim() !== "" && role.trim() !== "" && review.trim() !== "";

  const handleSubmit = () => {
    onSubmit({ image: imageFile, name, role, review, rating });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEdit ? "Edit Review" : "Tambah Review"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit
              ? "Ubah informasi review yang dipilih."
              : "Masukkan informasi review baru."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image */}
          <div className="space-y-2">
            <Label>
              Foto{" "}
              {!isEdit && <span className="text-red-500">*</span>}
              {/* {isEdit && <span className="text-muted-foreground text-xs"></span>} */}
            </Label>
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
                  Klik untuk upload foto
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

          {/* Name */}
          <div className="space-y-2">
            <Label>Nama <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Maharani S."
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role / Asal <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Verified Buyer • Bandung"
            />
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label>Review <span className="text-red-500">*</span></Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tulis ulasan produk..."
              rows={3}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} / 5
              </span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!isValid}
            className="text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
