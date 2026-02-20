/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdvancedAccounting } from "@/context/AdvancedAccountingContext";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const mockBudgetData = [
  { category: "Salaries", budget: 50000000, actual: 48000000 },
  { category: "Rent", budget: 15000000, actual: 15000000 },
  { category: "Utilities", budget: 5000000, actual: 5500000 },
  { category: "Marketing", budget: 10000000, actual: 8500000 },
];

export default function Budgeting() {
  const { createBudget, getBudgetAlerts, loading } = useAdvancedAccounting();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
        try {
            const data = await getBudgetAlerts();
            setAlerts(data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchAlerts();
  }, [getBudgetAlerts]);

  const handleAddBudget = async () => {
    if (!accountId || !amount) return;
    try {
        await createBudget({
            accountId,
            amount: Number(amount),
            fiscalYear: new Date().getFullYear(),
            periodType: "monthly",
            alertThreshold: 90
        });
        toast({ title: "Budget Created", description: "The budget item has been added." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to create budget.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgeting & Forecasting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Actual vs. Budget - October 2025</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={mockBudgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#8884d8" name="Budget (UGX)" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual (UGX)" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Budget Entry</h3>
          <div className="p-4 border rounded-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="category">Account ID</Label>
                    <Input id="category" placeholder="Enter Account ID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="budget-amount">Budget Amount (UGX)</Label>
                    <Input id="budget-amount" type="number" placeholder="e.g. 2000000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="self-end">
                    <Button onClick={handleAddBudget} disabled={loading}>Add Budget Item</Button>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}