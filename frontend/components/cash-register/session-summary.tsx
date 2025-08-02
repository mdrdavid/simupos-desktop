"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatNumber } from "@/lib/utils"
import { DollarSign, Plus, Minus, Calculator, Clock, User, AlertTriangle, CheckCircle } from "lucide-react"

interface SessionSummaryProps {
  session: {
    id: string
    openingFloat: number
    totalCashSales: number
    cashIn: number
    cashOut: number
    expectedBalance: number
    closingBalance?: number
    discrepancy?: number
    openedAt: string
    closedAt?: string
    status: "OPEN" | "CLOSED"
    notes?: string
    user?: {
      name: string
    }
  }
}

export function SessionSummary({ session }: SessionSummaryProps) {
  const isOpen = session.status === "OPEN"
  const hasDiscrepancy = session.discrepancy && Math.abs(session.discrepancy) > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Session Summary</CardTitle>
          <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Opened: {new Date(session.openedAt).toLocaleString()}
          {session.closedAt && (
            <>
              {" • "}
              Closed: {new Date(session.closedAt).toLocaleString()}
            </>
          )}
        </div>
        {session.user && (
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            Cashier: {session.user.name}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Opening Float:</span>
              <span className="font-medium">UGX {formatNumber(session.openingFloat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Cash Sales:
              </span>
              <span className="font-medium text-green-600">UGX {formatNumber(session.totalCashSales)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Plus className="h-3 w-3 mr-1" />
                Cash In:
              </span>
              <span className="font-medium text-blue-600">UGX {formatNumber(session.cashIn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Minus className="h-3 w-3 mr-1" />
                Cash Out:
              </span>
              <span className="font-medium text-red-600">UGX {formatNumber(session.cashOut)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Calculator className="h-3 w-3 mr-1" />
                Expected:
              </span>
              <span className="font-semibold text-primary">UGX {formatNumber(session.expectedBalance)}</span>
            </div>
            {session.closingBalance !== undefined && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Counted:</span>
                  <span className="font-semibold">UGX {formatNumber(session.closingBalance)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    {hasDiscrepancy ? (
                      <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    )}
                    Difference:
                  </span>
                  <span
                    className={`font-semibold ${
                      !hasDiscrepancy ? "text-green-600" : session.discrepancy! > 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {!hasDiscrepancy
                      ? "Perfect!"
                      : `${session.discrepancy! > 0 ? "+" : ""}UGX ${formatNumber(Math.abs(session.discrepancy!))} ${
                          session.discrepancy! > 0 ? "Over" : "Short"
                        }`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <>
            <Separator />
            <div>
              <span className="text-sm font-medium text-gray-600">Notes:</span>
              <p className="text-sm text-gray-700 mt-1">{session.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
