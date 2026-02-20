"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookkeeping } from "@/context/BookkeepingContext";
import { TrialBalance, ProfitAndLoss, BalanceSheet, CashFlowStatement } from "@/src/types/accounting";

const TrialBalanceTab = ({ data }: { data: TrialBalance | null }) => {
  if (!data) return <div>No trial balance data available.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.accountBalances.map((acc) => (
              <TableRow key={acc.accountCode}>
                <TableCell>{acc.accountName}</TableCell>
                <TableCell className="text-right">{acc.debitBalance.toLocaleString()}</TableCell>
                <TableCell className="text-right">{acc.creditBalance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{data.totalDebits.toLocaleString()}</TableCell>
              <TableCell className="text-right">{data.totalCredits.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const IncomeStatementTab = ({ data }: { data: ProfitAndLoss | null }) => {
    if (!data) return <div>No income statement data available.</div>;

    return (
        <Card>
            <CardHeader><CardTitle>Income Statement (Profit & Loss)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg">Revenue</h3>
                    {data.revenue.items.map(item => <div key={item.accountName} className="flex justify-between"><span>{item.accountName}</span><span>{item.amount.toLocaleString()} UGX</span></div>)}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Revenue</span><span>{data.revenue.total.toLocaleString()} UGX</span></div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Expenses</h3>
                    {data.expenses.items.map(item => <div key={item.accountName} className="flex justify-between"><span>{item.accountName}</span><span>{item.amount.toLocaleString()} UGX</span></div>)}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Expenses</span><span>{data.expenses.total.toLocaleString()} UGX</span></div>
                </div>
                <div className="flex justify-between font-bold text-xl border-t pt-4 mt-4"><span>Net Income</span><span>{data.netIncome.toLocaleString()} UGX</span></div>
            </CardContent>
        </Card>
    );
};

const BalanceSheetTab = ({ data }: { data: BalanceSheet | null }) => {
    if (!data) return <div>No balance sheet data available.</div>;

    return (
        <Card>
            <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Assets</h3>
                    {data.assets.items.map(item => <div key={item.accountName} className="flex justify-between"><span>{item.accountName}</span><span>{item.balance.toLocaleString()} UGX</span></div>)}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Assets</span><span>{data.assets.total.toLocaleString()} UGX</span></div>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Liabilities & Equity</h3>
                    {data.liabilities.items.map(item => <div key={item.accountName} className="flex justify-between"><span>{item.accountName}</span><span>{item.balance.toLocaleString()} UGX</span></div>)}
                    {data.equity.items.map(item => <div key={item.accountName} className="flex justify-between"><span>{item.accountName}</span><span>{item.balance.toLocaleString()} UGX</span></div>)}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Liabilities & Equity</span><span>{(data.liabilities.total + data.equity.total).toLocaleString()} UGX</span></div>
                </div>
            </CardContent>
        </Card>
    );
};

const CashFlowTab = ({ data }: { data: CashFlowStatement | null }) => {
    if (!data) return <div>No cash flow statement data available.</div>;

    return (
        <Card>
            <CardHeader><CardTitle>Cash Flow Statement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg">Operating Activities</h3>
                    {data.operatingActivities.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between"><span>{item.description}</span><span>{item.amount.toLocaleString()} UGX</span></div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Net Cash from Operating Activities</span><span>{data.operatingActivities.netCashFlow.toLocaleString()} UGX</span></div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Investing Activities</h3>
                    {data.investingActivities.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between"><span>{item.description}</span><span>{item.amount.toLocaleString()} UGX</span></div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Net Cash from Investing Activities</span><span>{data.investingActivities.netCashFlow.toLocaleString()} UGX</span></div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Financing Activities</h3>
                    {data.financingActivities.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between"><span>{item.description}</span><span>{item.amount.toLocaleString()} UGX</span></div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Net Cash from Financing Activities</span><span>{data.financingActivities.netCashFlow.toLocaleString()} UGX</span></div>
                </div>
                <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between"><span>Net Change in Cash</span><span>{data.netCashFlow.toLocaleString()} UGX</span></div>
                    <div className="flex justify-between"><span>Beginning Cash Balance</span><span>{data.beginningCash.toLocaleString()} UGX</span></div>
                    <div className="flex justify-between font-bold text-lg"><span>Ending Cash Balance</span><span>{data.endingCash.toLocaleString()} UGX</span></div>
                </div>
            </CardContent>
        </Card>
    );
};

const ReportsClient = () => {
    const { getTrialBalance, getProfitAndLoss, getBalanceSheet, getCashFlowStatement, loading, error } = useBookkeeping();
    const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
    const [incomeStatement, setIncomeStatement] = useState<ProfitAndLoss | null>(null);
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
    const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

            const [tbData, plData, bsData, cfData] = await Promise.all([
                getTrialBalance(today.toISOString()),
                getProfitAndLoss(lastMonth.toISOString(), today.toISOString()),
                getBalanceSheet(today.toISOString()),
                getCashFlowStatement(lastMonth.toISOString(), today.toISOString())
            ]);

            if (tbData) setTrialBalance(tbData);
            if (plData) setIncomeStatement(plData);
            if (bsData) setBalanceSheet(bsData);
            if (cfData) setCashFlow(cfData);
        };

        fetchReports();
    }, [getTrialBalance, getProfitAndLoss, getBalanceSheet]);


    if (loading) {
        return <div>Loading reports...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

  return (
    <Tabs defaultValue="trial-balance" className="w-full">
      <TabsList>
        <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
      </TabsList>
      <TabsContent value="trial-balance">
        <TrialBalanceTab data={trialBalance} />
      </TabsContent>
      <TabsContent value="income-statement">
        <IncomeStatementTab data={incomeStatement} />
      </TabsContent>
      <TabsContent value="balance-sheet">
        <BalanceSheetTab data={balanceSheet} />
      </TabsContent>
      <TabsContent value="cash-flow">
        <CashFlowTab data={cashFlow} />
      </TabsContent>
    </Tabs>
  );
};

export default ReportsClient;