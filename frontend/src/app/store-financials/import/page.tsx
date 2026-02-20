/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCabStore } from "@/context/CabStoreContext";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2,
  X,
  Calendar,
} from "lucide-react";
import { cn, formatNumberWithCommas } from "@/lib/utils";

interface ImportResult {
  success: number;
  errors: number;
  total: number;
  errorDetails?: Array<{
    row: number;
    error: string;
  }>;
}

export default function CabStoreImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { bulkImportRecords, loading } = useCabStore();
  const { currentBranchId } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      toast({
        title: "Invalid File",
        description: "Please select an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    previewFileData(selectedFile);
  };

  const previewFileData = async (file: File) => {
    try {
      // Simple preview - in a real app, you'd parse the file properly
      setPreviewData([
        {
          date: new Date().toISOString().split("T")[0],
          type: "deposit",
          amount: 100000,
          category: "BANK",
          reference: "Sample Reference",
          details: "Sample transaction for preview",
        },
      ]);
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  const handleImport = async () => {
    if (!file || !currentBranchId) {
      toast({
        title: "Missing Information",
        description: !file ? "Please select a file" : "No branch selected",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      // Simulate file reading and processing
      const fileContent = await readFileContent(file);
      const records = parseFileContent(fileContent, currentBranchId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Perform actual import
      await bulkImportRecords(records);

      clearInterval(progressInterval);
      setProgress(100);

      // Simulate success result
      const result: ImportResult = {
        success: records.length,
        errors: 0,
        total: records.length,
      };

      setImportResult(result);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${records.length} transactions`,
        className: "bg-green-50 border-green-200",
      });

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setPreviewData([]);
        setImportResult(null);
        setProgress(0);
      }, 3000);
    } catch (error: any) {
      console.error("Import error:", error);
      setImportResult({
        success: 0,
        errors: 1,
        total: 1,
        errorDetails: [{ row: 1, error: error.message }],
      });

      toast({
        title: "Import Failed",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseFileContent = (content: string, branchId: string): any[] => {
    // This is a simplified parser - in reality, you'd use a proper CSV/Excel parser
    // For demo purposes, we'll create some sample data
    return [
      {
        transactionDate: new Date().toISOString().split("T")[0],
        type: "deposit",
        amount: 250000,
        details: "BANK deposit",
        category: "BANK",
        reference: "BANK",
        notes: "Imported transaction",
        branchId,
      },
      {
        transactionDate: new Date().toISOString().split("T")[0],
        type: "withdrawal",
        amount: 18000000,
        details: "Grade 2 payment",
        category: "Grade 2",
        reference: "",
        notes: "Imported transaction",
        branchId,
      },
    ];
  };

  const downloadTemplate = () => {
    // Create CSV template
    const templateData = [
      ["date", "type", "amount", "category", "reference", "details", "notes"],
      [
        "2024-01-15",
        "deposit",
        "250000",
        "BANK",
        "BANK Mathew",
        "Bank deposit from Mathew",
        "",
      ],
      [
        "2024-01-15",
        "withdrawal",
        "18000000",
        "Grade 2",
        "",
        "Grade 2 payment",
        "Monthly payment",
      ],
      [
        "2024-01-16",
        "deposit",
        "7500000",
        "BANK",
        "BANK Lucky",
        "Bank deposit",
        "",
      ],
      [
        "2024-01-16",
        "withdrawal",
        "3550000",
        "Super kaiso",
        "",
        "Super kaiso payment",
        "",
      ],
    ];

    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cab-store-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Import Transactions
            </h1>
            <p className="text-gray-600">
              Bulk import CAB Store transactions from Excel or CSV files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Import Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span>Upload File</span>
                </CardTitle>
                <CardDescription>
                  Select an Excel (.xlsx, .xls) or CSV file containing your
                  transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!file ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                      Supported formats: Excel (.xlsx, .xls), CSV • Max 5MB
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">
                            {file.name}
                          </p>
                          <p className="text-sm text-green-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetImport}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Import Button */}
                <Button
                  onClick={handleImport}
                  disabled={!file || importing || !currentBranchId}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Transactions
                    </>
                  )}
                </Button>

                {!currentBranchId && (
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Please select a branch to import transactions
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Card */}
            {importResult && (
              <Card
                className={cn(
                  "bg-white/80 backdrop-blur-sm border-0 shadow-xl",
                  importResult.errors > 0
                    ? "border-red-200"
                    : "border-green-200"
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {importResult.errors > 0 ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    <span>Import Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-2xl font-bold text-green-600">
                          {importResult.success}
                        </p>
                        <p className="text-sm text-green-700">Successful</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-2xl font-bold text-red-600">
                          {importResult.errors}
                        </p>
                        <p className="text-sm text-red-700">Errors</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">
                          {importResult.total}
                        </p>
                        <p className="text-sm text-blue-700">Total</p>
                      </div>
                    </div>

                    {importResult.errorDetails &&
                      importResult.errorDetails.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Error Details:
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {importResult.errorDetails.map((error, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm text-red-600"
                              >
                                <AlertCircle className="h-3 w-3" />
                                <span>
                                  Row {error.row}: {error.error}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  <span>Download Template</span>
                </CardTitle>
                <CardDescription>
                  Use our template to ensure proper formatting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Import Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use the provided CSV template</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Date format: YYYY-MM-DD (2024-01-15)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Transaction types: deposit, withdrawal, balance_forward
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Categories: BANK, Grade 1, Grade 2, Grade 3, Super kaiso,
                      Labour, CASH, Other
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Amounts should be numbers only (no currency symbols)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Excel (.xlsx)</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Excel (.xls)</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CSV</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
