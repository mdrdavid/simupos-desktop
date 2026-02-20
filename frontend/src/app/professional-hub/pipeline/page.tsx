/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Plus, Search, LayoutGrid, List, MoreVertical, Calendar, User, ArrowRight, Trash2, Edit2, Eye, TrendingUp, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSalesPipeline } from "@/context/SalesPipelineContext"
import { useBusiness } from "@/context/BusinessContext"
import { Deal, DealStage, PIPELINE_STAGES } from "@/src/types/salesPipeline"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from "date-fns"
import { generateSalesPipelineReportPDF } from "@/src/utils/exportUtils"

export default function SalesPipelinePage() {
  const { deals, addDeal, updateDeal, deleteDeal, moveDeal, isLoading } = useSalesPipeline()
  const { currentBusiness } = useBusiness()
  const [isMounted, setIsMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"board" | "list">("board")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  // Form states
  const [reportPeriod, setReportPeriod] = useState<"week" | "month" | "year" | "all">("month")

  const [formData, setFormData] = useState<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>>({
    title: "",
    customerName: "",
    value: 0,
    stage: "PROSPECT",
    expectedCloseDate: new Date().toISOString().split('T')[0],
    probability: 50,
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || (isLoading && deals.length === 0)) {
    return <div className="container mx-auto p-6 text-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading sales pipeline...</p>
    </div>
  }

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addDeal(formData)
      setIsAddModalOpen(false)
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDeal) {
      setIsSubmitting(true)
      try {
        await updateDeal(selectedDeal.id, formData)
        setIsEditModalOpen(false)
        setSelectedDeal(null)
        resetForm()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      customerName: "",
      value: 0,
      stage: "PROSPECT",
      expectedCloseDate: new Date().toISOString().split('T')[0],
      probability: 50,
      notes: "",
    })
  }

  const openEditModal = (deal: Deal) => {
    setSelectedDeal(deal)
    setFormData({
      title: deal.title,
      customerName: deal.customerName,
      value: deal.value,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate,
      probability: deal.probability,
      notes: deal.notes || "",
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsViewModalOpen(true)
  }

  const handleGenerateReport = () => {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (reportPeriod) {
      case "week":
        startDate = startOfWeek(new Date());
        endDate = endOfWeek(new Date());
        break;
      case "month":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case "year":
        startDate = startOfYear(new Date());
        endDate = endOfYear(new Date());
        break;
      case "all":
      default:
        startDate = new Date(0);
        break;
    }

    const reportDeals = deals.filter(deal => {
      if (reportPeriod === "all") return true;
      return isWithinInterval(new Date(deal.createdAt), { start: startDate, end: endDate });
    });

    const periodLabel = reportPeriod === "all"
      ? "All Time"
      : `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

    generateSalesPipelineReportPDF(reportDeals, periodLabel, currentBusiness);
    setIsReportModalOpen(false);
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Sales Pipeline</h1>
          <p className="text-gray-500 mt-1">Track and manage your business leads and deals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)} className="border-brand-primary text-brand-primary hover:bg-brand-primary/5">
            <FileText className="w-4 h-4 mr-2" />
            Detailed Report
          </Button>
          <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-brand-primary hover:bg-brand-secondary text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search deals or customers..."
            className="pl-10 border-gray-200 focus:border-brand-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")} className="w-full">
            <TabsList className="grid grid-cols-2 w-full md:w-[200px] bg-gray-50 p-1">
              <TabsTrigger value="board" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm">
                <LayoutGrid className="w-4 h-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm">
                <List className="w-4 h-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === "board" ? (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage.id)
              const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0)

              return (
                <div key={stage.id} className="w-80 flex-shrink-0 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">{stage.label}</h3>
                      <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 text-[10px] h-5">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      UGX {totalValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-gray-100/40 p-2 rounded-xl min-h-[60vh] border border-gray-100 space-y-3">
                    {stageDeals.map(deal => (
                      <Card
                        key={deal.id}
                        className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white overflow-hidden"
                        onClick={() => openViewModal(deal)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                              {deal.title}
                            </h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openViewModal(deal)}>
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(deal)}>
                                  <Edit2 className="w-4 h-4 mr-2" /> Edit Deal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 px-2 py-1">Move to</DropdownMenuLabel>
                                {PIPELINE_STAGES.filter(s => s.id !== deal.stage).map(s => (
                                  <DropdownMenuItem key={s.id} onClick={() => moveDeal(deal.id, s.id)}>
                                    <ArrowRight className="w-4 h-4 mr-2" /> {s.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteDeal(deal.id)} className="text-red-600 focus:text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1.5 rounded-lg">
                            <User className="w-3 h-3" />
                            <span className="truncate">{deal.customerName}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-sm font-bold text-gray-900">
                              UGX {deal.value.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {deal.expectedCloseDate}
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                             <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Success Rate</span>
                                <span className="font-bold">{deal.probability}%</span>
                             </div>
                             <div className="w-full bg-gray-100 rounded-full h-1">
                                <div
                                  className="bg-brand-primary h-1 rounded-full transition-all duration-500"
                                  style={{ width: `${deal.probability}%` }}
                                ></div>
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">Empty Stage</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Deal Information</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Value</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Stage</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Expected Close</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDeals.map(deal => (
                    <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">{deal.title}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <User className="w-3 h-3 mr-1" /> {deal.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">UGX {deal.value.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                           <div className="w-16 bg-gray-100 rounded-full h-1">
                              <div className="bg-brand-primary h-1 rounded-full" style={{ width: `${deal.probability}%` }}></div>
                           </div>
                           <span className="text-[10px] text-gray-400 font-medium">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PIPELINE_STAGES.find(s => s.id === deal.stage)?.color}`}>
                          {PIPELINE_STAGES.find(s => s.id === deal.stage)?.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                          {deal.expectedCloseDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-primary hover:bg-brand-primary/5" onClick={() => openViewModal(deal)}><Eye className="w-4 h-4" /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500 hover:bg-blue-50" onClick={() => openEditModal(deal)}><Edit2 className="w-4 h-4" /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={() => deleteDeal(deal.id)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Deal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddDeal}>
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
              <DialogDescription>Enter the details for the new sales lead.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase text-gray-500">Deal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Hotel Security Gate Project"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer" className="text-xs font-bold uppercase text-gray-500">Customer Name</Label>
                <Input
                  id="customer"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value" className="text-xs font-bold uppercase text-gray-500">Deal Value (UGX)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stage" className="text-xs font-bold uppercase text-gray-500">Initial Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(v) => setFormData({...formData, stage: v as DealStage})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-xs font-bold uppercase text-gray-500">Expected Close Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability" className="text-xs font-bold uppercase text-gray-500">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-xs font-bold uppercase text-gray-500">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details about the lead..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpdateDeal}>
            <DialogHeader>
              <DialogTitle>Edit Deal</DialogTitle>
              <DialogDescription>Update the details for this sales lead.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                <Label htmlFor="edit-title" className="text-xs font-bold uppercase text-gray-500">Deal Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-customer" className="text-xs font-bold uppercase text-gray-500">Customer Name</Label>
                <Input
                  id="edit-customer"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-value" className="text-xs font-bold uppercase text-gray-500">Deal Value (UGX)</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stage" className="text-xs font-bold uppercase text-gray-500">Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(v) => setFormData({...formData, stage: v as DealStage})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-date" className="text-xs font-bold uppercase text-gray-500">Expected Close Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-probability" className="text-xs font-bold uppercase text-gray-500">Probability (%)</Label>
                  <Input
                    id="edit-probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes" className="text-xs font-bold uppercase text-gray-500">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Generation Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate Pipeline Report</DialogTitle>
            <DialogDescription>Select the period for your detailed sales generation report.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase text-gray-500">Selection Period</Label>
              <Select value={reportPeriod} onValueChange={(v: any) => setReportPeriod(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-700 leading-relaxed">
                 The report will include business details, weighted values, and a breakdown of all deals created within the selected period.
               </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} className="bg-brand-primary hover:bg-brand-secondary text-white">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Deal Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedDeal && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedDeal.title}</DialogTitle>
                    <DialogDescription className="text-sm mt-1 flex items-center">
                      <User className="w-3 h-3 mr-1" /> {selectedDeal.customerName}
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PIPELINE_STAGES.find(s => s.id === selectedDeal.stage)?.color}`}>
                    {PIPELINE_STAGES.find(s => s.id === selectedDeal.stage)?.label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Deal Value</span>
                  <p className="text-lg font-bold text-gray-900">UGX {selectedDeal.value.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expected Close</span>
                  <p className="text-sm font-semibold text-gray-700">{selectedDeal.expectedCloseDate}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Success Probability</span>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-900">{selectedDeal.probability}%</p>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-brand-primary h-2 rounded-full shadow-[0_0_8px_rgba(65,165,165,0.3)]"
                        style={{ width: `${selectedDeal.probability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Creation Date</span>
                  <p className="text-sm font-semibold text-gray-700">{format(new Date(selectedDeal.createdAt), "PPP")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Internal Notes</span>
                <div className="p-4 bg-gray-50/80 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100 min-h-[80px]">
                  {selectedDeal.notes || "No internal notes recorded for this deal lead."}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between pt-2">
                 <Button variant="ghost" onClick={() => { deleteDeal(selectedDeal.id); setIsViewModalOpen(false); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2">
                   <Trash2 className="w-4 h-4 mr-2" /> Delete Lead
                 </Button>
                 <div className="flex gap-2">
                   <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                   <Button onClick={() => { setIsViewModalOpen(false); openEditModal(selectedDeal); }} className="bg-brand-primary hover:bg-brand-secondary text-white">
                     Edit Deal
                   </Button>
                 </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
