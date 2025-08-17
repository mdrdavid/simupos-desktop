"use client";

import { useAgroProduct } from "@/context/AgroProductContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { capitalizeWords } from "@/src/utils";

export default function AgroInventoryPage() {
  const { agroProducts, loading, fetchProductsByBranch } = useAgroProduct();
  const { currentBranchId } = useAuth();
  const loadData = async () => {
    if (currentBranchId) {
      await fetchProductsByBranch(currentBranchId);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranchId]);
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold"> Inventory</h1>
        <Link href="/agro/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agroProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{capitalizeWords(product.name)}</CardTitle>
                {product.hasVariants && (
                  <span className="text-sm text-gray-500">
                    {product.variants?.length || 0} variants
                  </span>
                )}
              </CardHeader>
              <CardContent>
                {product.hasVariants ? (
                  <div className="space-y-2">
                    {product.variants?.map((variant) => (
                      <div key={variant.id} className="border p-3 rounded">
                        <h3 className="font-medium">{capitalizeWords(variant.name)}</h3>
                        <p>
                          Stock: {Math.floor(variant.totalStockQuantity)}{" "}
                          {variant.unitOfMeasure}
                        </p>

                        <Link
                          href={`/agro/${product.id}/variants/${variant.id}/stock`}
                        >
                          <Button size="sm" className="mt-2">
                            Manage Stock
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href={`/agro/${product.id}/variants/add`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Variant
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p>
                      Stock: {Math.floor(product.totalStockQuantity)}{" "}
                      {product.unitOfMeasure}
                    </p>
                    <Link href={`/agro/${product.id}/stock`}>
                      <Button size="sm" className="mt-2">
                        Manage Stock
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
