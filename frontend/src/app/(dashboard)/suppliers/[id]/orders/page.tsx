"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupplier } from "@/context/SupplierContext";
import { Supplier, SupplierOrder } from "@/src/types/supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupplierOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { getSupplierById, getSupplierOrders, deleteOrder, updateOrderStatus, completeOrder } = useSupplier();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [newStatus, setNewStatus] = useState<"pending" | "completed" | "cancelled">("pending");

  const supplierId = params.id as string;

  useEffect(() => {
    if (supplierId) {
      const fetchSupplierDetails = async () => {
        setLoading(true);
        const [supplierData, ordersData] = await Promise.all([
          getSupplierById(supplierId),
          getSupplierOrders(supplierId),
        ]);
        setSupplier(supplierData);
        setOrders(ordersData);
        setLoading(false);
      };
      fetchSupplierDetails();
    }
  }, [supplierId, getSupplierById, getSupplierOrders]);

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(orderId);
      setOrders(orders.filter((order) => order.id !== orderId));
    }
  };

  const handleOpenUpdateStatusDialog = (order: SupplierOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (selectedOrder) {
      if (newStatus === 'completed') {
        await completeOrder(selectedOrder.id);
      } else {
        await updateOrderStatus(selectedOrder.id, newStatus);
      }
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus } : order
        )
      );
      setIsUpdateStatusDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Supplier
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders for {supplier.name}</h1>
        <Link href={`/suppliers/orders/add?supplierId=${supplierId}`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Order {order.orderNumber}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenUpdateStatusDialog(order)}>
                    Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/suppliers/orders/${order.id}/edit`}>
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              <p>Amount: {order.totalAmount}</p>
              <p>Status: {order.status}</p>
              <p>Payment Status: {order.paymentStatus}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new status for order {selectedOrder?.orderNumber}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={newStatus} onValueChange={(value: "pending" | "completed" | "cancelled") => setNewStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateOrderStatus}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
