import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Lang } from "@/lib/i18n";

/* ---------- UI slice: language + mobile menu ---------- */
type UiState = { lang: Lang; menuOpen: boolean };
const ui = createSlice({
  name: "ui",
  initialState: { lang: "en", menuOpen: false } as UiState,
  reducers: {
    setLang: (s, a: PayloadAction<Lang>) => { s.lang = a.payload; },
    toggleMenu: (s) => { s.menuOpen = !s.menuOpen; },
    closeMenu: (s) => { s.menuOpen = false; },
  },
});

/* ---------- Booking slice: the multi-step flow ---------- */
export type Mode = "video" | "phone" | "visit";
export type BookingStep = 0 | 1 | 2 | 3; // 3 = confirmation
export type Confirmed = {
  ref: string; serviceId: string; date: string; time: string; mode: Mode; name: string; email: string;
};
type BookingState = {
  step: BookingStep;
  serviceId: string | null;
  date: string | null;
  time: string | null;
  mode: Mode;
  details: { name: string; email: string; phone: string; company: string; message: string };
  confirmed: Confirmed | null;
};
const initialBooking: BookingState = {
  step: 0, serviceId: null, date: null, time: null, mode: "video",
  details: { name: "", email: "", phone: "", company: "", message: "" },
  confirmed: null,
};
const booking = createSlice({
  name: "booking",
  initialState: initialBooking,
  reducers: {
    chooseService: (s, a: PayloadAction<string>) => { s.serviceId = a.payload; },
    chooseDate: (s, a: PayloadAction<string>) => { s.date = a.payload; s.time = null; },
    chooseTime: (s, a: PayloadAction<string | null>) => { s.time = a.payload; },
    chooseMode: (s, a: PayloadAction<Mode>) => { s.mode = a.payload; },
    setDetail: (s, a: PayloadAction<{ key: keyof BookingState["details"]; value: string }>) => {
      s.details[a.payload.key] = a.payload.value;
    },
    goToStep: (s, a: PayloadAction<BookingStep>) => { s.step = a.payload; },
    confirm: (s, a: PayloadAction<Confirmed>) => { s.confirmed = a.payload; s.step = 3; },
    reset: () => initialBooking,
  },
});

/* ---------- Admin slice: dashboard filters and selection ---------- */
export type AdminStatusFilter = "all" | "new" | "confirmed" | "done" | "cancelled";
type AdminState = { view: "list" | "week"; filter: AdminStatusFilter; search: string; selected: string | null; weekOffset: number };
const admin = createSlice({
  name: "admin",
  initialState: { view: "list", filter: "all", search: "", selected: null, weekOffset: 0 } as AdminState,
  reducers: {
    setView: (s, a: PayloadAction<AdminState["view"]>) => { s.view = a.payload; },
    setFilter: (s, a: PayloadAction<AdminStatusFilter>) => { s.filter = a.payload; },
    setSearch: (s, a: PayloadAction<string>) => { s.search = a.payload; },
    select: (s, a: PayloadAction<string | null>) => { s.selected = a.payload; },
    shiftWeek: (s, a: PayloadAction<number>) => { s.weekOffset = a.payload === 0 ? 0 : s.weekOffset + a.payload; },
  },
});

export const { setLang, toggleMenu, closeMenu } = ui.actions;
export const { setView, setFilter, setSearch, select, shiftWeek } = admin.actions;
export const { chooseService, chooseDate, chooseTime, chooseMode, setDetail, goToStep, confirm, reset } = booking.actions;

export const makeStore = () => configureStore({ reducer: { ui: ui.reducer, booking: booking.reducer, admin: admin.reducer } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
