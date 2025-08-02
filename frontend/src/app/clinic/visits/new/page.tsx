/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClinic } from "@/context/ClinicContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, Search, User, Stethoscope, Pill, Trash2, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Patient, Service, Medicine, Visit, VisitService, VisitMedicine } from "@/src/types/clinic"

export default function NewVisitPage() {
  const router = useRouter()
  const { patients, services, medicines, staff, addVisit, settings, searchPatients } = useClinic()
  const { toast } = useToast()

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [visitServices, setVisitServices] = useState<VisitService[]>([])
  const [visitMedicines, setVisitMedicines] = useState<VisitMedicine[]>([])
  const [attendingStaff, setAttendingStaff] = useState("")
  const [diagnosisNotes, setDiagnosisNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<Visit["paymentMethod"]>("Cash")

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false)
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [serviceSearchQuery, setServiceSearchQuery] = useState("")
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate totals
  const subtotal =
    visitServices.reduce((sum, vs) => sum + vs.totalPrice, 0) +
    visitMedicines.reduce((sum, vm) => sum + vm.totalPrice, 0)
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddService = (service: Service) => {
    const existingService = visitServices.find((vs) => vs.service.id === service.id)

    if (existingService) {
      setVisitServices((prev) =>
        prev.map((vs) =>
          vs.service.id === service.id
            ? {
                ...vs,
                quantity: vs.quantity + 1,
                totalPrice: (vs.quantity + 1) * vs.unitPrice,
              }
            : vs,
        ),
      )
    } else {
      const newVisitService: VisitService = {
        id: Date.now().toString(),
        service,
        quantity: 1,
        unitPrice: service.fee,
        totalPrice: service.fee,
      }
      setVisitServices((prev) => [...prev, newVisitService])
    }

    setIsServiceDialogOpen(false)
    setServiceSearchQuery("")
  }

  const handleAddMedicine = (medicine: Medicine, quantity: number) => {
    if (quantity > medicine.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${medicine.quantity} units available`,
        variant: "destructive",
      })
      return
    }

    const existingMedicine = visitMedicines.find((vm) => vm.medicine.id === medicine.id)

    if (existingMedicine) {
      const newQuantity = existingMedicine.quantity + quantity
      if (newQuantity > medicine.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${medicine.quantity} units available`,
          variant: "destructive",
        })
        return
      }

      setVisitMedicines((prev) =>
        prev.map((vm) =>
          vm.medicine.id === medicine.id
            ? {
                ...vm,
                quantity: newQuantity,
                totalPrice: newQuantity * vm.unitPrice,
              }
            : vm,
        ),
      )
    } else {
      const newVisitMedicine: VisitMedicine = {
        id: Date.now().toString(),
        medicine,
        quantity,
        unitPrice: medicine.unitPrice,
        totalPrice: quantity * medicine.unitPrice,
      }
      setVisitMedicines((prev) => [...prev, newVisitMedicine])
    }

    setIsMedicineDialogOpen(false)
    setMedicineSearchQuery("")
  }

  const handleRemoveService = (serviceId: string) => {
    setVisitServices((prev) => prev.filter((vs) => vs.id !== serviceId))
  }

  const handleRemoveMedicine = (medicineId: string) => {
    setVisitMedicines((prev) => prev.filter((vm) => vm.id !== medicineId))
  }

  const handleSubmit = async (action: "save" | "complete") => {
    if (!selectedPatient) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (visitServices.length === 0 && visitMedicines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service or medicine",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const visitData: Omit<Visit, "id" | "createdAt" | "updatedAt"> = {
        patient: selectedPatient,
        services: visitServices,
        medicines: visitMedicines,
        status: action === "complete" ? "Completed" : "Open",
        attendingStaff: attendingStaff || undefined,
        diagnosisNotes: diagnosisNotes || undefined,
        subtotal,
        tax,
        total,
        paymentMethod,
        receiptSent: false,
      }

      addVisit(visitData)

      toast({
        title: "Success",
        description: `Visit ${action === "complete" ? "completed" : "saved"} successfully`,
      })

      router.push("/clinic/visits")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save visit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPatients = patientSearchQuery ? searchPatients(patientSearchQuery) : patients
  const filteredServices = services.filter(
    (service) => service.isActive && service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()),
  )
  const filteredMedicines = medicines.filter(
    (medicine) => medicine.quantity > 0 && medicine.name.toLowerCase().includes(medicineSearchQuery.toLowerCase()),
  )

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Visit</h1>
          <p className="text-gray-600">Start a new patient visit</p>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-sm text-gray-600">
                  ID: {selectedPatient.patientId} • Age: {selectedPatient.age} • {selectedPatient.phone}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                Change
              </Button>
            </div>
          ) : (
            <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Select Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search patients..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsPatientDialogOpen(false)
                          setPatientSearchQuery("")
                        }}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <h4 className="font-medium text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">
                          ID: {patient.patientId} • Age: {patient.age} • {patient.phone}
                        </p>
                      </div>
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No patients found</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Services
            </div>
            <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleAddService(service)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.category}</p>
                          </div>
                          <p className="font-semibold text-green-600">{formatCurrency(service.fee)}</p>
                        </div>
                      </div>
                    ))}
                    {filteredServices.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No services found</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitServices.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No services added yet</p>
          ) : (
            <div className="space-y-3">
              {visitServices.map((visitService) => (
                <div key={visitService.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{visitService.service.name}</h4>
                    <p className="text-sm text-gray-600">
                      Qty: {visitService.quantity} × {formatCurrency(visitService.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-green-600">{formatCurrency(visitService.totalPrice)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(visitService.id)}
                      className="text-red-600 hover:text-red-700"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Medicines
            </div>
            <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Medicine</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search medicines..."
                      value={medicineSearchQuery}
                      onChange={(e) => setMedicineSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredMedicines.map((medicine) => (
                      <MedicineSelector
                        key={medicine.id}
                        medicine={medicine}
                        onAdd={handleAddMedicine}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                    {filteredMedicines.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No medicines found</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitMedicines.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No medicines added yet</p>
          ) : (
            <div className="space-y-3">
              {visitMedicines.map((visitMedicine) => (
                <div key={visitMedicine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{visitMedicine.medicine.name}</h4>
                    <p className="text-sm text-gray-600">
                      Qty: {visitMedicine.quantity} × {formatCurrency(visitMedicine.unitPrice)}
                    </p>
                    {visitMedicine.dosage && <p className="text-xs text-gray-500">Dosage: {visitMedicine.dosage}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-green-600">{formatCurrency(visitMedicine.totalPrice)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedicine(visitMedicine.id)}
                      className="text-red-600 hover:text-red-700"
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
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff">Attending Staff</Label>
            <Select value={attendingStaff} onValueChange={setAttendingStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select attending staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name} ({member.role.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis Notes</Label>
            <Textarea
              id="diagnosis"
              placeholder="Enter diagnosis, symptoms, or clinical notes..."
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Method</Label>
            <Select
              value={paymentMethod || ""}
              onValueChange={(value) => setPaymentMethod(value as Visit["paymentMethod"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bill Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({settings.taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit("save")}
          disabled={isSubmitting || !selectedPatient || (visitServices.length === 0 && visitMedicines.length === 0)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={() => handleSubmit("complete")}
          disabled={isSubmitting || !selectedPatient || (visitServices.length === 0 && visitMedicines.length === 0)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Receipt className="h-4 w-4 mr-2" />
          {isSubmitting ? "Processing..." : "Complete Visit"}
        </Button>
      </div>
    </div>
  )
}

// Medicine Selector Component
function MedicineSelector({
  medicine,
  onAdd,
  formatCurrency,
}: {
  medicine: Medicine
  onAdd: (medicine: Medicine, quantity: number) => void
  formatCurrency: (amount: number) => string
}) {
  const [quantity, setQuantity] = useState(1)
  const [dosage, setDosage] = useState("")

  const handleAdd = () => {
    onAdd(medicine, quantity)
    setQuantity(1)
    setDosage("")
  }

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{medicine.name}</h4>
          <p className="text-sm text-gray-600">
            Stock: {medicine.quantity} • {formatCurrency(medicine.unitPrice)} each
          </p>
        </div>
        <Badge variant={medicine.quantity <= medicine.minStock ? "destructive" : "secondary"}>
          {medicine.quantity <= medicine.minStock ? "Low Stock" : "In Stock"}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
          min="1"
          max={medicine.quantity}
          className="w-20"
        />
        <Input
          placeholder="Dosage (optional)"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  )
}
