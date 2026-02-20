/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClinic } from "@/context/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Plus,
  Search,
  User,
  Stethoscope,
  Pill,
  Trash2,
  Receipt,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Package,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  Patient,
  Service,
  Medicine,
  Visit,
  VisitService,
  VisitMedicine,
} from "@/src/types/clinic";
import { Switch } from "@/components/ui/switch";

export default function NewVisitPage() {
  const router = useRouter();
  const {
    patients,
    services,
    medicines,
    staff,
    addVisit,
    settings,
    searchPatients,
  } = useClinic();
  const { toast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visitServices, setVisitServices] = useState<VisitService[]>([]);
  const [visitMedicines, setVisitMedicines] = useState<VisitMedicine[]>([]);
  const [attendingStaff, setAttendingStaff] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<Visit["paymentMethod"]>("Cash");

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [includeTax, setIncludeTax] = useState(true);
  // Calculate totals
  const calculateTotals = () => {
    // Ensure all values are numbers
    const servicesTotal = visitServices.reduce((sum, vs) => {
      const price =
        typeof vs.totalPrice === "string"
          ? parseFloat(vs.totalPrice) || 0
          : vs.totalPrice || 0;
      return sum + price;
    }, 0);

    const medicinesTotal = visitMedicines.reduce((sum, vm) => {
      const price =
        typeof vm.totalPrice === "string"
          ? parseFloat(vm.totalPrice) || 0
          : vm.totalPrice || 0;
      return sum + price;
    }, 0);

    const subtotalValue = servicesTotal + medicinesTotal;
    const taxValue = includeTax
      ? subtotalValue * ((settings.taxRate || 0) / 100)
      : 0;
    const totalValue = subtotalValue + taxValue;

    // Format to 2 decimal places without using toFixed on potential strings
    const formatCurrencyValue = (value: number) => {
      return Math.round(value * 100) / 100;
    };

    return {
      subtotal: formatCurrencyValue(subtotalValue),
      tax: formatCurrencyValue(taxValue),
      total: formatCurrencyValue(totalValue),
    };
  };

  const { subtotal, tax, total } = calculateTotals();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddService = (service: Service) => {
    const existingService = visitServices.find(
      (vs) => vs.service.id === service.id
    );

    if (existingService) {
      setVisitServices((prev) =>
        prev.map((vs) =>
          vs.service.id === service.id
            ? {
                ...vs,
                quantity: vs.quantity + 1,
                totalPrice: (vs.quantity + 1) * vs.unitPrice,
              }
            : vs
        )
      );
    } else {
      const newVisitService: VisitService = {
        id: Date.now().toString(),
        service,
        quantity: 1,
        unitPrice: service.fee,
        totalPrice: service.fee,
      };
      setVisitServices((prev) => [...prev, newVisitService]);
    }

    setIsServiceDialogOpen(false);
    setServiceSearchQuery("");
  };

  const handleAddMedicine = (
    medicine: Medicine,
    quantity: number,
    dosage: string = ""
  ) => {
    if (quantity > medicine.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${medicine.quantity} units available`,
        variant: "destructive",
      });
      return;
    }

    const existingMedicine = visitMedicines.find(
      (vm) => vm.medicine.id === medicine.id
    );

    if (existingMedicine) {
      const newQuantity = existingMedicine.quantity + quantity;
      if (newQuantity > medicine.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${medicine.quantity} units available`,
          variant: "destructive",
        });
        return;
      }

      setVisitMedicines((prev) =>
        prev.map((vm) =>
          vm.medicine.id === medicine.id
            ? {
                ...vm,
                quantity: newQuantity,
                totalPrice: newQuantity * vm.unitPrice,
                dosage: dosage || vm.dosage,
              }
            : vm
        )
      );
    } else {
      const newVisitMedicine: VisitMedicine = {
        id: Date.now().toString(),
        medicine,
        quantity,
        unitPrice: medicine.unitPrice,
        totalPrice: quantity * medicine.unitPrice,
        dosage: dosage || undefined,
      };
      setVisitMedicines((prev) => [...prev, newVisitMedicine]);
    }

    setIsMedicineDialogOpen(false);
    setMedicineSearchQuery("");
  };

  const handleRemoveService = (serviceId: string) => {
    setVisitServices((prev) => prev.filter((vs) => vs.id !== serviceId));
  };

  const handleRemoveMedicine = (medicineId: string) => {
    setVisitMedicines((prev) => prev.filter((vm) => vm.id !== medicineId));
  };

  const handleSubmit = async (action: "save" | "complete") => {
    if (!selectedPatient) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (visitServices.length === 0 && visitMedicines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service or medicine",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totals = calculateTotals();

      // Transform the data to match the backend schema EXACTLY
      const visitData: Omit<
        Visit,
        "id" | "createdAt" | "updatedAt" | "branchId"
      > = {
        patientId: selectedPatient.id,
        services: visitServices.map((vs) => ({
          serviceId: vs.service.id,
          quantity: vs.quantity,
          notes: vs.service.description || undefined,
        })),
        medicines: visitMedicines.map((vm) => ({
          medicineId: vm.medicine.id,
          quantity: vm.quantity,
          dosage: vm.dosage || undefined,
          instructions: vm.dosage || undefined, // Map dosage to instructions
        })),
        status: action === "complete" ? "Completed" : "Open",
        attendingStaff: attendingStaff || undefined,
        diagnosisNotes: diagnosisNotes || undefined,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        paymentMethod,
        receiptSent: false,
      };

      await addVisit(visitData);

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/clinic/visits");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);

  useEffect(() => {
    let mounted = true;

    const doSearch = async () => {
      if (!patientSearchQuery) {
        if (mounted) setFilteredPatients(patients);
        return;
      }

      try {
        const result = searchPatients(patientSearchQuery);
        const data = result instanceof Promise ? await result : result;
        if (mounted) setFilteredPatients(data);
      } catch (err) {
        // fallback to empty list on error
        if (mounted) setFilteredPatients([]);
        // optionally log the error for debugging
        // console.error("Patient search failed", err);
      }
    };

    doSearch();

    return () => {
      mounted = false;
    };
  }, [patientSearchQuery, patients, searchPatients]);

  const filteredServices = services.filter(
    (service) =>
      service.isActive &&
      service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );
  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.quantity > 0 &&
      medicine.name.toLowerCase().includes(medicineSearchQuery.toLowerCase())
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Visit Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Patient visit has been recorded successfully.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to visits...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              New Patient Visit
            </h1>
            <p className="text-gray-600 mt-1">
              Record a new patient consultation and treatment
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(new Date())}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
                <CardTitle className="flex items-center text-blue-900">
                  <User className="h-6 w-6 mr-3" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedPatient ? (
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(selectedPatient.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {selectedPatient.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          ID: {selectedPatient.patientId}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{selectedPatient.age} years old</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                        {selectedPatient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{selectedPatient.email}</span>
                          </div>
                        )}
                        {selectedPatient.address && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">
                              {selectedPatient.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                      className="border-gray-300"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Dialog
                    open={isPatientDialogOpen}
                    onOpenChange={setIsPatientDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-16 bg-white border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <Plus className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            Select Patient
                          </div>
                          <div className="text-sm text-gray-600">
                            Choose an existing patient or search by name/ID
                          </div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Select Patient
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search patients by name, ID, or phone..."
                            value={patientSearchQuery}
                            onChange={(e) =>
                              setPatientSearchQuery(e.target.value)
                            }
                            className="pl-10 h-11"
                          />
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              onClick={() => {
                                setSelectedPatient(patient);
                                setIsPatientDialogOpen(false);
                                setPatientSearchQuery("");
                              }}
                              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {patient.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    ID: {patient.patientId} • {patient.age}{" "}
                                    years • {patient.phone}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="bg-gray-100"
                                >
                                  {patient.gender}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {filteredPatients.length === 0 && (
                            <div className="text-center py-8">
                              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No patients found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-green-900">
                    <Stethoscope className="h-6 w-6 mr-3" />
                    Services & Procedures
                  </CardTitle>
                  <Dialog
                    open={isServiceDialogOpen}
                    onOpenChange={setIsServiceDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Add Medical Service
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search services by name or category..."
                            value={serviceSearchQuery}
                            onChange={(e) =>
                              setServiceSearchQuery(e.target.value)
                            }
                            className="pl-10 h-11"
                          />
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {filteredServices.map((service) => (
                            <div
                              key={service.id}
                              onClick={() => handleAddService(service)}
                              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {service.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {service.category}
                                  </p>
                                  {service.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      {service.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600 text-lg">
                                    {formatCurrency(service.fee)}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    {service.duration || 30} min
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredServices.length === 0 && (
                            <div className="text-center py-8">
                              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No services found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {visitServices.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No services added yet</p>
                    <p className="text-sm text-gray-400">
                      Add consultation, tests, or procedures
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitServices.map((visitService) => (
                      <div
                        key={visitService.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {visitService.service.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {visitService.quantity} ×{" "}
                              {formatCurrency(visitService.unitPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(visitService.totalPrice)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveService(visitService.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medicines Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-purple-900">
                    <Pill className="h-6 w-6 mr-3" />
                    Medicines & Prescriptions
                  </CardTitle>
                  <Dialog
                    open={isMedicineDialogOpen}
                    onOpenChange={setIsMedicineDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medicine
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Pill className="h-5 w-5" />
                          Add Medicine to Prescription
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search medicines by name or category..."
                            value={medicineSearchQuery}
                            onChange={(e) =>
                              setMedicineSearchQuery(e.target.value)
                            }
                            className="pl-10 h-11"
                          />
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {filteredMedicines.map((medicine) => (
                            <MedicineSelector
                              key={medicine.id}
                              medicine={medicine}
                              onAdd={handleAddMedicine}
                              formatCurrency={formatCurrency}
                            />
                          ))}
                          {filteredMedicines.length === 0 && (
                            <div className="text-center py-8">
                              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">
                                No medicines found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {visitMedicines.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No medicines added yet</p>
                    <p className="text-sm text-gray-400">
                      Add prescribed medications and treatments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitMedicines.map((visitMedicine) => (
                      <div
                        key={visitMedicine.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Pill className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {visitMedicine.medicine.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                {visitMedicine.quantity} ×{" "}
                                {formatCurrency(visitMedicine.unitPrice)}
                              </span>
                              {visitMedicine.dosage && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-600">
                                    Dosage: {visitMedicine.dosage}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Package className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Batch: {visitMedicine.medicine.batch}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(visitMedicine.totalPrice)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveMedicine(visitMedicine.id)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-100">
                <CardTitle className="flex items-center text-orange-900">
                  <FileText className="h-6 w-6 mr-3" />
                  Clinical Notes & Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="staff"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Attending Staff
                  </Label>
                  <Select
                    value={attendingStaff}
                    onValueChange={setAttendingStaff}
                  >
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder="Select attending medical staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          <div className="flex items-center gap-2">
                            <span>{member.name}</span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100"
                            >
                              {member.role.name}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="diagnosis"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Diagnosis & Clinical Notes
                  </Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis, symptoms, examination findings, treatment plan..."
                    value={diagnosisNotes}
                    onChange={(e) => setDiagnosisNotes(e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="payment"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod || ""}
                    onValueChange={(value) =>
                      setPaymentMethod(value as Visit["paymentMethod"])
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">💵 Cash</SelectItem>
                      <SelectItem value="Mobile Money">
                        📱 Mobile Money
                      </SelectItem>
                      <SelectItem value="Insurance">🏥 Insurance</SelectItem>
                      <SelectItem value="Credit">💳 Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bill Summary */}
            <Card className="border-0 shadow-sm bg-white sticky top-6">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-900">
                  <Receipt className="h-6 w-6 mr-3" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Services ({visitServices.length}):
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(
                        visitServices.reduce(
                          (sum, vs) => sum + vs.totalPrice,
                          0
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Medicines ({visitMedicines.length}):
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(
                        visitMedicines.reduce(
                          (sum, vm) => sum + vm.totalPrice,
                          0
                        )
                      )}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Tax Toggle Section */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="include-tax"
                        checked={includeTax}
                        onCheckedChange={setIncludeTax}
                      />
                      <Label
                        htmlFor="include-tax"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Include Tax ({settings.taxRate}%)
                      </Label>
                    </div>
                    <span className="text-sm font-semibold">
                      {includeTax ? formatCurrency(tax) : "No tax"}
                    </span>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-green-600">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={() => handleSubmit("complete")}
                      disabled={
                        isSubmitting ||
                        !selectedPatient ||
                        (visitServices.length === 0 &&
                          visitMedicines.length === 0)
                      }
                      className="w-full bg-green-600 hover:bg-green-700 shadow-sm h-12 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Complete Visit
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleSubmit("save")}
                      disabled={
                        isSubmitting ||
                        !selectedPatient ||
                        (visitServices.length === 0 &&
                          visitMedicines.length === 0)
                      }
                      className="w-full border-gray-300 h-11"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      className="w-full border-gray-300 h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  Visit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Services:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {visitServices.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Medicines:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {visitMedicines.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Patient:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {selectedPatient ? "Selected" : "Not Set"}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    All fields must be completed before finalizing the visit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Medicine Selector Component
function MedicineSelector({
  medicine,
  onAdd,
  formatCurrency,
}: {
  medicine: Medicine;
  onAdd: (medicine: Medicine, quantity: number, dosage: string) => void;
  formatCurrency: (amount: number) => string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [dosage, setDosage] = useState("");

  const handleAdd = () => {
    onAdd(medicine, quantity, dosage);
    setQuantity(1);
    setDosage("");
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (medicine.quantity <= medicine.minStock) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800" };
    }
  };

  const stockStatus = getStockStatus(medicine);

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
            <Badge variant="outline" className={stockStatus.color}>
              {stockStatus.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {medicine.category} • Batch: {medicine.batch}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-green-600">
              {formatCurrency(medicine.unitPrice)} each
            </span>
            <span className="text-gray-500">
              Stock: {medicine.quantity} {medicine.unit}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-2 flex-1">
          <Label
            htmlFor={`quantity-${medicine.id}`}
            className="text-xs font-medium"
          >
            Quantity
          </Label>
          <Input
            id={`quantity-${medicine.id}`}
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
            }
            min="1"
            max={medicine.quantity}
            className="h-9"
          />
        </div>

        <div className="space-y-2 flex-1">
          <Label
            htmlFor={`dosage-${medicine.id}`}
            className="text-xs font-medium"
          >
            Dosage Instructions
          </Label>
          <Input
            id={`dosage-${medicine.id}`}
            placeholder="e.g., 1 tablet daily"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="h-9"
          />
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          disabled={quantity > medicine.quantity}
          className="bg-purple-600 hover:bg-purple-700 h-9"
        >
          Add
        </Button>
      </div>

      {quantity > medicine.quantity && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Only {medicine.quantity} units available
        </div>
      )}
    </div>
  );
}
