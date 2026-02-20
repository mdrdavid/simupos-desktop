/* eslint-disable @typescript-eslint/no-unused-vars */
// components/StatusUpdate.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { WashOrderStatus } from "@/src/types/washingBay";

interface StatusUpdateProps {
  currentStatus: WashOrderStatus;
  onStatusUpdate: (status: WashOrderStatus) => void;
  orderId: string;
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export function StatusUpdate({
  currentStatus,
  onStatusUpdate,
  orderId,
}: StatusUpdateProps) {
  const currentStatusOption = statusOptions.find(
    (opt) => opt.value === currentStatus
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>Status: {currentStatusOption?.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusUpdate(option.value as WashOrderStatus)}
            disabled={option.value === currentStatus}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
