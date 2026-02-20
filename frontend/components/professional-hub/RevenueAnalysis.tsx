"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WeldingJob } from "@/src/types/weldingJob"
import { WeldingInvoice } from "@/src/types/weldingFinancials"

interface RevenueAnalysisProps {
  jobs: WeldingJob[]
  invoices: WeldingInvoice[]
}

export function RevenueAnalysis({ jobs, invoices }: RevenueAnalysisProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const jobRevenue = jobs.map((job) => {
    const jobInvoices = invoices.filter((inv) => inv.weldingJobId === job.id)
    const expectedRevenue = jobInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const revenueCollected = jobInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const percentageCollected = expectedRevenue > 0 ? (revenueCollected / expectedRevenue) * 100 : 0

    return {
      job,
      expectedRevenue,
      revenueCollected,
      percentageCollected,
    }
  })

  const totalPages = Math.ceil(jobRevenue.length / itemsPerPage)
  const paginatedData = jobRevenue.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500 py-4">Job</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 py-4">Expected</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 py-4">Collected</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 py-4">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(({ job, expectedRevenue, revenueCollected, percentageCollected }) => (
                <TableRow key={job.id} className="hover:bg-gray-50/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="font-semibold text-gray-900 text-sm">{job.jobType}</div>
                    <div className="text-xs text-gray-500">{job.customerName}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900 text-sm py-4">
                    UGX {expectedRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-brand-primary text-sm py-4">
                    UGX {revenueCollected.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs font-bold text-gray-700">{percentageCollected.toFixed(0)}%</span>
                      <Progress value={percentageCollected} className="w-16 md:w-24 h-1.5" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {jobRevenue.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No jobs with revenue data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 px-2 border-gray-200 text-gray-600 hover:bg-white hover:text-brand-primary"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 px-2 border-gray-200 text-gray-600 hover:bg-white hover:text-brand-primary"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
