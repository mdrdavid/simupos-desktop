"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadQuoteButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DownloadQuoteButton({
  onClick,
  disabled,
}: DownloadQuoteButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled}>
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
}
