"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Trash2,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  FileText,
  Filter,
  Warehouse,
  BanknoteIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts/Finance.context";
import { formatIDR } from "../format/IDR";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";

interface Submission {
  id: string;
  purchase_order_client_id: string;
  is_return: string;
  is_take_out: string;
  is_refund: string;
  travel_code: string | null;
  received_warehouse_date: string | null;
  received_warehouse_by: string | null;
  received_warehouse_proof: string | null;
  problem_product_take_by_name: string | null;
  send_to_client_date: string | null;
  client_name: string | null;
  created_by_name: string | null;
  total_refund: number | null;
  assignment_date: string | null;
  assignment_by: string | null;
  problem_product_take_by: string | null;
  driver_id: string | null;
  finish_date: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

export default function PurchaseOrderRefund() {
  const navigate = useNavigate();
  const { isLoading, categoryCode, statusCode } = useFinance();
  const { getAllPurchaseOrderClientProblemProduct, purchaseOrderProblem } =
    usePurchaseOrderClients();

  const handleRefreshList = () => {
    getAllPurchaseOrderClientProblemProduct({
      adjustment_type: "REFUND",
      is_finance_out_page: true,
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const getSubmissionStatus = (submission: Submission) => {
    if (submission.finish_date) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    } else if (submission.assignment_date) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
          <Truck className="mr-1 h-3 w-3" />
          Assigned
        </Badge>
      );
    } else if (submission.received_warehouse_date) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
          <Warehouse className="mr-1 h-3 w-3" />
          Gudang Sudah Menerima
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    }
  };

  const getSubmissionTypeBadges = (submission: Submission) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {submission.is_return === "Y" && (
          <Badge variant="destructive">Return</Badge>
        )}
        {submission.is_take_out === "Y" && (
          <Badge variant="default">Take Out</Badge>
        )}
        {submission.is_refund === "Y" && <Badge variant="yellow">Refund</Badge>}
      </div>
    );
  };

  const getSubmissionDetails = (submission: Submission) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Tanggal dibuat: {formatDateTime(submission.created_at)}</span>
        </div>

        {submission.received_warehouse_date && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span>
              Terakhir Update Gudang:{" "}
              {formatDateTime(submission.received_warehouse_date)}
            </span>
          </div>
        )}

        {submission.assignment_date && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <span>Assigned: {formatDateTime(submission.assignment_date)}</span>
          </div>
        )}

        {submission.finish_date && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Completed: {formatDateTime(submission.finish_date)}</span>
          </div>
        )}
      </div>
    );
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2"></div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              List Pengajuan Refund
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {purchaseOrderProblem.length}{" "}
              {purchaseOrderProblem.length === 1 ? "Pengajuan" : "Pengajuan"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {purchaseOrderProblem.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No submissions found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new submission.
              </p>
              {/* <Button onClick={handleAddSubmission} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create New Submission
              </Button> */}
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrderProblem.map((submission) => (
                <Card
                  key={submission.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm px-2 py-1 rounded">
                            {submission.client_name.substring(0, 8)}
                          </span>
                          {getSubmissionStatus(submission)}
                          {submission.travel_code && (
                            <Badge variant="outline" className="bg-purple-50">
                              {submission.travel_code}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm px-2 py-1 rounded">
                            {formatIDR(submission?.total_refund)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {getSubmissionTypeBadges(submission)}
                          {getSubmissionDetails(submission)}

                          <div className="text-sm text-gray-500">
                            <p>
                              Nama Pengajuan:{" "}
                              {submission.created_by_name || "-"}
                            </p>
                            {submission.problem_product_take_by && (
                              <p>
                                Barang Sudah Diambil Oleh :{" "}
                                {submission.problem_product_take_by_name}
                              </p>
                            )}
                            {submission.send_to_client_date && (
                              <p>
                                Send to Client:{" "}
                                {formatDateOnly(submission.send_to_client_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            navigate("/finance-out/create", {
                              state: {
                                type: "EXPENSE",
                                statusCode: statusCode,
                                categoryCode: categoryCode,
                                refund: submission,
                              },
                            });
                          }}
                          className="flex items-center gap-1"
                        >
                          <BanknoteIcon className="h-4 w-4" />
                          Prosess
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
