import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Apple, Play } from "lucide-react";

export function DownloadButton() {
  return (
    <div className="flex gap-4">
      <Button className="bg-[#41A5A5] hover:bg-[#2E8B8B] text-white gap-2">
        <Play className="h-5 w-5" />
        Get on Play Store
      </Button>
    </div>
  );
}
