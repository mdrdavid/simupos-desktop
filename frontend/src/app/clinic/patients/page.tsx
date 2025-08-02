"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, User, Phone, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useClinic } from "@/context/ClinicContext"

export default function PatientsPage() {
  const router = useRouter()
  const { patients, searchPatients } = useClinic()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = searchQuery.trim() ? searchPatients(searchQuery) : patients

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Male":
        return "bg-blue-100 text-blue-800"
      case "Female":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">{filteredPatients.length} registered patients</p>
          </div>
          <Button onClick={() => router.push("/clinic/patients/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4">
        {/* Patients List */}
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                        <Badge className={getGenderColor(patient.gender)} variant="secondary">
                          {patient.gender}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{patient.age} years</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {patient.patientId} • Registered: {formatDate(patient.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/clinic/patients/${patient.id}`)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No patients found" : "No patients registered"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Start by adding your first patient to the system"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push("/clinic/patients/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
