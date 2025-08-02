/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  DollarSign,
  Plus,
  Minus,
  Receipt,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Calculator,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CashRegisterSession {
  id: string;
  openingFloat: number;
  totalCashSales: number;
  cashIn: number;
  cashOut: number;
  expectedBalance: number;
  openedAt: string;
  status: "OPEN" | "CLOSED";
  closingBalance?: number;
  discrepancy?: number;
  notes?: string;
}

interface CashRegisterLog {
  id: string;
  type: "CASH_IN" | "CASH_OUT" | "SALE" | "OPENING_FLOAT" | "CLOSING_BALANCE";
  amount: number;
  reason?: string;
  createdAt: string;
}

export default function CashRegisterPage() {
  const [currentSession, setCurrentSession] =
    useState<CashRegisterSession | null>(null);
  const [logs, setLogs] = useState<CashRegisterLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [openingFloat, setOpeningFloat] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashReason, setCashReason] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  // Dialog states
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCashInDialog, setShowCashInDialog] = useState(false);
  const [showCashOutDialog, setShowCashOutDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const response = await fetch("/api/cash-register/current");
      const data = await response.json();

      if (data.success && data.data) {
        setCurrentSession(data.data);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionLogs = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(
        `/api/cash-register/sessions/${currentSession.id}/logs`
      );
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const openRegister = async () => {
    if (!openingFloat || Number(openingFloat) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid opening float amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cash-register/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingFloat: Number(openingFloat),
          branchId: "current-branch-id", // Get from context
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentSession(data.data);
        setOpeningFloat("");
        setShowOpenDialog(false);
        toast({
          title: "Register Opened",
          description: `Cash register opened with UGX ${formatNumber(Number(openingFloat))} float`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open register",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cashIn = async () => {
    if (!cashAmount || Number(cashAmount) <= 0 || !cashReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter amount and reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cash-register/cash-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession!.id,
          amount: Number(cashAmount),
          reason: cashReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update current session
        setCurrentSession((prev) => ({
          ...prev!,
          cashIn: prev!.cashIn + Number(cashAmount),
          expectedBalance: prev!.expectedBalance + Number(cashAmount),
        }));

        setCashAmount("");
        setCashReason("");
        setShowCashInDialog(false);

        toast({
          title: "Cash Added",
          description: `UGX ${formatNumber(Number(cashAmount))} added to register`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cash",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!cashAmount || Number(cashAmount) <= 0 || !cashReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter amount and reason",
        variant: "destructive",
      });
      return;
    }

    if (Number(cashAmount) > currentSession!.expectedBalance) {
      toast({
        title: "Error",
        description: "Insufficient cash in register",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cash-register/cash-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession!.id,
          amount: Number(cashAmount),
          reason: cashReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update current session
        setCurrentSession((prev) => ({
          ...prev!,
          cashOut: prev!.cashOut + Number(cashAmount),
          expectedBalance: prev!.expectedBalance - Number(cashAmount),
        }));

        setCashAmount("");
        setCashReason("");
        setShowCashOutDialog(false);

        toast({
          title: "Cash Removed",
          description: `UGX ${formatNumber(Number(cashAmount))} removed from register`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove cash",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeRegister = async () => {
    if (!closingBalance || Number(closingBalance) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid closing balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cash-register/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession!.id,
          closingBalance: Number(closingBalance),
          notes: closingNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentSession(null);
        setClosingBalance("");
        setClosingNotes("");
        setShowCloseDialog(false);

        const discrepancy =
          Number(closingBalance) - currentSession!.expectedBalance;

        toast({
          title: "Register Closed",
          description: `Register closed with ${
            discrepancy === 0
              ? "no discrepancy"
              : `UGX ${formatNumber(Math.abs(discrepancy))} ${discrepancy > 0 ? "over" : "short"}`
          }`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close register",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "CASH_IN":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "CASH_OUT":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "SALE":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "OPENING_FLOAT":
        return <Unlock className="h-4 w-4 text-gray-600" />;
      case "CLOSING_BALANCE":
        return <Lock className="h-4 w-4 text-gray-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case "CASH_IN":
        return "Cash In";
      case "CASH_OUT":
        return "Cash Out";
      case "SALE":
        return "Sale";
      case "OPENING_FLOAT":
        return "Opening Float";
      case "CLOSING_BALANCE":
        return "Closing Balance";
      default:
        return type;
    }
  };

  if (loading && !currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading cash register...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cash Register</h1>
            <p className="text-gray-500">
              Manage your cash drawer and transactions
            </p>
          </div>
          <Badge
            variant={currentSession ? "default" : "secondary"}
            className="text-sm"
          >
            {currentSession ? (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Register Open
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Register Closed
              </>
            )}
          </Badge>
        </div>

        {!currentSession ? (
          /* No Active Session */
          <Card className="text-center py-12">
            <CardContent>
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Cash Register Closed
              </h3>
              <p className="text-gray-500 mb-6">
                Open your cash register to start accepting payments
              </p>
              <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Unlock className="h-5 w-5 mr-2" />
                    Open Register
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Open Cash Register</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Opening Float Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter opening float (UGX)"
                        value={openingFloat}
                        onChange={(e) => setOpeningFloat(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the amount of cash you&apos;re starting with in
                        the drawer
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={openRegister}
                      disabled={loading}
                    >
                      {loading ? "Opening..." : "Open Register"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          /* Active Session */
          <>
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Sales (Cash)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    UGX {formatNumber(currentSession.totalCashSales)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Cash transactions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cash In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    UGX {formatNumber(currentSession.cashIn)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Added to drawer
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cash Out
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    UGX {formatNumber(currentSession.cashOut)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Minus className="h-3 w-3 mr-1" />
                    Removed from drawer
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Expected Cash
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    UGX {formatNumber(currentSession.expectedBalance)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calculator className="h-3 w-3 mr-1" />
                    Current balance
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Session</span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Opened {new Date(currentSession.openedAt).toLocaleString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Opening Float:</span>
                    <div className="font-semibold">
                      UGX {formatNumber(currentSession.openingFloat)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Expected Balance:</span>
                    <div className="font-semibold text-primary">
                      UGX {formatNumber(currentSession.expectedBalance)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Dialog
                    open={showCashInDialog}
                    onOpenChange={setShowCashInDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Cash
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Cash to Register</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            Amount (UGX)
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Reason</label>
                          <Input
                            placeholder="e.g., Bank deposit, Change fund top-up"
                            value={cashReason}
                            onChange={(e) => setCashReason(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={cashIn}
                          disabled={loading}
                        >
                          {loading ? "Adding..." : "Add Cash"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={showCashOutDialog}
                    onOpenChange={setShowCashOutDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Minus className="h-4 w-4 mr-1" />
                        Cash Out
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Cash from Register</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Available cash: UGX{" "}
                            {formatNumber(currentSession.expectedBalance)}
                          </AlertDescription>
                        </Alert>
                        <div>
                          <label className="text-sm font-medium">
                            Amount (UGX)
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            max={currentSession.expectedBalance}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Reason</label>
                          <Input
                            placeholder="e.g., Expense payment, Bank deposit"
                            value={cashReason}
                            onChange={(e) => setCashReason(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={cashOut}
                          disabled={loading}
                        >
                          {loading ? "Removing..." : "Remove Cash"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={showLogsDialog}
                    onOpenChange={setShowLogsDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadSessionLogs}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Log
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Register Activity Log</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getLogTypeIcon(log.type)}
                              <div>
                                <div className="font-medium">
                                  {getLogTypeLabel(log.type)}
                                </div>
                                {log.reason && (
                                  <div className="text-sm text-gray-500">
                                    {log.reason}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400">
                                  {new Date(log.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${
                                  log.type === "CASH_IN" || log.type === "SALE"
                                    ? "text-green-600"
                                    : log.type === "CASH_OUT"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                }`}
                              >
                                {log.type === "CASH_OUT" ? "-" : "+"}UGX{" "}
                                {formatNumber(log.amount)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={showCloseDialog}
                    onOpenChange={setShowCloseDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Lock className="h-4 w-4 mr-1" />
                        Close Register
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Close Cash Register</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Expected cash in drawer: UGX{" "}
                            {formatNumber(currentSession.expectedBalance)}
                          </AlertDescription>
                        </Alert>
                        <div>
                          <label className="text-sm font-medium">
                            Counted Cash Amount (UGX)
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter actual cash counted"
                            value={closingBalance}
                            onChange={(e) => setClosingBalance(e.target.value)}
                          />
                        </div>
                        {closingBalance && (
                          <div className="p-3 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                              <span>Expected:</span>
                              <span>
                                UGX{" "}
                                {formatNumber(currentSession.expectedBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Counted:</span>
                              <span>
                                UGX {formatNumber(Number(closingBalance))}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center font-semibold">
                              <span>Difference:</span>
                              <span
                                className={
                                  Number(closingBalance) -
                                    currentSession.expectedBalance ===
                                  0
                                    ? "text-green-600"
                                    : Number(closingBalance) -
                                          currentSession.expectedBalance >
                                        0
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }
                              >
                                {Number(closingBalance) -
                                  currentSession.expectedBalance ===
                                0
                                  ? "No Difference"
                                  : `${Number(closingBalance) - currentSession.expectedBalance > 0 ? "+" : ""}UGX ${formatNumber(
                                      Math.abs(
                                        Number(closingBalance) -
                                          currentSession.expectedBalance
                                      )
                                    )} ${Number(closingBalance) - currentSession.expectedBalance > 0 ? "Over" : "Short"}`}
                              </span>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium">
                            Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="Any notes about discrepancies or issues..."
                            value={closingNotes}
                            onChange={(e) => setClosingNotes(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={closeRegister}
                          disabled={loading}
                        >
                          {loading ? "Closing..." : "Confirm & Close Register"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
