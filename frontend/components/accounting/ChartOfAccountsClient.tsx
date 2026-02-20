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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookkeeping } from "@/context/BookkeepingContext";
import { ChartOfAccounts, AccountType, AccountSubType } from "@/src/types/accounting";

const AccountForm = ({ account, onSave, onCancel }:any) => {
  const [accountCode, setAccountCode] = useState(account?.accountCode || "");
  const [accountName, setAccountName] = useState(account?.accountName || "");
  const [accountType, setAccountType] = useState(account?.accountType || "");
  const [accountSubType, setAccountSubType] = useState(account?.accountSubType || "");

  const handleSubmit = () => {
    onSave({
      accountCode,
      accountName,
      accountType,
      accountSubType,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="accountCode">Account Code</Label>
        <Input id="accountCode" value={accountCode} onChange={(e) => setAccountCode(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="accountName">Account Name</Label>
        <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AccountType).map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
       <div>
        <Label htmlFor="accountSubType">Account Sub-Type</Label>
        <Select value={accountSubType} onValueChange={setAccountSubType}>
          <SelectTrigger>
            <SelectValue placeholder="Select a sub-type" />
          </SelectTrigger>
          <SelectContent>
             {Object.values(AccountSubType).map((subType) => (
              <SelectItem key={subType} value={subType}>{subType}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

const ChartOfAccountsClient = () => {
  const { getAccounts, createAccount, loading, error, initializeAccounts } = useBookkeeping();
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccounts | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getAccounts();
      if (data && data.accounts) {
        setAccounts(data.accounts);
      }
    };
    fetchAccounts();
  }, [getAccounts]);

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account: ChartOfAccounts) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleSave = async (accountData: Partial<ChartOfAccounts>) => {
    const newAccount = await createAccount(accountData);
    if (newAccount) {
      setAccounts((prev) => [...prev, newAccount]);
    }
    setIsFormOpen(false);
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
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Accounts List</h2>
          <Button variant="outline" size="sm" onClick={initializeAccounts}>
            Initialize Default Accounts
          </Button>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            </DialogHeader>
            <AccountForm account={selectedAccount} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sub-Type</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountCode}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.accountSubType}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ChartOfAccountsClient;