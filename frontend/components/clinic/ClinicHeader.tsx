"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Store,
  User,
  Clock,
  Wifi,
  WifiOff,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClinicHeaderProps {
  businessName?: string;
  branchName?: string;
  userName?: string;
  isOnline?: boolean;
  supportPhone?: string;
}

export function ClinicHeader({
  businessName = "Clinic Name",
  branchName = "Branch",
  userName = "User",
  isOnline = true,
  supportPhone = "0702629361",
}: ClinicHeaderProps) {
  const router = useRouter();
  const [firstName, lastName] = userName.split(" ");

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {businessName} - {branchName}
              </span>
            </div>
          </div>
        </div>

        {/* Centered Support Info */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Clinic Support: {supportPhone}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User and Time Info */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>
              {firstName} {lastName}
            </span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>

          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="text-xs"
          >
            {isOnline ? (
              <Wifi className="h-3 w-3 mr-1" />
            ) : (
              <WifiOff className="h-3 w-3 mr-1" />
            )}
            {isOnline ? "Online" : "Offline"}
          </Badge>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recent Visits</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">No recent visits</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
