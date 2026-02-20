/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useAdvancedAccounting } from "@/context/AdvancedAccountingContext";
import { toast } from "@/components/ui/use-toast";

const initialAssets = [
  {
    id: "ASSET001",
    name: "Office Laptop",
    purchaseDate: "2023-01-15",
    purchaseCost: 4500000,
    currentValue: 3000000,
    status: "Active",
  },
  {
    id: "ASSET002",
    name: "Delivery Van",
    purchaseDate: "2022-05-20",
    purchaseCost: 80000000,
    currentValue: 65000000,
    status: "Active",
  },
  {
    id: "ASSET003",
    name: "Office Printer",
    purchaseDate: "2021-11-01",
    purchaseCost: 1200000,
    currentValue: 500000,
    status: "Under Maintenance",
  },
];

const mockDepreciationSchedule = [
  { date: "2023-01-31", amount: 125000, netBookValue: 4375000 },
  { date: "2023-02-28", amount: 125000, netBookValue: 4250000 },
  { date: "2023-03-31", amount: 125000, netBookValue: 4125000 },
];

const assetStatuses = [
  "Active",
  "Disposed",
  "Sold",
  "Written Off",
  "Under Maintenance",
];

export default function FixedAssets() {
  const { createAsset, postDepreciation, loading } = useAdvancedAccounting();
  const [assets, setAssets] = useState(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusChange = (assetId: string, newStatus: string) => {
    setAssets(
      assets.map((asset) =>
        asset.id === assetId ? { ...asset, status: newStatus } : asset
      )
    );
  };

  const handleAddNewAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assetData = {
      assetName: formData.get("name") as string,
      assetCode: `ASSET${String(assets.length + 1).padStart(3, "0")}`,
      purchaseDate: formData.get("purchaseDate") as string,
      purchaseValue: Number(formData.get("purchaseCost")),
      salvageValue: 0,
      usefulLifeMonths: 60,
      depreciationMethod: "straight_line",
    };

    try {
        const savedAsset = await createAsset(assetData);
        setAssets([...assets, {
            id: savedAsset.id,
            name: savedAsset.assetName,
            purchaseDate: savedAsset.purchaseDate,
            purchaseCost: savedAsset.purchaseValue,
            currentValue: savedAsset.bookValue,
            status: "Active",
        }]);
        toast({ title: "Asset Added", description: "The fixed asset has been registered." });
        setIsDialogOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Failed to add asset.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed Assets Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Assets Register</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Input placeholder="Filter by asset name..." />
            <Button>Filter</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add New Asset</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new fixed asset.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddNewAsset}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Office Desk"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchaseDate" className="text-right">
                        Purchase Date
                      </Label>
                      <Input
                        id="purchaseDate"
                        name="purchaseDate"
                        type="date"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchaseCost" className="text-right">
                        Purchase Cost (UGX)
                      </Label>
                      <Input
                        id="purchaseCost"
                        name="purchaseCost"
                        type="number"
                        placeholder="e.g. 500000"
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Asset</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Purchase Cost (UGX)</TableHead>
                <TableHead>Current Value (UGX)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.purchaseDate}</TableCell>
                  <TableCell>{asset.purchaseCost.toLocaleString()}</TableCell>
                  <TableCell>{asset.currentValue.toLocaleString()}</TableCell>
                  <TableCell>{asset.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {assetStatuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onSelect={() =>
                              handleStatusChange(asset.id, status)
                            }
                            disabled={asset.status === status}
                          >
                            Change Status to &quot;{status}&quot;
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">
            Depreciation Schedule Viewer (for ASSET001)
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Depreciation Amount (UGX)</TableHead>
                <TableHead>Net Book Value (UGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDepreciationSchedule.map((item) => (
                <TableRow key={item.date}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.amount.toLocaleString()}</TableCell>
                  <TableCell>{item.netBookValue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
