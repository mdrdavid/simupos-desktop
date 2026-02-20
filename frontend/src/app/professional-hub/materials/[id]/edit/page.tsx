"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWelding } from "@/context/WeldingContext";
import { MaterialStockForm } from "@/components/welding/MaterialStockForm";
import { WeldingMaterialStock } from "@/src/types/weldingMaterial";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { getMaterialStockItemById, updateMaterialStockItem } = useWelding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<WeldingMaterialStock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const item = getMaterialStockItemById(id as string);
      if (item) {
        setInitialData(item);
      }
      setLoading(false);
    }
  }, [id, getMaterialStockItemById]);

  const handleSubmit = async (values: {
    name: string;
    unit: string;
    quantityInStock: number;
    lowStockThreshold?: number;
    supplierInfo?: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    await updateMaterialStockItem(id as string, values);
    setIsSubmitting(false);
    toast({
      title: "Success",
      description: "Material details updated.",
    });
    router.push("/professional-hub/materials");
  };

  if (loading) {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  if (!initialData) {
    return (
        <div className="container mx-auto p-6 text-center">
            <p>Material not found.</p>
            <Link href="/professional-hub/materials" className="mt-4 inline-block">
                <Button>Back to Materials</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/professional-hub/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Stock Material</h1>
      </div>
      <MaterialStockForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
