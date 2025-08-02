"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Store,
  User,
  Clock,
  Wifi,
  WifiOff,
  Eye,
  Phone,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";

export function Header() {
  const router = useRouter();
  const { user, businessData, logout } = useAuth();
  const { currentBranch } = useBranch();

  const handleLogout = () => {
    logout();
    router.push("/auth/login"); // Redirect to login page after logout
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left section - Back button and business info */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="font-medium text-sm truncate">
              {businessData?.name || "Business Name"} - {currentBranch?.name}
            </span>
          </div>
        </div>

        {/* Mobile-only support info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 sm:hidden">
          <Phone className="h-3 w-3" />
          <span>Support: 0702629361</span>
        </div>

        {/* Right section - User info and controls */}
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          {/* User and time info - hidden on smallest screens */}
          <div className="hidden xs:flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">
                {user?.firstName || "User"} {user?.lastName || ""}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={true ? "default" : "destructive"}
              className="text-xs hidden sm:flex"
            >
              {true ? (
                <Wifi className="h-3 w-3 mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">
                {true ? "Online" : "Offline"}
              </span>
            </Badge>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recent Sales</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No recent sales</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop support info - centered */}
        <div className="hidden sm:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-2 text-xs text-gray-500">
          <span>SimuPos Support: 0702629361</span>
        </div>
      </div>
    </header>
  );
}
