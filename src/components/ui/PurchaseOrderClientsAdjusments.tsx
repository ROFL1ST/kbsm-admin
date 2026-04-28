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
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { usePurchaseOrderClients } from "@/contexts/PurchaseOrderClient.Context";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Auth.Context";
import { formatIDR } from "../format/IDR";
import { useToast } from "./use-toast";

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
  transfer_proof_refund: string | null;
  transfer_refund_by: string | null;
  total_refund: number | null;
  send_to_client_date: string | null;
  client_name: string | null;
  created_by_name: string | null;
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

export default function PurchaseOrderClientsAdjusments({
  purchase_order_client_id,
  is_warehouse,
  client_name,
}: {
  purchase_order_client_id?: string;
  is_warehouse?: boolean;
  client_name?: boolean;
}) {
  const { user } = useAuth();

  // Permission checks
  const isFinance = user?.responsibilities?.some(
    (role) => role.code === "FINANCE"
  );
  const isAdmin = user?.responsibilities?.some((role) => role.code === "ADMIN");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    getPurchaseOrderClientProblemProduct,
    deletePurchaseOrderClientProblemProduct,
  } = usePurchaseOrderClients();
  const { toast } = useToast();
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseOrderClientProblemProduct({
        purchase_order_client_id,
      });
      if (response.data) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmission = () => {
    navigate(`/manage-adjusment-products/create`, {
      state: {
        purchase_order_client_id: purchase_order_client_id,
        client_name: client_name,
        from: window.location.pathname,
      },
    });
  };
  const handleViewSubmission = (submission: Submission) => {
    if (is_warehouse) {
      navigate(`/incoming/fixing-order-clients/detail/update`, {
        state: {
          purchase_order_client_id: purchase_order_client_id,
          purchase_order_client_problem_id: submission?.id,
        },
      });
    } else {
      navigate(`/manage-adjusment-products/update`, {
        state: {
          purchase_order_client_id: purchase_order_client_id,
          purchase_order_client_problem_id: submission?.id,
        },
      });
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        setIsDeleting(id);
        const response = await deletePurchaseOrderClientProblemProduct({
          purchase_order_client_id: purchase_order_client_id,
          purchase_order_client_problem_id: id,
        });
        if (!response.status) {
          toast({
            title: "Berhasil",
            description: "Berhasil Menghapus Data Pengajuan",
            variant: "default",
          });
        } else {
          toast({
            title: "Gagal!",
            description: "Gagal Menghapus Data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting submission:", error);
        alert("Failed to delete submission. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleRefreshList = () => {
    fetchSubmissions();
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
          In Progress
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

  useEffect(() => {
    fetchSubmissions();
  }, [purchase_order_client_id]);

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshList}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={handleAddSubmission}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengajuan Pengembalian
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              List Pengajuan Pengembalian Produk
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {submissions.length}{" "}
              {submissions.length === 1 ? "Pengajuan" : "Pengajuan"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No submissions found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new submission.
              </p>
              <Button onClick={handleAddSubmission} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create New Submission
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
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
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200"
                            >
                              {submission.travel_code}
                            </Badge>
                          )}
                        </div>
                        {(isFinance || isAdmin) &&
                          submission?.is_refund === "Y" && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm px-2 py-1 rounded">
                                {formatIDR(submission?.total_refund)}
                              </span>
                            </div>
                          )}

                        <div className="space-y-2">
                          {getSubmissionTypeBadges(submission)}
                          {getSubmissionDetails(submission)}

                          <div className="text-sm">
                            <span className="font-medium">Dibuat Oleh:</span>{" "}
                            <span className="font-bold">
                              {submission.created_by_name || "-"}
                            </span>
                            {submission.problem_product_take_by && (
                              <p>
                                <span className="font-medium">
                                  Diambil oleh:
                                </span>{" "}
                                <span className="font-bold">
                                  {submission.problem_product_take_by_name}
                                </span>
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSubmission(submission.id)}
                          disabled={
                            isDeleting === submission.id ||
                            submission?.finish_date !== null
                          }
                          className="flex items-center gap-1"
                        >
                          {isDeleting === submission.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </>
                          )}
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
