"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgroProduct } from "@/context/AgroProductContext";
import { Button } from "@/components/ui/button";
import { AgroProductVariant } from "@/src/types/agroProduct";
import { useToast } from "@/hooks/use-toast";

export default function VariantsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { fetchProductDetails } = useAgroProduct();
  const [variants, setVariants] = useState<AgroProductVariant[]>([]);
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const getProductDetails = async () => {
        try {
          const product = await fetchProductDetails(id as string);
          setProductName(product.name);
          setVariants(product.variants || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch product details.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      getProductDetails();
    }
  }, [id, fetchProductDetails, toast]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Variants for {productName}
        </h1>
        <Button onClick={() => router.push(`/agro/${id}/variants/add`)}>
          Add Variant
        </Button>
      </div>

      {isLoading ? (
        <p>Loading variants...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit of Measure</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variants.length > 0 ? (
                variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{variant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{variant.unitOfMeasure}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{variant.totalStockQuantity}</td>
                     <td className="px-6 py-4 whitespace-nowrap">{variant.currentAverageCostPrice}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No variants found for this product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
