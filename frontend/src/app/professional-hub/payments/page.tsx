/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/context/PaymentContext";
import { useUser } from "@/context/UserContext";
import { useWelding } from "@/context/WeldingContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Payment } from "@/src/types/payment";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentsPage() {
  const router = useRouter();
  const { currentBranchId } = useAuth();
  const { payments, pagination, loading, fetchPayments, deletePayment } = usePayments();
  const { users: allUsers, getUsers } = useUser();
  const { weldingJobs, fetchWeldingJobs } = useWelding();

  const [filters, setFilters] = useState({
    artisanId: "all",
    jobId: "all",
    startDate: "",
    endDate: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (currentBranchId) {
      // Fetch initial data for filters and the first page of payments
      getUsers(currentBranchId);
      fetchWeldingJobs(); // Assuming this fetches all jobs for the branch
      fetchPayments(currentBranchId, { page: 1, limit: 20 });
    }
  }, [currentBranchId, getUsers, fetchWeldingJobs, fetchPayments]);

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPayment) {
      const success = await deletePayment(selectedPayment.id);
      if (success) {
        toast.success("Payment deleted successfully.");
      }
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  // Prepare filter parameters for API call
  const getFilterParams = () => {
    const params: any = { 
      ...filters,
      page: 1
    };
    
    // Remove "all" values which are our UI placeholders
    if (params.artisanId === "all") delete params.artisanId;
    if (params.jobId === "all") delete params.jobId;
    
    return params;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Artisan Payments</h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage, and track all payments made to artisans.
        </p>
      </header>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="artisan-filter">Artisan</Label>
            <Select
              value={filters.artisanId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, artisanId: value }))}
            >
              <SelectTrigger id="artisan-filter">
                <SelectValue placeholder="All Artisans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Artisans</SelectItem>
                {allUsers
                  .filter(u => u.role === 'artisan' && u.id) // Ensure id exists
                  .map(artisan => (
                    <SelectItem key={artisan.id} value={artisan.id}>
                      {artisan.firstName} {artisan.lastName}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-filter">Job</Label>
            <Select
              value={filters.jobId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, jobId: value }))}
            >
              <SelectTrigger id="job-filter">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {weldingJobs
                  .filter(job => job.id) // Ensure id exists
                  .map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.description || `Job ${job.id.substring(0, 8)}`}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => currentBranchId && fetchPayments(currentBranchId, getFilterParams())}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Artisan</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.job?.description || 'N/A'}</TableCell>
                  <TableCell>{`${payment.artisan?.firstName} ${payment.artisan?.lastName}`}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(payment.amount)}
                  </TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/professional-hub/vouchers/${payment.id}`)}>
                          View Voucher
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(payment)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No payments found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Page {pagination.page} of {pagination.pages} (Total: {pagination.total} payments)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentBranchId && fetchPayments(currentBranchId, { 
              ...getFilterParams(), 
              page: pagination.page - 1 
            })}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentBranchId && fetchPayments(currentBranchId, { 
              ...getFilterParams(), 
              page: pagination.page + 1 
            })}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}