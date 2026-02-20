/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle,
  FileText,
  ArrowRight,
  ArrowDownLeft,
  RefreshCw,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useBranch } from "@/context/BranchContext";
import { useAuth } from "@/context/AuthContext";
import {
  createStockTransferApi,
  StockTransfer,
  TransferStatus,
} from "@/src/data/api/stock-transfer-http-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function StockTransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentBranch } = useBranch();
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;

  const [transfer, setTransfer] = useState<StockTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState("");

  const fetchTransfer = useCallback(async () => {
    setLoading(true);
    try {
      const api = createStockTransferApi(getAuthHeaders);
      const response = await api.getTransfer(id);
      setTransfer(response.data || response); // Handle different response wrappers
    } catch (error) {
      console.error("Failed to fetch transfer:", error);
      toast({
        title: "Error",
        description: "Failed to load transfer details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeaders, toast]);

  useEffect(() => {
    fetchTransfer();
  }, [fetchTransfer]);

  const handleAction = async (
    action: "approve" | "complete" | "reject" | "cancel",
  ) => {
    setActionLoading(true);
    try {
      const api = createStockTransferApi(getAuthHeaders);
      let response;

      switch (action) {
        case "approve":
          response = await api.approveTransfer(id, reason);
          break;
        case "complete":
          response = await api.completeTransfer(id);
          break;
        case "reject":
          response = await api.rejectTransfer(id, reason);
          break;
        case "cancel":
          response = await api.cancelTransfer(id, reason);
          break;
      }

      toast({
        title: "Success",
        description: `Transfer ${action}ed successfully`,
      });
      setReason("");
      fetchTransfer();
    } catch (error: any) {
      console.error(`Failed to ${action} transfer:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} transfer`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending Approval
          </Badge>
        );
      case TransferStatus.APPROVED:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Approved
          </Badge>
        );
      case TransferStatus.IN_TRANSIT:
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            In Transit
          </Badge>
        );
      case TransferStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        );
      case TransferStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case TransferStatus.CANCELLED:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading transfer details...</p>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
        <h1 className="text-2xl font-bold">Transfer Not Found</h1>
        <p className="text-gray-600">
          The requested stock transfer could not be found.
        </p>
        <Link href="/inventory/transfers">
          <Button>Back to Transfers</Button>
        </Link>
      </div>
    );
  }

  const isFromBranch = transfer.fromBranchId === currentBranch?.id;
  const isToBranch = transfer.toBranchId === currentBranch?.id;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory/transfers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {transfer.referenceNumber}
              </h1>
              {getStatusBadge(transfer.status)}
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <span>{transfer.fromBranch?.name}</span>
              <ArrowRight className="w-4 h-4" />
              <span>{transfer.toBranch?.name}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {transfer.status === TransferStatus.PENDING && isFromBranch && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Transfer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please provide a reason for rejecting this transfer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="reject-reason">Rejection Reason</Label>
                    <Textarea
                      id="reject-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Stock not actually available, wrong destination..."
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReason("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("reject")}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!reason.trim() || actionLoading}
                    >
                      Reject Transfer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve & Send
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Transfer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Approving will immediately deduct the items from your
                      current stock.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="approve-notes">Notes (Optional)</Label>
                    <Textarea
                      id="approve-notes"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Additional notes for the destination branch..."
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReason("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("approve")}
                      disabled={actionLoading}
                    >
                      Approve & Send
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {transfer.status === TransferStatus.IN_TRANSIT && isToBranch && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Received
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Receive Stock</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you have received all items in this transfer?
                    This will add the items to your stock.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAction("complete")}
                    disabled={actionLoading}
                  >
                    Confirm Receipt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {(transfer.status === TransferStatus.PENDING ||
            transfer.status === TransferStatus.IN_TRANSIT) &&
            (isFromBranch || isToBranch) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-500 flex-1 sm:flex-none"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Transfer</AlertDialogTitle>
                    <AlertDialogDescription>
                      {transfer.status === TransferStatus.IN_TRANSIT
                        ? "This transfer is already in transit. Cancelling will return the stock to the source branch."
                        : "Are you sure you want to cancel this transfer request?"}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                    <Textarea
                      id="cancel-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why is this transfer being cancelled?"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReason("")}>
                      No, keep it
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("cancel")}
                      className="bg-gray-600 hover:bg-gray-700"
                      disabled={!reason.trim() || actionLoading}
                    >
                      Cancel Transfer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Transferred Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.sellingPrice || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(
                          (item.sellingPrice || 0) * item.quantity,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Total Transfer Value</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(transfer.totalValue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {transfer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {transfer.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {transfer.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">{transfer.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Date Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transfer.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {transfer.expectedDeliveryDate && (
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Expected Delivery</p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        transfer.expectedDeliveryDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 border-t pt-4">
                <User className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Requested By</p>
                  <p className="text-sm text-gray-600">
                    {transfer.requestedBy
                      ? `${transfer.requestedBy.firstName} ${transfer.requestedBy.lastName}`
                      : "System"}
                  </p>
                </div>
              </div>

              {transfer.approvedBy && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Approved By</p>
                    <p className="text-sm text-gray-600">
                      {transfer.approvedBy.firstName}{" "}
                      {transfer.approvedBy.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transfer.approvedAt
                        ? new Date(transfer.approvedAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {transfer.receivedBy && (
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Received By</p>
                    <p className="text-sm text-gray-600">
                      {transfer.receivedBy.firstName}{" "}
                      {transfer.receivedBy.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transfer.completedAt
                        ? new Date(transfer.completedAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-sm uppercase text-gray-500">
                Branch Details
              </h4>
              <div>
                <p className="text-xs text-gray-500">Source Branch</p>
                <p className="text-sm font-medium">
                  {transfer.fromBranch?.name}
                </p>
              </div>
              <ArrowDownLeft className="w-4 h-4 text-gray-300 mx-auto" />
              <div>
                <p className="text-xs text-gray-500">Destination Branch</p>
                <p className="text-sm font-medium">{transfer.toBranch?.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
