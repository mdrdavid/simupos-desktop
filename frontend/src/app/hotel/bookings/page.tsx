"use client"

import { useState } from "react"
import { useHotel } from "@/context/HotelContext"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { BookingForm } from "@/components/hotel/BookingForm"

export default function BookingManagement() {
  const { bookings, rooms } = useHotel()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const getRoomName = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    return room ? room.name : "Unknown Room"
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new booking</DialogTitle>
            </DialogHeader>
            <BookingForm onClose={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{getRoomName(booking.roomId)}</TableCell>
              <TableCell>{booking.customerId}</TableCell>
              <TableCell>{new Date(booking.startDateTime).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(booking.endDateTime).toLocaleDateString()}</TableCell>
              <TableCell>{booking.status}</TableCell>
              <TableCell>
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "UGX" }).format(booking.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
