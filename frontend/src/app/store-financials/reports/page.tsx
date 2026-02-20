/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cab-store/reports/page.tsx
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CabStoreReports() {
  const { generateYearlyReport, generatingReport } = useCabStore();
  const { currentBranchId } = useAuth();
  const { toast } = useToast();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleGenerateReport = async () => {
    if (!currentBranchId) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloadStatus("idle");

      const blob = await generateYearlyReport(currentBranchId, selectedYear);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `cab-store-report-${selectedYear}.xlsx`;

      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus("success");

      toast({
        title: "Report Generated",
        description: `Yearly report for ${selectedYear} downloaded successfully`,
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      setDownloadStatus("error");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <FileSpreadsheet className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CAB Store Reports
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Generate comprehensive Excel reports with monthly transaction
            breakdowns and annual summaries.
          </p>
        </div>

        {/* Report Generator Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Annual Excel Report</span>
            </CardTitle>
            <CardDescription>
              Download a complete yearly report with separate sheets for each
              month and a summary overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Year Selection */}
            <div className="space-y-3">
              <Label htmlFor="year" className="font-medium text-gray-700">
                Select Year
              </Label>
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-300 rounded-xl bg-white px-4"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Report Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border-2 border-blue-200">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Report Includes:</span>
                </h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• 12 monthly transaction sheets</li>
                  <li>• Annual summary overview</li>
                  <li>• Running balance calculations</li>
                  <li>• Monthly and yearly totals</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Sheet Details:</span>
                </h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Date-wise transactions</li>
                  <li>• Deposit/withdrawal breakdown</li>
                  <li>• Category-wise grouping</li>
                  <li>• Opening/closing balances</li>
                </ul>
              </div>
            </div>

            {/* Download Status */}
            {downloadStatus === "success" && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">
                    Report downloaded successfully!
                  </span>
                </div>
              </div>
            )}

            {downloadStatus === "error" && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Failed to generate report. Please try again.
                  </span>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport || !currentBranchId}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl disabled:opacity-50"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Excel Report ({selectedYear})
                </>
              )}
            </Button>

            {!currentBranchId && (
              <div className="text-center">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  Please select a branch to generate reports
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Monthly Sheets Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Monthly Sheets</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                12 separate sheets, one for each month, with detailed
                transaction listings and running balances.
              </p>
              <div className="flex flex-wrap gap-1">
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((month) => (
                  <Badge
                    key={month}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                  >
                    {month}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Sheet Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Annual Summary</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive overview with monthly totals, net changes, and
                opening/closing balances.
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Monthly Totals</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    ✓
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Net Changes</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    ✓
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Balance Tracking</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    ✓
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Analysis Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">
                  Ready to Analyze
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Download and use Excel&apos;s powerful analysis tools for deeper
                insights into your store&apos;s financial performance.
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Excel formulas enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Charts and pivot tables ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Professional formatting</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Tips */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Report Usage Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">For Analysis:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use Excel&apos;s filter and sort features</li>
                  <li>Create pivot tables for category analysis</li>
                  <li>Build charts for visual trends</li>
                  <li>Use conditional formatting for insights</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">For Reporting:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Share specific monthly sheets</li>
                  <li>Use summary sheet for presentations</li>
                  <li>Export to PDF for distribution</li>
                  <li>Compare year-over-year performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
