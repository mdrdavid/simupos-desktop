// This is a placeholder for the hotel API client.
// In a real application, this would be used to make API calls to the backend.

import type { Room, Booking } from "@/src/types/hotel";

export const getRooms = async (): Promise<Room[]> => {
    console.log("Fetching rooms...");
    return Promise.resolve([]);
}

export const getBookings = async (): Promise<Booking[]> => {
    console.log("Fetching bookings...");
    return Promise.resolve([]);
}
