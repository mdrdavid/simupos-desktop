/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookkeeping } from "@/context/BookkeepingContext";
import { GeneralLedger } from "@/src/types/accounting";

const JournalEntryForm = ({ onSave, onCancel }: any) => {
  const [entryDate, setEntryDate] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([
    { accountId: "", entryType: "debit", amount: 0 },
    { accountId: "", entryType: "credit", amount: 0 },
  ]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { accountId: "", entryType: "debit", amount: 0 }]);
  };

  const handleSubmit = () => {
    onSave({
      entryDate: new Date(entryDate),
      description,
      items: items.map(item => ({ ...item, amount: Number(item.amount) })),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="e.g., Monthly Depreciation" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Entries</Label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-[10px]">Account ID</Label>
              <Input placeholder="Account" value={item.accountId} onChange={(e) => handleItemChange(index, 'accountId', e.target.value)} />
            </div>
            <div className="w-24">
              <Label className="text-[10px]">Type</Label>
              <select
                className="w-full h-10 px-3 py-2 border rounded-md text-sm"
                value={item.entryType}
                onChange={(e) => handleItemChange(index, 'entryType', e.target.value)}
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div className="w-32">
              <Label className="text-[10px]">Amount</Label>
              <Input type="number" placeholder="0.00" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem}>Add Line</Button>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Save Entry</Button>
      </div>
    </div>
  );
};

const LedgerClient = () => {
  const { getGeneralLedger, loading, error, createJournalEntry } = useBookkeeping();
  const [entries, setEntries] =useState<GeneralLedger[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      const data = await getGeneralLedger();
      if (data && data.entries) {
        setEntries(data.entries);
      }
    };
    fetchLedger();
  }, [getGeneralLedger]);

  const handleSave = async (entryData: any) => {
    try {
        await createJournalEntry(entryData);
        setIsFormOpen(false);
        // Refresh ledger entries would be good here
        window.location.reload();
    } catch (error) {
        console.error("Failed to save journal entry", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">General Ledger</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <JournalEntryForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                <TableCell>{entry.account.accountName}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right">{entry.entryType === 'debit' ? entry.amount.toLocaleString() : '0'}</TableCell>
                <TableCell className="text-right">{entry.entryType === 'credit' ? entry.amount.toLocaleString() : '0'}</TableCell>
                <TableCell className="text-right">{entry.runningBalance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LedgerClient;