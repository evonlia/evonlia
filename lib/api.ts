import { useMutation, useQuery } from "@tanstack/react-query";
import type { Service } from "./services";
import type { Booking } from "./bookings-db";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error ?? "request_failed"), { code: data?.error as string | undefined, status: res.status });
  return data as T;
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => (await json<{ services: Service[] }>(await fetch("/api/services"))).services,
    staleTime: 10 * 60_000,
  });
}

export function useSlots(date: string | null) {
  return useQuery({
    queryKey: ["slots", date],
    enabled: !!date,
    queryFn: async () => (await json<{ slots: string[] }>(await fetch(`/api/slots?date=${date}`))).slots,
    staleTime: 15_000,
  });
}

export type BookingInput = Omit<Booking, "ref" | "createdAt" | "status" | "notes">;
export function useCreateBooking() {
  return useMutation({
    mutationFn: async (input: BookingInput) =>
      (await json<{ booking: Booking }>(
        await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
      )).booking,
  });
}
