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

import { AccountsBoosterKey, useAuth } from "@/contexts/Auth.Context";
import { PurchaseOrderVendorDocumentKey } from "@/contexts/PurchaseOrderVendors.Context";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface NotesVendorModalProps {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  purchase_order_vendor_id?: string;
  trigger?: React.ReactNode;
  variant?: ButtonVariant;
  handlePrint?: (params: PurchaseOrderVendorDocumentKey) => void;
  showIcon?: boolean;
}

export const NotesVendorModal: React.FC<NotesVendorModalProps> = ({
  title,
  confirmText,
  cancelText,
  purchase_order_vendor_id,
  trigger,
  variant,
  handlePrint,
  showIcon = true,
}) => {
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (handlePrint) {
      handlePrint({
        purchase_order_vendor_id: purchase_order_vendor_id,
        description: description,
      });
    }
  };

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

          <AlertDialogDescription className="text-gray-600">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <span className="text-sm font-medium block mb-1">
                      Informasi Deskripsi
                    </span>
                    <p className="text-sm">
                      Silakan masukkan deskripsi untuk purchase order
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

              <p className="text-xs text-gray-500 text-left">
                Form diatas akan digunakan dalam Purhase Order Supplier
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 rounded-lg px-6">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
