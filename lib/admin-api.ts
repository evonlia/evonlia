import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Status } from "./bookings-db";

class ApiError extends Error { constructor(public status: number, public code?: string) { super(code ?? String(status)); } }

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error);
  return data as T;
}

const KEY = ["admin-bookings"];

export function useAdminBookings() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await call<{ bookings: Booking[] }>("/api/admin/bookings")).bookings,
    retry: (n, e) => !(e instanceof ApiError && e.status === 401) && n < 1,
    refetchInterval: 30_000, // new requests show up on their own
  });
}
export const isUnauthorized = (e: unknown) => e instanceof ApiError && e.status === 401;

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => call("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call("/api/admin/login", { method: "DELETE" }),
    onSuccess: () => { qc.removeQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: KEY }); },
  });
}
export const useLoginInfo = () =>
  useQuery({ queryKey: ["admin-login-info"], queryFn: () => call<{ authed: boolean; configured: boolean }>("/api/admin/login") });

/** Optimistic: the UI updates instantly and rolls back if the server says no. */
export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ref, ...patch }: { ref: string; status?: Status; notes?: string }) =>
      call(`/api/admin/bookings/${ref}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }),
    onMutate: async ({ ref, ...patch }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Booking[]>(KEY);
      qc.setQueryData<Booking[]>(KEY, (old) => old?.map((b) => (b.ref === ref ? { ...b, ...patch } : b)));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(KEY, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ref: string) => call(`/api/admin/bookings/${ref}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
