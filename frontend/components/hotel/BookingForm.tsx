"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHotel } from "@/context/HotelContext";
import type { Booking } from "@/src/types/hotel";

const formSchema = z.object({
  roomId: z.coerce.number(),
  customerId: z.coerce.number(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  price: z.coerce.number(),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
});

interface BookingFormProps {
  booking?: Booking;
  defaultRoomId?: number;
  defaultPrice?: number;
  onClose: () => void;
}

export function BookingForm({
  booking,
  defaultRoomId,
  defaultPrice,
  onClose,
}: BookingFormProps) {
  const { rooms, addBooking, updateBooking } = useHotel();

  // Convert numeric roomId to string for Select component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const defaultRoomIdString =
    booking?.roomId?.toString() ?? defaultRoomId?.toString() ?? "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: booking?.roomId ?? defaultRoomId ?? undefined,
      customerId: booking?.customerId ?? undefined,
      startDateTime:
        booking?.startDateTime?.toISOString().substring(0, 16) ?? "",
      endDateTime: booking?.endDateTime?.toISOString().substring(0, 16) ?? "",
      price: booking?.price ?? defaultPrice ?? 0,
      paymentStatus: booking?.paymentStatus ?? "unpaid",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const bookingData = {
      ...values,
      startDateTime: new Date(values.startDateTime),
      endDateTime: new Date(values.endDateTime),
      status: booking?.status ?? "pending",
    };
    if (booking) {
      updateBooking(booking.id, bookingData);
    } else {
      addBooking(bookingData);
    }
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))} // Convert back to number
                defaultValue={field.value?.toString()} // Convert number to string
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer ID</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter customer ID"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-out</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (UGX)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{booking ? "Update" : "Create"} Booking</Button>
        </div>
      </form>
    </Form>
  );
}
