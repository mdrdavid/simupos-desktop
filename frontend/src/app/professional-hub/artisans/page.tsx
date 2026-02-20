"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser, UserRole, type UserProfile } from "@/context/UserContext";
import { useWelding } from "@/context/WeldingContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from "next/navigation";
import { PaymentDialog } from "@/components/professional-hub/PaymentDialog";

// Define a type for the combined job data for an artisan
interface ArtisanJob {
  jobId: string;
  assignmentId: string; // Added to identify the assignment for payment
  jobTitle: string;
  jobStatus: string;
  wage: number;
  amountPaid: number;
  balance: number;
  paymentStatus: string;
}

export default function ArtisanPaymentsPage() {
  const { currentBranchId } = useAuth();
  const { getUsers } = useUser();
  const { weldingJobs } = useWelding();
  const [artisans, setArtisans] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<
    (ArtisanJob & { artisanId: string }) | null
  >(null);

  const handlePay = (artisanId: string, job: ArtisanJob) => {
    setSelectedJob({ ...job, artisanId });
    setPaymentDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    const loadData = async () => {
      if (currentBranchId) {
        setLoading(true);
        const allUsers = await getUsers(currentBranchId);
        const artisanUsers = allUsers.filter(
          (u) => u.role === UserRole.ARTISAN || u.role === UserRole.OWNER || u.role === UserRole.MANAGER
        );
        setArtisans(artisanUsers);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [currentBranchId, getUsers]);

  const artisanJobsData = useMemo(() => {
    return artisans.map((artisan) => {
      const assignedJobs: ArtisanJob[] = [];
      weldingJobs.forEach((job) => {
        // Use the detailed assignments from the job
        const assignment = job.assignments?.find(
          (a) => a.userId === artisan.id
        );
        if (assignment) {
          // Payments are now sourced from the detailed payment context
          const amountPaid = parseFloat(assignment.amountPaid) || 0;
          const wage = parseFloat(assignment.agreedWage) || 0;
          const balance = wage - amountPaid;

          let paymentStatus = "Unpaid";
          if (amountPaid > 0 && balance > 0) {
            paymentStatus = "Partial";
          } else if (balance <= 0 && wage > 0) {
            paymentStatus = "Paid";
          }

          assignedJobs.push({
            jobId: job.id,
            assignmentId: assignment.id,
            jobTitle: job.description, // More descriptive
            jobStatus: job.status,
            wage,
            amountPaid,
            balance,
            paymentStatus,
          });
        }
      });
      return {
        artisan,
        jobs: assignedJobs,
      };
    });
  }, [artisans, weldingJobs]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentBranchId) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Artisan Job Payments
      </h1>

      <div className="space-y-8">
        {artisanJobsData.map(({ artisan, jobs }) => (
          <Card key={artisan.id}>
            <CardHeader>
              <CardTitle>
                {artisan.firstName} {artisan.lastName}
              </CardTitle>
              <CardDescription>
                Assigned Jobs and Payment Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-gray-500">No jobs assigned to this artisan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Job Status</TableHead>
                      <TableHead>Agreed Wage</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.jobId}>
                        <TableCell>{job.jobTitle}</TableCell>
                        <TableCell>
                          <Badge>{job.jobStatus}</Badge>
                        </TableCell>
                        <TableCell>UGX {job.wage.toLocaleString()}</TableCell>
                        <TableCell>UGX {job.amountPaid.toLocaleString()}</TableCell>
                        <TableCell>UGX {job.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.paymentStatus === "Paid"
                                ? "default"
                                : job.paymentStatus === "Partial"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {job.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePay(artisan.id, job)}
                            disabled={job.paymentStatus === "Paid"}
                          >
                            Pay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedJob && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={handleCloseDialog}
          artisan={artisans.find(a => a.id === selectedJob.artisanId)}
          job={selectedJob}
        />
      )}
    </div>
  );
}
