"use client"

import { useState } from "react"
import { useHotel } from "@/context/HotelContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { BookingForm } from "@/components/hotel/BookingForm"

export default function HotelDashboard() {
  const { rooms, bookings } = useHotel()
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false)

  const availableRooms = rooms.filter((room) => room.status === "available").length
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
  const upcomingBookings = bookings.filter((booking) => new Date(booking.startDateTime) > new Date()).length

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hotel Dashboard</h1>
        <Dialog open={isBookingFormOpen} onOpenChange={setIsBookingFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new booking</DialogTitle>
            </DialogHeader>
            <BookingForm onClose={() => setIsBookingFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{availableRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{occupiedRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{upcomingBookings}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
