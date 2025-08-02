"use client";

import { useAgroProduct } from "@/context/AgroProductContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function AgroInventoryPage() {
  const { agroProducts, loading, fetchProductsByBranch } = useAgroProduct();
  console.log("Agro Products:", agroProducts);

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
        <h1 className="text-2xl font-bold">Agricultural Inventory</h1>
        <Link href="/dashboard/agro/add">
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
                <CardTitle>{product.name}</CardTitle>
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
                        <h3 className="font-medium">{variant.name}</h3>
                        <p>
                          Stock: {variant.totalStockQuantity}{" "}
                          {variant.unitOfMeasure}
                        </p>
                        <Link
                          href={`/dashboard/agro/${product.id}/variants/${variant.id}/stock`}
                        >
                          <Button size="sm" className="mt-2">
                            Manage Stock
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href={`/dashboard/agro/${product.id}/variants/add`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Variant
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p>
                      Stock: {product.totalStockQuantity}{" "}
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
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Plus,
//   ShoppingCart,
//   Loader2,
//   AlertTriangle,
//   RefreshCw,
//   PackageSearch,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
// import { useAgroProduct } from "@/context/AgroProductContext";
// import { useAuth } from "@/context/AuthContext";
// import { AgroProduct } from "@/src/types/agroProduct";

// export default function AgroInventoryPage() {
//   const router = useRouter();
//   const { toast } = useToast();
// const {
//   agroProducts,
//   loading,
//   error,
//   fetchProductsByBranch,
//   addStockShipment,
// } = useAgroProduct();
// const { currentBranchId } = useAuth();

//   const [selectedProduct, setSelectedProduct] = useState<AgroProduct | null>(
//     null
//   );
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoadingShipment, setIsLoadingShipment] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");

//   // Stock shipment form state
//   const [costPrice, setCostPrice] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [currency, setCurrency] = useState("UGX");
//   const [receivedDate, setReceivedDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [supplierInfo, setSupplierInfo] = useState("");

// const loadData = async () => {
//   if (currentBranchId) {
//     await fetchProductsByBranch(currentBranchId);
//   }
// };

// useEffect(() => {
//   loadData();
// }, [currentBranchId]);

//   const openAddStockModal = (product: AgroProduct) => {
//     setSelectedProduct(product);
//     setCostPrice(product.currentAverageCostPrice.toString());
//     setQuantity("");
//     setCurrency(product.baseCurrency);
//     setReceivedDate(new Date().toISOString().split("T")[0]);
//     setSupplierInfo(product.stockShipments[0]?.supplierInfo || "");
//     setIsModalOpen(true);
//   };

//   const handleAddStockShipment = async () => {
//     if (!selectedProduct || !currentBranchId) return;

//     const parsedCostPrice = Number.parseFloat(costPrice.replace(/,/g, ""));
//     const parsedQuantity = Number.parseInt(quantity.replace(/,/g, ""), 10);

//     if (isNaN(parsedCostPrice) || parsedCostPrice <= 0) {
//       toast({
//         title: "Invalid Cost Price",
//         description: "Please enter a valid positive number for cost price",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       toast({
//         title: "Invalid Quantity",
//         description: "Please enter a valid positive whole number for quantity",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoadingShipment(true);

//     try {
//       const shipmentData = {
//         costPrice: parsedCostPrice,
//         quantity: parsedQuantity,
//         currency: currency.trim() || "UGX",
//         receivedDate: new Date(receivedDate).toISOString(),
//         supplierInfo: supplierInfo.trim() || undefined,
//       };

//       await addStockShipment(selectedProduct.id, shipmentData, currentBranchId);

//       toast({
//         title: "Stock Updated",
//         description: `${parsedQuantity.toLocaleString()} ${selectedProduct.unitOfMeasure} of ${selectedProduct.name} added successfully`,
//       });

//       setIsModalOpen(false);
//     } catch (error) {
//       toast({
//         title: "Operation Failed",
//         description: "Could not process stock addition. Please try again.",
//         variant: "destructive",
//       });
//       console.error("Error adding stock shipment:", error);
//     } finally {
//       setIsLoadingShipment(false);
//     }
//   };

//   const getStockStatus = (product: AgroProduct) => {
//     if (product.totalStockQuantity === 0) {
//       return {
//         status: "out",
//         color: "bg-red-500",
//         text: "Out of Stock",
//         progress: 0,
//       };
//     }
//     if (!product.minStockLevel) {
//       return {
//         status: "good",
//         color: "bg-green-500",
//         text: "In Stock",
//         progress: 100,
//       };
//     }

//     const stockPercentage =
//       (product.totalStockQuantity / product.minStockLevel) * 100;
//     if (product.totalStockQuantity <= product.minStockLevel * 0.3) {
//       return {
//         status: "critical",
//         color: "bg-red-500",
//         text: "Critical Stock",
//         progress: stockPercentage,
//       };
//     }
//     if (product.totalStockQuantity <= product.minStockLevel) {
//       return {
//         status: "low",
//         color: "bg-yellow-500",
//         text: "Low Stock",
//         progress: stockPercentage,
//       };
//     }
//     return {
//       status: "good",
//       color: "bg-green-500",
//       text: "In Stock",
//       progress: Math.min(stockPercentage, 100),
//     };
//   };

//   // Filter products based on search and category
//   const filteredProducts = agroProducts.filter((product) => {
//     const matchesSearch =
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory =
//       selectedCategory === "all" || product.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   // Get unique categories for filter
//   const categories = [
//     "all",
//     ...Array.from(
//       new Set(agroProducts.map((p) => p.category).filter(Boolean) as string[])
//     ),
//   ];

//   if (loading && agroProducts.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
//         <InventoryHeader
//           router={router}
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           categories={categories}
//           loading={true}
//         />

//         <div className="max-w-7xl mx-auto p-4 md:p-6">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="text-center space-y-4">
//               <Loader2 className="h-10 w-10 animate-spin mx-auto text-teal-600" />
//               <h3 className="text-lg font-medium text-gray-700">
//                 Loading Inventory...
//               </h3>
//               <p className="text-sm text-gray-500">
//                 Gathering your agricultural products data
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
//         <InventoryHeader
//           router={router}
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           categories={categories}
//           loading={false}
//         />

//         <div className="max-w-7xl mx-auto p-4 md:p-6">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="text-center space-y-4 max-w-md">
//               <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
//               <h3 className="text-lg font-medium text-gray-800">
//                 Unable to Load Inventory
//               </h3>
//               <p className="text-gray-600">{error}</p>
//               <div className="pt-4">
//                 <Button onClick={loadData} disabled={loading} className="gap-2">
//                   {loading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Retrying...
//                     </>
//                   ) : (
//                     <>
//                       <RefreshCw className="h-4 w-4" />
//                       Try Again
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
//       <InventoryHeader
//         router={router}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         selectedCategory={selectedCategory}
//         setSelectedCategory={setSelectedCategory}
//         categories={categories}
//         loading={loading}
//       />

//       <div className="max-w-7xl mx-auto p-4 md:p-6">
//         {filteredProducts.length === 0 ? (
//           <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
//             <PackageSearch className="h-16 w-16 text-gray-400" />
//             <div className="space-y-2">
//               <h3 className="text-xl font-medium text-gray-800">
//                 {loading ? "Loading..." : "No matching products found"}
//               </h3>
//               <p className="text-gray-600 max-w-md">
//                 {searchTerm || selectedCategory !== "all"
//                   ? "Try adjusting your search or filter criteria"
//                   : "Your inventory is empty. Add your first agricultural product to get started"}
//               </p>
//             </div>
//             <Button
//               onClick={() => router.push("/agro/add")}
//               className="bg-teal-600 hover:bg-teal-700 gap-2"
//             >
//               <Plus className="h-4 w-4" />
//               Add New Product
//             </Button>
//           </div>
//         ) : (
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {filteredProducts.map((product) => {
//               const stockStatus = getStockStatus(product);

//               return (
//                 <Card
//                   key={product.id}
//                   className="hover:shadow-lg transition-shadow"
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="space-y-1.5">
//                         <CardTitle className="text-gray-800 text-lg flex items-center gap-2">
//                           {product.name}
//                           {product.productCode && (
//                             <Badge
//                               variant="outline"
//                               className="text-xs font-mono"
//                             >
//                               {product.productCode}
//                             </Badge>
//                           )}
//                         </CardTitle>
//                         {product.category && (
//                           <Badge
//                             variant="secondary"
//                             className="text-teal-800 bg-teal-100"
//                           >
//                             {product.category}
//                           </Badge>
//                         )}
//                       </div>
//                       <Badge className={`${stockStatus.color} text-white`}>
//                         {stockStatus.text}
//                       </Badge>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div className="space-y-1">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Current Stock:</span>
//                         <span className="font-medium">
//                           {product.totalStockQuantity.toLocaleString()}{" "}
//                           {product.unitOfMeasure}
//                         </span>
//                       </div>
//                       {product.minStockLevel && (
//                         <Progress
//                           value={stockStatus.progress}
//                           className="h-2"
//                           indicatorClassName={
//                             stockStatus.status === "critical"
//                               ? "bg-red-500"
//                               : stockStatus.status === "low"
//                                 ? "bg-yellow-500"
//                                 : "bg-green-500"
//                           }
//                         />
//                       )}
//                     </div>
//                   </CardContent>
//                   <CardFooter>
//                     <Button
//                       onClick={() => openAddStockModal(product)}
//                       className="w-full bg-teal-600 hover:bg-teal-700 gap-2"
//                     >
//                       <Plus className="h-4 w-4" />
//                       Add Stock
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Add Stock Shipment Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle className="text-teal-800">
//               Add Stock to {selectedProduct?.name}
//             </DialogTitle>
//             <DialogDescription>
//               Record new inventory for this agricultural product
//             </DialogDescription>
//           </DialogHeader>

//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="quantity">Quantity *</Label>
//                 <Input
//                   id="quantity"
//                   type="number"
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value)}
//                   placeholder="e.g., 50"
//                   required
//                 />
//                 <p className="text-xs text-gray-500">
//                   In {selectedProduct?.unitOfMeasure}
//                 </p>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="costPrice">Unit Cost *</Label>
//                 <Input
//                   id="costPrice"
//                   type="number"
//                   step="0.01"
//                   value={costPrice}
//                   onChange={(e) => setCostPrice(e.target.value)}
//                   placeholder="e.g., 1200"
//                   required
//                 />
//                 <p className="text-xs text-gray-500">
//                   Per {selectedProduct?.unitOfMeasure}
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="currency">Currency *</Label>
//                 <Select value={currency} onValueChange={setCurrency}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select currency" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="UGX">UGX (Ugandan Shilling)</SelectItem>
//                     <SelectItem value="USD">USD (US Dollar)</SelectItem>
//                     <SelectItem value="EUR">EUR (Euro)</SelectItem>
//                     <SelectItem value="GBP">GBP (British Pound)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="receivedDate">Received Date *</Label>
//                 <Input
//                   id="receivedDate"
//                   type="date"
//                   value={receivedDate}
//                   onChange={(e) => setReceivedDate(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="supplierInfo">Supplier Information</Label>
//               <Input
//                 id="supplierInfo"
//                 value={supplierInfo}
//                 onChange={(e) => setSupplierInfo(e.target.value)}
//                 placeholder="Name, contact, or other details"
//               />
//             </div>

//             {selectedProduct && quantity && costPrice && (
//               <div className="p-3 bg-teal-50 rounded-md border border-teal-100">
//                 <p className="text-sm text-teal-800 font-medium">
//                   After this shipment:
//                 </p>
//                 <ul className="list-disc pl-5 text-sm text-teal-700 space-y-1 mt-1">
//                   <li>
//                     Total stock:{" "}
//                     {(
//                       selectedProduct.totalStockQuantity +
//                       (Number(quantity) || 0)
//                     ).toLocaleString()}{" "}
//                     {selectedProduct.unitOfMeasure}
//                   </li>
//                   <li>
//                     New average cost:{" "}
//                     {(
//                       (selectedProduct.currentAverageCostPrice *
//                         selectedProduct.totalStockQuantity +
//                         Number(costPrice) * (Number(quantity) || 0)) /
//                       (selectedProduct.totalStockQuantity +
//                         (Number(quantity) || 0))
//                     ).toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}{" "}
//                     {selectedProduct.baseCurrency}
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3">
//             <Button
//               variant="outline"
//               onClick={() => setIsModalOpen(false)}
//               disabled={isLoadingShipment}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleAddStockShipment}
//               className="bg-teal-600 hover:bg-teal-700 gap-2"
//               disabled={isLoadingShipment}
//             >
//               {isLoadingShipment ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 "Record Shipment"
//               )}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // Extracted header component
// function InventoryHeader({
//   router,
//   searchTerm,
//   setSearchTerm,
//   selectedCategory,
//   setSelectedCategory,
//   categories,
//   loading,
// }: {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   router: any;
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   selectedCategory: string;
//   setSelectedCategory: (category: string) => void;
//   categories: string[];
//   loading: boolean;
// }) {
//   return (
//     <header className="bg-teal-600 text-white p-4 sticky top-0 z-10 shadow-md">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => router.back()}
//               className="text-white hover:bg-teal-700"
//               aria-label="Go back"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//             <h1 className="text-xl font-semibold">Agricultural Inventory</h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => router.push("/agro/sales/new")}
//               className="text-white hover:bg-teal-700"
//               aria-label="New sale"
//             >
//               <ShoppingCart className="h-5 w-5" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => router.push("/agro/add")}
//               className="text-white hover:bg-teal-700"
//               aria-label="Add product"
//             >
//               <Plus className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>

//         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//           <Input
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="bg-white/90 text-gray-800 placeholder-gray-500"
//             disabled={loading}
//           />

//           <Select
//             value={selectedCategory}
//             onValueChange={setSelectedCategory}
//             disabled={loading}
//           >
//             <SelectTrigger className="bg-white/90 text-gray-800">
//               <SelectValue placeholder="Filter by category" />
//             </SelectTrigger>
//             <SelectContent>
//               {categories.map((category) => (
//                 <SelectItem
//                   key={category}
//                   value={category}
//                   className="capitalize"
//                 >
//                   {category === "all" ? "All Categories" : category}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </header>
//   );
// }
