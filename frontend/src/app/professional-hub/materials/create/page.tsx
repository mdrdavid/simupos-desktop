"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWelding } from "@/context/WeldingContext";
import { BulkMaterialStockForm } from "@/components/welding/BulkMaterialStockForm";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateMaterialPage() {
  const router = useRouter();
  const { addMaterialStockItem } = useWelding();
  const { currentBranchId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    materials: {
      name: string;
      unit: string;
      quantityInStock: number;
      lowStockThreshold?: number;
      supplierInfo?: string;
      notes?: string;
    }[];
  }) => {
    if (!currentBranchId) {
      toast({
        title: "Error",
        description: "No branch selected.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    for (const material of values.materials) {
      const result = await addMaterialStockItem({
        ...material,
        branchId: currentBranchId,
      });
      if (result) {
        successCount++;
      }
    }
    setIsSubmitting(false);

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} of ${values.materials.length} materials added successfully.`,
      });
      router.push("/professional-hub/materials");
    } else {
      toast({
        title: "Error",
        description: "No materials were added. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/professional-hub/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Stock Materials</h1>
      </div>
      <BulkMaterialStockForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
