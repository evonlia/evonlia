// Edit these to match the real company details.
export const SITE = {
  name: "Evonlia",
  email: "hello@evonlia.com",
  whatsapp: "201000000000", // international format, no +
  phoneDisplay: "+20 100 000 0000",
  city: { en: "Alexandria, Egypt", ar: "الإسكندرية، مصر" },
  timezone: "Africa/Cairo",
  // Days the company does not take meetings. 0 = Sunday ... 6 = Saturday. Now: Monday, Thursday, Friday.
  // Saturday is open (10:00 to 20:00). To reopen a day, delete its number from this list.
  closedDays: [1, 4, 5],
  // Meetings can start from `start` and must finish by `end` (24h clock): 10:00 to 20:00.
  hours: { start: 10, end: 20 },
  // One meeting takes this long. While it is booked, no other client can book a time that overlaps it.
  callMinutes: 90,
  // Start times are offered every this many minutes (10:00, 10:30, 11:00 ...).
  slotStep: 30,
  // How clients can meet. Add "phone" or "visit" to offer them again (the choice then shows in the booking form).
  modes: ["video"] as ("video" | "phone" | "visit")[],
  daysAhead: 21,
};
