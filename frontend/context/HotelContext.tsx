/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Room, Booking, HotelContextType } from "@/src/types/hotel"

const HotelContext = createContext<HotelContextType | undefined>(undefined)

const sampleRooms: Room[] = [
    {
        id: 1,
        name: "Standard Single Room",
        type: "single",
        capacity: 1,
        status: "available",
        rate: 150000,
        amenities: ["wifi", "tv", "ac"],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        name: "Standard Double Room",
        type: "double",
        capacity: 2,
        status: "occupied",
        rate: 250000,
        amenities: ["wifi", "tv", "ac"],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 3,
        name: "Deluxe Suite",
        type: "suite",
        capacity: 2,
        status: "available",
        rate: 450000,
        amenities: ["wifi", "tv", "ac", "minibar"],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 4,
        name: "Conference Hall A",
        type: "conference",
        capacity: 100,
        status: "maintenance",
        rate: 1000000,
        amenities: ["projector", "sound_system", "wifi"],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const sampleBookings: Booking[] = [
    {
        id: 1,
        roomId: 2,
        customerId: 1,
        startDateTime: new Date(),
        endDateTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
        status: "checked_in",
        price: 500000,
        paymentStatus: "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        roomId: 3,
        customerId: 2,
        startDateTime: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
        endDateTime: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000),
        status: "confirmed",
        price: 1350000,
        paymentStatus: "partial",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export function HotelProvider({ children }: { children: React.ReactNode }) {
    const [rooms, setRooms] = useState<Room[]>(sampleRooms)
    const [bookings, setBookings] = useState<Booking[]>(sampleBookings)

    const addRoom = (room: Omit<Room, "id" | "createdAt" | "updatedAt">) => {
        const newRoom: Room = {
            ...room,
            id: Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        setRooms((prev) => [...prev, newRoom])
    }

    const updateRoom = (id: number, updates: Partial<Room>) => {
        setRooms((prev) =>
            prev.map((room) => (room.id === id ? { ...room, ...updates, updatedAt: new Date() } : room)),
        )
    }

    const deleteRoom = (id: number) => {
        setRooms((prev) => prev.filter((room) => room.id !== id))
    }

    const addBooking = (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
        const newBooking: Booking = {
            ...booking,
            id: Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        setBookings((prev) => [...prev, newBooking])
    }

    const updateBooking = (id: number, updates: Partial<Booking>) => {
        setBookings((prev) =>
            prev.map((booking) => (booking.id === id ? { ...booking, ...updates, updatedAt: new Date() } : booking)),
        )
    }

    const deleteBooking = (id: number) => {
        setBookings((prev) => prev.filter((booking) => booking.id !== id))
    }

    const value: HotelContextType = {
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        bookings,
        addBooking,
        updateBooking,
        deleteBooking,
    }

    return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
}

export function useHotel() {
    const context = useContext(HotelContext)
    if (context === undefined) {
        throw new Error("useHotel must be used within a HotelProvider")
    }
    return context
}
