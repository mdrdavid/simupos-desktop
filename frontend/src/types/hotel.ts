export interface Room {
  id: number;
  name: string;
  type: "single" | "double" | "suite" | "conference" | "banquet";
  capacity: number;
  status: "available" | "occupied" | "maintenance";
  rate: number; // per night or per hour
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: number;
  roomId: number; // FK to Room
  customerId: number; // FK to POS Customers
  startDateTime: Date;
  endDateTime: Date;
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  price: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingInvoice {
  id: number;
  bookingId: number;
  invoiceId: number; // FK to POS invoice
  total: number;
  paid: boolean;
}

export interface HotelContextType {
    rooms: Room[]
    addRoom: (room: Omit<Room, "id" | "createdAt" | "updatedAt">) => void
    updateRoom: (id: number, updates: Partial<Room>) => void
    deleteRoom: (id: number) => void
    bookings: Booking[]
    addBooking: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void
    updateBooking: (id: number, updates: Partial<Booking>) => void
    deleteBooking: (id: number) => void
}
