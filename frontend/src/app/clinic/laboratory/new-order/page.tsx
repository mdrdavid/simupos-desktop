/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  User,
  TestTube,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClinic } from "@/context/ClinicContext";

export default function NewLabOrderPage() {
  const router = useRouter();
  const { patients, labTests, addLabOrder } = useClinic();

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [referringDoctor, setReferringDoctor] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredTests = labTests.filter(
    (test) =>
      test.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      test.category.toLowerCase().includes(testSearch.toLowerCase())
  );

  const addTestToOrder = (test: any) => {
    if (!selectedTests.find((t) => t.test.id === test.id)) {
      setSelectedTests((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          test,
          priority: "routine",
          notes: "",
        },
      ]);
    }
  };

  const removeTestFromOrder = (testId: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== testId));
  };

  const updateTestPriority = (testId: string, priority: string) => {
    setSelectedTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, priority } : t))
    );
  };

  const updateTestNotes = (testId: string, notes: string) => {
    setSelectedTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, notes } : t))
    );
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, test) => total + test.test.price, 0);
  };

  const handleCreateOrder = () => {
    if (!selectedPatient || selectedTests.length === 0) {
      alert("Please select a patient and at least one test");
      return;
    }

    const newOrder = {
      patient: selectedPatient,
      tests: selectedTests,
      status: "pending" as const,
      referringDoctor: referringDoctor || undefined,
      clinicalNotes: clinicalNotes || undefined,
      orderDate: new Date(),
      totalAmount: calculateTotal(),
      paymentStatus: "pending" as const,
    };

    addLabOrder(newOrder);
    router.push("/clinic/laboratory");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              New Lab Order
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new laboratory test order
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Patient Selection and Tests */}
          <div className="space-y-6">
            {/* Patient Selection */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Select Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedPatient ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients by name or ID..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {patient.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                ID: {patient.patientId} • {patient.age}y •{" "}
                                {patient.gender}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            Select
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {selectedPatient.name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {selectedPatient.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ID: {selectedPatient.patientId} •{" "}
                            {selectedPatient.age}y • {selectedPatient.gender}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(null)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tests Selection */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-purple-500" />
                  Select Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tests by name or category..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-purple-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200"
                      onClick={() => addTestToOrder(test)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">
                            {test.name}
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(test.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{test.category}</span>
                          <span>•</span>
                          <span>{test.sampleType}</span>
                          <span>•</span>
                          <span>{test.duration} mins</span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 ml-3"
                      >
                        Add
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referring Doctor
                  </label>
                  <Input
                    placeholder="Dr. Name"
                    value={referringDoctor}
                    onChange={(e) => setReferringDoctor(e.target.value)}
                    className="border-gray-300 focus:border-green-500 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    placeholder="Enter clinical notes or specific instructions..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Tests */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-orange-500" />
                  Selected Tests ({selectedTests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTests.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTests.map((testItem) => (
                      <div
                        key={testItem.id}
                        className="p-4 border border-gray-200 rounded-xl bg-white/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {testItem.test.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {testItem.test.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={testItem.priority}
                              onChange={(e) =>
                                updateTestPriority(testItem.id, e.target.value)
                              }
                              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:border-orange-500"
                            >
                              <option value="routine">Routine</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestFromOrder(testItem.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {testItem.test.sampleType} •{" "}
                            {testItem.test.duration} mins
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(testItem.test.price)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Input
                            placeholder="Add notes for this test..."
                            value={testItem.notes}
                            onChange={(e) =>
                              updateTestNotes(testItem.id, e.target.value)
                            }
                            className="border-gray-300 focus:border-orange-500 rounded-xl text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No tests selected</p>
                    <p className="text-sm">Select tests from the left panel</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/20 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tests</span>
                    <span className="text-gray-900">
                      {selectedTests.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateOrder}
                  disabled={!selectedPatient || selectedTests.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg rounded-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Lab Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
