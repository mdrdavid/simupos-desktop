/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useData, type Item, type StockMovement } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StockManagementPage() {
  const { getStockMovements, items, loading } = useData();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filters, setFilters] = useState<{
    dateRange: { from?: Date; to?: Date };
    movementType: string;
    itemId: string;
  }>({
    dateRange: { from: undefined, to: undefined },
    movementType: "all",
    itemId: "all",
  });
  const [sorting, setSorting] = useState({ key: "createdAt", order: "desc" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const result = await getStockMovements({
          itemId: filters.itemId !== "all" ? filters.itemId : undefined,
          movementType: filters.movementType !== "all" ? filters.movementType : undefined,
          startDate: filters.dateRange.from,
          endDate: filters.dateRange.to,
        });
        setMovements(result);
      } catch (error) {
        console.error("Failed to fetch stock movements", error);
      }
    };
    fetchMovements();
  }, [filters, getStockMovements]);

  const getSortValue = (movement: StockMovement, key: string) => {
    switch (key) {
      case "item.name":
        return movement.item?.name || "";
      case "createdAt":
        return new Date(movement.createdAt).getTime();
      default:
        return movement[key as keyof StockMovement] as any;
    }
  };

  const sortedMovements = useMemo(() => {
    return [...movements].sort((a, b) => {
      const aValue = getSortValue(a, sorting.key);
      const bValue = getSortValue(b, sorting.key);

      if (aValue < bValue) return sorting.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.order === "asc" ? 1 : -1;
      return 0;
    });
  }, [movements, sorting]);

  const paginatedMovements = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    return sortedMovements.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedMovements, pagination]);

  const pageCount = Math.ceil(movements.length / pagination.pageSize);

  const handleSort = (key: string) => {
    setSorting((prev) => ({
      key,
      order: prev.key === key && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const movementTypes = [
    "all",
    "in",
    "out",
    "adjustment",
    "initial",
    "production_input",
    "production_output",
  ];

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "in":
      case "initial":
      case "production_output":
        return <Badge variant="success">{type}</Badge>;
      case "out":
      case "production_input":
        return <Badge variant="destructive">{type}</Badge>;
      case "adjustment":
        return <Badge variant="secondary">{type}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Stock Movements
          </CardTitle>
        </CardHeader>
        {/* <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateRangePicker
            onUpdate={({ range }) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            initialDateFrom={filters.dateRange.from}
            initialDateTo={filters.dateRange.to}
            align="start"
            locale="en-GB"
            showCompare={false}
          />
          <Select
            value={filters.movementType}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, movementType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {movementTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.itemId}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, itemId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent> */}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movements Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("item.name")}>
                  <Button variant="ghost" size="sm">
                    Item
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead onClick={() => handleSort("type")}>
                  <Button variant="ghost" size="sm">
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead onClick={() => handleSort("quantityChange")}>
                  <Button variant="ghost" size="sm">
                    Change
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>New Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead onClick={() => handleSort("createdAt")}>
                  <Button variant="ghost" size="sm">
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedMovements.length > 0 ? (
                paginatedMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.item?.name || "N/A"}</TableCell>
                    <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                    <TableCell
                      className={
                        movement.quantityChange > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {movement.quantityChange > 0
                        ? `+${movement.quantityChange.toFixed(2)}`
                        : movement.quantityChange.toFixed(2)}
                    </TableCell>
                    <TableCell>{movement.newStock.toFixed(2)}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>
                      {new Date(movement.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No movements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

