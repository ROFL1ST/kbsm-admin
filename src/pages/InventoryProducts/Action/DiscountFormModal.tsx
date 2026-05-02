import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { Discount } from "@/contexts/Discounts.Context";
import { useCategories } from "@/contexts/Categories.Context";
import { useProducts, ProductsInventoryField } from "@/contexts/Products.Context";

export interface DiscountFormData {
  path: File | null;
  name: string;
  discount_percentage: number;
  original_price: number;
  final_price: number;
  category_id: number;
  product_unit_id: number;
  product_detail_id: number;
  product_id: number;
  valid_until: string;
}

interface ProductOption extends ProductsInventoryField {
  category_id?: number;
  price?: number;
}

interface CategoryOption {
  id: number;
  name: string;
}

const DUMMY_CATEGORIES: CategoryOption[] = [
  { id: 1, name: "Skincare" },
  { id: 2, name: "Moisturizer" },
  { id: 3, name: "Serum" },
];

const DUMMY_PRODUCTS: ProductOption[] = [
  { product_unit_id: 1, product_id: 1, product_detail_id: 1, name: "Aloe Vera Gel", unit_code: "PCS", product_name: "", product_description: "", code: 0, margin: 0, total_quantity: 0, category_id: 1, price: 45000 },
  { product_unit_id: 2, product_id: 2, product_detail_id: 2, name: "Rice Toner", unit_code: "BTL", product_name: "", product_description: "", code: 0, margin: 0, total_quantity: 0, category_id: 1, price: 75000 },
  { product_unit_id: 3, product_id: 3, product_detail_id: 3, name: "Hyaluronic Moisturizer", unit_code: "JAR", product_name: "", product_description: "", code: 0, margin: 0, total_quantity: 0, category_id: 2, price: 120000 },
  { product_unit_id: 4, product_id: 4, product_detail_id: 4, name: "Vitamin C Serum", unit_code: "PCS", product_name: "", product_description: "", code: 0, margin: 0, total_quantity: 0, category_id: 3, price: 95000 },
];

interface DiscountFormModalProps {
  children: React.ReactNode;
  isEdit?: boolean;
  initialData?: Discount | null;
  onSubmit: (data: DiscountFormData) => void;
}

export const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
  children,
  isEdit = false,
  initialData = null,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [productUnitId, setProductUnitId] = useState<number>(0);
  const [productDetailId, setProductDetailId] = useState<number>(0);
  const [productId, setProductId] = useState<number>(0);
  const [validUntil, setValidUntil] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, getCategories } = useCategories();
  const { productsInventory, getInventory } = useProducts();

  const displayCategories: CategoryOption[] =
    categories.length > 0 ? categories : DUMMY_CATEGORIES;
  const displayProducts: ProductOption[] =
    productsInventory.length > 0 ? productsInventory : DUMMY_PRODUCTS;

  useEffect(() => {
    if (open) {
      getCategories({ page: 1, size: 100 });
      getInventory({ page: 1, size: 100, search: "", type: undefined });

      if (isEdit && initialData) {
        setName(initialData.name);
        setDiscountPercentage(initialData.discount_percentage);
        setOriginalPrice(initialData.original_price);
        setFinalPrice(initialData.final_price);
        setCategoryId(initialData.category_id);
        setProductUnitId(initialData.product_unit_id);
        setProductDetailId(initialData.product_detail_id);
        setProductId(initialData.product_id);
        setValidUntil(
          initialData.valid_until
            ? new Date(initialData.valid_until).toISOString().slice(0, 16)
            : "",
        );
        setImagePreview(initialData.image || null);
        setImageFile(null);
      } else {
        setName("");
        setDiscountPercentage(0);
        setOriginalPrice(0);
        setFinalPrice(0);
        setCategoryId(0);
        setProductUnitId(0);
        setProductDetailId(0);
        setProductId(0);
        setValidUntil("");
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [open, isEdit, initialData?.id]);

  const handleProductSelect = (value: string) => {
    const selected = displayProducts.find(
      (p: ProductOption) => String(p.product_unit_id) === value,
    );
    if (selected) {
      setProductUnitId(selected.product_unit_id);
      setProductDetailId(selected.product_detail_id);
      setProductId(selected.product_id);
      if (selected.category_id) setCategoryId(selected.category_id);
      if (!name) setName(selected.name);
      if (selected.price && selected.price > 0) {
        setOriginalPrice(selected.price);
        setFinalPrice(0);
        setDiscountPercentage(0);
      }
    }
  };

  const handleOriginalPriceChange = (val: number) => {
    setOriginalPrice(val);
    if (val > 0 && discountPercentage > 0) {
      setFinalPrice(Math.round(val * (1 - discountPercentage / 100)));
    }
  };

  const handleDiscountChange = (val: number) => {
    setDiscountPercentage(val);
    if (originalPrice > 0 && val > 0) {
      setFinalPrice(Math.round(originalPrice * (1 - val / 100)));
    }
  };

  const handleFinalPriceChange = (val: number) => {
    setFinalPrice(val);
    if (originalPrice > 0 && val > 0 && val < originalPrice) {
      setDiscountPercentage(
        Math.round(((originalPrice - val) / originalPrice) * 100),
      );
    }
  };

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

  const isFormValid =
    !!name.trim() &&
    originalPrice > 0 &&
    discountPercentage > 0 &&
    finalPrice > 0 &&
    productId > 0 &&
    productDetailId > 0 &&
    productUnitId > 0 &&
    categoryId > 0 &&
    !!validUntil &&
    !!imagePreview;

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSubmit({
      path: imageFile,
      name,
      discount_percentage: discountPercentage,
      original_price: originalPrice,
      final_price: finalPrice,
      category_id: categoryId,
      product_unit_id: productUnitId,
      product_detail_id: productDetailId,
      product_id: productId,
      valid_until: new Date(validUntil).toISOString(),
    });
    setOpen(false);
  };

  const selectedProductUnitId = productUnitId > 0 ? String(productUnitId) : "";
  const selectedCategoryId = categoryId > 0 ? String(categoryId) : "";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEdit ? "Edit Diskon" : "Tambah Diskon"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit
              ? "Ubah informasi diskon yang dipilih."
              : "Masukkan informasi diskon baru."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label>
            Gambar Produk{" "}
            {isEdit && (
              <span className="text-muted-foreground font-normal text-xs">
                (hapus gambar lama untuk upload baru)
              </span>
            )}
          </Label>
          {imagePreview ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden border border-primary/20">
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
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition"
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

        <div className="max-h-[40vh] overflow-y-auto pr-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Pilih Produk</Label>
              <Select
                value={selectedProductUnitId}
                onValueChange={handleProductSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk..." />
                </SelectTrigger>
                <SelectContent>
                  {displayProducts.map((p: ProductOption) => (
                    <SelectItem
                      key={p.product_unit_id}
                      value={String(p.product_unit_id)}
                    >
                      {p.name} ({p.unit_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(val) => setCategoryId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map((c: CategoryOption) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nama Diskon</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Soothing Aloe Vera Gel"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Harga Asli (Rp)</Label>
              <Input
                type="number"
                value={originalPrice || ""}
                onChange={(e) =>
                  handleOriginalPriceChange(Number(e.target.value))
                }
                placeholder="69000"
              />
            </div>
            <div className="space-y-2">
              <Label>Diskon (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={discountPercentage || ""}
                onChange={(e) => handleDiscountChange(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Final (Rp)</Label>
              <Input
                type="number"
                value={finalPrice || ""}
                onChange={(e) =>
                  handleFinalPriceChange(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Berlaku Hingga</Label>
            <Input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simpan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
