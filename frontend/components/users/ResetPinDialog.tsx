"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, UserProfile } from "@/context/UserContext";
import { toast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface ResetPinDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPinDialog({
  user,
  open,
  onOpenChange,
}: ResetPinDialogProps) {
  const { resetUserPIN, loading } = useUser();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleReset = async () => {
    if (!user) return;

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetUserPIN(user.id, pin);
      setPin("");
      setConfirmPin("");
      onOpenChange(false);
    } catch {
      // Error handled in context
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Reset PIN
          </DialogTitle>
          <DialogDescription>
            Enter a new 4-digit PIN for {user?.firstName} {user?.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN (4 digits)</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              className="text-center text-2xl tracking-[1em]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              className="text-center text-2xl tracking-[1em]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={loading || pin.length !== 4 || pin !== confirmPin}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? "Resetting..." : "Reset PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
