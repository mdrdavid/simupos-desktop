/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSupplier } from "@/context/SupplierContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

export default function BulkAddSuppliersPage() {
  const router = useRouter();
  const { bulkCreateSuppliers } = useSupplier();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{ success: any[], errors: any[] } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const suppliersData = results.data as any[];
        const response = await bulkCreateSuppliers(suppliersData);
        setResults(response);
        setIsSubmitting(false);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse CSV file.");
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Bulk Add Suppliers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Upload a CSV file with supplier data. The file should have the following headers: name, contactPerson, email, phone, address, city, country, category, paymentTerms, creditLimit.</p>
          <div className="flex gap-4">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              <Upload className="w-4 h-4 mr-2" />
              {isSubmitting ? "Uploading..." : "Upload and Process"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Successfully imported {results.success.length} suppliers.</p>
            {results.errors.length > 0 && (
              <div>
                <h3 className="font-bold mt-4">Errors ({results.errors.length}):</h3>
                <ul>
                  {results.errors.map((error, index) => (
                    <li key={index} className="text-red-500">Row {error.row}: {error.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
