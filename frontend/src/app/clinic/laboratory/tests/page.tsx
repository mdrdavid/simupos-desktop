"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  TestTube,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClinic } from "@/context/ClinicContext";

export default function LabTestsPage() {
  const router = useRouter();
  const { labTests, deleteLabTest } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = Array.from(new Set(labTests.map((test) => test.category)));

  const filteredTests = labTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || test.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Hematology: "bg-blue-100 text-blue-800 border-blue-200",
      "Clinical Chemistry": "bg-green-100 text-green-800 border-green-200",
      Serology: "bg-purple-100 text-purple-800 border-purple-200",
      Parasitology: "bg-orange-100 text-orange-800 border-orange-200",
      Microbiology: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Beaker className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Test Catalog
              </h1>
              <p className="text-gray-600 mt-1">
                Manage laboratory tests and pricing
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/clinic/laboratory/tests/new")}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Test
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tests by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-purple-500 rounded-xl bg-white/80 backdrop-blur-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Category
                {categoryFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-purple-100 text-purple-800"
                  >
                    {categoryFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() => setCategoryFilter("all")}
                className={`rounded-lg ${categoryFilter === "all" ? "bg-purple-50 text-purple-700" : ""}`}
              >
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`rounded-lg ${categoryFilter === category ? "bg-purple-50 text-purple-700" : ""}`}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card
                key={test.id}
                className="hover:shadow-xl transition-all duration-300 border border-gray-200/60 hover:border-purple-300 bg-white/80 backdrop-blur-sm overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <TestTube className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                          {test.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(test.category)}
                        >
                          {test.category}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-48"
                      >
                        <DropdownMenuItem className="rounded-lg cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Test
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-lg cursor-pointer text-red-600"
                          onClick={() => deleteLabTest(test.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Test
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Test Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Price</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(test.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {test.duration} mins
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Sample Type
                      </span>
                      <span className="font-medium text-gray-900">
                        {test.sampleType}
                      </span>
                    </div>

                    {test.description && (
                      <div className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg">
                        <p className="line-clamp-2">{test.description}</p>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-gray-600 font-medium">
                        Normal Range:{" "}
                      </span>
                      <span className="text-gray-900">{test.normalRange}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
                    <Badge
                      variant={test.isActive ? "default" : "secondary"}
                      className={
                        test.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {test.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 hover:bg-white border-gray-300 hover:border-purple-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                      onClick={() =>
                        router.push(`/clinic/laboratory/tests/${test.id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Beaker className="h-16 w-16 text-purple-500" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                No tests found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Get started by adding your first laboratory test to the catalog."}
              </p>
              <Button
                onClick={() => router.push("/clinic/laboratory/tests/new")}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 px-8 py-3 text-lg rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
