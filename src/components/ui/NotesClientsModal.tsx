import React, { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types";
import { Trash2, AlertTriangle, Info, FileText, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PrintTravelDocumentKey } from "@/contexts/PurchaseOrderClient.Context";
import { AccountsBoosterKey, useAuth } from "@/contexts/Auth.Context";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface NotesCleintModalProps {
  title?: string;
  data?: ApiResponse;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  variant?: ButtonVariant;
  handlePrint?: (params: PrintTravelDocumentKey) => void;
  showIcon?: boolean;
}

export const NotesClientModal: React.FC<NotesCleintModalProps> = ({
  title,
  data,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  trigger,
  variant = "default",
  handlePrint,
  showIcon = true,
}) => {
  const [description, setDescription] = useState("");
  const [driverId, setDriverID] = useState({
    name: "",
    driver_id: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { accountsBooster, booster } = useAuth();

  // Handle search dengan debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        await accountsBooster({
          responsibility_code: "DRIVER",
          search: searchTerm,
        });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value !== driverId.name) {
      setDriverID({ name: "", driver_id: null });
    }

    // Hanya buka dropdown jika ada value
    if (value.trim() !== "") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectDriver = (driver: any) => {
    setDriverID({
      name: driver.name,
      driver_id: driver.id,
    });
    setSearchTerm(driver.name);
    setIsOpen(false); // TUTUP DROPDOWN SETELAH PILIH DRIVER
  };

  const handleClearDriver = () => {
    setDriverID({ name: "", driver_id: null });
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (handlePrint) {
      handlePrint({
        purchase_order_client_id: null,
        description: description,
        driver_id: driverId.driver_id,
      });
    }
  };
  console.log(data, "oke");
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant={variant}
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10 transition-colors duration-200"
          >
            {showIcon && <FileText className="h-4 w-4" />}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              {title}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="">
            {data?.status ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <span className="text-sm font-medium block mb-1">
                        Informasi Deskripsi
                      </span>
                      <p className="text-sm">
                        Silakan masukkan deskripsi operasional untuk dokumen
                        perjalanan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Input */}
                <div className="space-y-3 text-left">
                  <Label
                    htmlFor="desc"
                    className="text-sm font-medium block text-left"
                  >
                    Deskripsi (Opsional)
                  </Label>
                  <Input
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masukkan deskripsi operasional..."
                    className="h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-colors text-left"
                  />
                </div>

                {/* Driver Search */}
                <div className="space-y-3 relative text-left" ref={dropdownRef}>
                  <Label
                    htmlFor="driver-search"
                    className="text-sm font-medium block text-left"
                  >
                    Driver
                  </Label>

                  <div className="relative">
                    <Input
                      ref={inputRef}
                      id="driver-search"
                      placeholder="Cari driver untuk pengantaran PO Klien..."
                      value={searchTerm}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (searchTerm.trim() !== "" && booster.length > 0) {
                          setIsOpen(true);
                        }
                      }}
                      className="h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-colors text-left pr-10"
                    />

                    {/* Clear button ketika ada value */}
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClearDriver}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Suggestion */}
                  {isOpen && searchTerm.trim() !== "" && (
                    <div className="absolute mt-1 w-full max-h-60 rounded-md border border-gray-200 bg-accent shadow-lg z-10 overflow-y-auto">
                      {booster.length > 0 ? (
                        booster.map((driver) => (
                          <div
                            key={driver.id}
                            className="cursor-pointer px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                            onClick={() => handleSelectDriver(driver)}
                          >
                            <div className="font-medium">{driver.name}</div>
                            {driver.email && (
                              <div className="text-xs text-gray-500 mt-1">
                                {driver.email}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          Tidak ada driver ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Driver Info */}
                {driverId.driver_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Driver dipilih: {driverId.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Driver siap untuk pengantaran
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearDriver}
                        className="h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-left">
                  Form diatas akan digunakan dalam surat Jalan
                </p>
              </div>
            ) : (
              <section className="mt-6 bg-white dark:bg-zinc-900 border border-primary/30 rounded-2xl shadow-sm p-5 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-primary">
                    Stok Tidak Mencukupi
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-5 text-left">
                  Maaf, produk tersebut tidak memenuhi permintaan dari klien
                  karena stok tidak mencukupi.
                </p>

                {/* Detail produk bermasalah */}
                <div className="space-y-4 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-left">
                    Detail Produk yang Bermasalah:
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {data?.data?.map((item, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-xl p-4 cursor-pointer text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <h3 className="font-semibold text-primary group-hover:text-primary/90 text-sm">
                                {item?.name}
                              </h3>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs">
                              <span className="text-muted-foreground">
                                Permintaan:{" "}
                                <span className="font-semibold text-primary">
                                  {item?.quantity} {item?.unit_code}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                Stok Tersedia:{" "}
                                <span className="font-semibold text-destructive">
                                  {item?.exist}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="p-2 bg-primary/20 rounded-lg ml-3 group-hover:bg-primary/30 transition-all duration-300 flex-shrink-0">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 rounded-lg px-6">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md"
            disabled={data?.status && !driverId.driver_id}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
