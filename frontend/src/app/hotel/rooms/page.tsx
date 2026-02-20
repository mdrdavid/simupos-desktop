"use client"

import { useState } from "react"
import { useHotel } from "@/context/HotelContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { RoomForm } from "@/components/hotel/RoomForm"
import { BookingForm } from "@/components/hotel/BookingForm"
import type { Room } from "@/src/types/hotel"

export default function RoomManagement() {
  const { rooms } = useHotel()
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsBookingFormOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Dialog open={isRoomFormOpen} onOpenChange={setIsRoomFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new room</DialogTitle>
            </DialogHeader>
            <RoomForm onClose={() => setIsRoomFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            onClick={() => room.status === "available" && handleBookRoom(room)}
            className={room.status === "available" ? "cursor-pointer hover:shadow-lg" : "opacity-50"}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
              <div className={`h-4 w-4 rounded-full ${getStatusColor(room.status)}`} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{room.type}</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "UGX" }).format(room.rate)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isBookingFormOpen} onOpenChange={setIsBookingFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book: {selectedRoom?.name}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <BookingForm
              defaultRoomId={selectedRoom.id}
              defaultPrice={selectedRoom.rate}
              onClose={() => setIsBookingFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
