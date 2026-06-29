const CAL_GW = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";
const SHEETS_GW = "https://connector-gateway.lovable.dev/google_sheets/v4";
const CALENDAR_ID = "primary";
const SPREADSHEET_ID = "1Dk094dW6mXDoE3IXuvnF3LhVfw6jheBYIRAV-KlWarI";
const TZ = "Europe/Lisbon";

export type BookingInput = {
  service: string;
  name: string;
  phone: string;
  email?: string;
  car: string;
  plate: string;
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:MM
  dateLabel: string;
};

export type BookingResult =
  | { ok: true; eventCreated: boolean; eventLink: string }
  | { ok: false; error: "slot_taken" | "missing_keys" };

function tzOffset(date: Date, tz: string): string {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" });
  const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const m = part.match(/GMT([+-]\d{2}:\d{2})/);
  return m ? m[1] : "+00:00";
}

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const end = (h + 1) % 24;
  return `${String(end).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function createBooking(d: BookingInput): Promise<BookingResult> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const calKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovableKey || !calKey || !sheetsKey) {
    return { ok: false, error: "missing_keys" };
  }

  const endTime = addHour(d.time);
  const startLocal = `${d.dateISO}T${d.time}:00`;
  const endLocal = `${d.dateISO}T${endTime}:00`;
  const refDate = new Date(`${startLocal}Z`);
  const offset = tzOffset(refDate, TZ);
  const timeMin = `${startLocal}${offset}`;
  const timeMax = `${endLocal}${offset}`;

  const calHeaders = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": calKey,
    "Content-Type": "application/json",
  };

  // 1. Check availability via freebusy
  try {
    const fb = await fetch(`${CAL_GW}/freeBusy`, {
      method: "POST",
      headers: calHeaders,
      body: JSON.stringify({ timeMin, timeMax, timeZone: TZ, items: [{ id: CALENDAR_ID }] }),
    });
    if (fb.ok) {
      const fbData = (await fb.json()) as {
        calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
      };
      const busy = fbData.calendars?.[CALENDAR_ID]?.busy ?? [];
      if (busy.length > 0) {
        return { ok: false, error: "slot_taken" };
      }
    }
  } catch {
    // if freebusy fails, continue and still attempt booking
  }

  // 2. Create the calendar event and invite the customer when email is provided.
  let eventLink = "";
  try {
    const ev = await fetch(`${CAL_GW}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?sendUpdates=all`, {
      method: "POST",
      headers: calHeaders,
      body: JSON.stringify({
        summary: `${d.service} — ${d.name}`,
        description: `Marcação Oficina Vale\nServiço: ${d.service}\nCliente: ${d.name}\nTelefone: ${d.phone}${d.email ? `\nEmail: ${d.email}` : ""}\nViatura: ${d.car}\nMatrícula: ${d.plate}`,
        start: { dateTime: startLocal, timeZone: TZ },
        end: { dateTime: endLocal, timeZone: TZ },
        attendees: d.email ? [{ email: d.email }] : undefined,
      }),
    });
    if (ev.ok) {
      const evData = (await ev.json()) as { htmlLink?: string };
      eventLink = evData.htmlLink ?? "";
    }
  } catch {
    // non-fatal
  }

  // 3. Log the customer / inquiry in the spreadsheet
  try {
    const row = [
      new Date().toLocaleString("pt-PT", { timeZone: TZ }),
      d.name,
      d.phone,
      d.car,
      d.plate,
      d.service,
      d.dateLabel,
      d.time,
      d.email ?? "",
      "",
      eventLink,
    ];
    await fetch(
      `${SHEETS_GW}/spreadsheets/${SPREADSHEET_ID}/values/Clientes!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": sheetsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      },
    );
  } catch {
    // non-fatal
  }

  return { ok: true, eventCreated: !!eventLink, eventLink };
}

// ============= Aluguer de Carrinhas (Van Rental) =============

export const VANS = ["Ronaldo", "Carlos", "Joana"] as const;
export type Van = (typeof VANS)[number];

export const VAN_RATE = 10; // euros por hora
export const VAN_MIN_HOURS = 2;
export const VAN_RADIUS_FEE = 10; // euros fixos fora do raio de 50 km
export const VAN_DIMENSIONS = { length: "3,10 m", width: "1,75 m", height: "1,90 m" };

export type VanBookingInput = {
  van: Van;
  name: string;
  phone: string;
  email?: string;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  hours: number; // >= 2
  outsideRadius: boolean;
  dateLabel: string;
};

export type VanBookingResult =
  | { ok: true; eventCreated: boolean; eventLink: string; price: number; endTime: string }
  | { ok: false; error: "slot_taken" | "missing_keys" | "invalid" };

export function vanPrice(hours: number, outsideRadius: boolean): number {
  return hours * VAN_RATE + (outsideRadius ? VAN_RADIUS_FEE : 0);
}

export async function createVanBooking(d: VanBookingInput): Promise<VanBookingResult> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const calKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovableKey || !calKey || !sheetsKey) {
    return { ok: false, error: "missing_keys" };
  }
  if (!VANS.includes(d.van) || d.hours < VAN_MIN_HOURS) {
    return { ok: false, error: "invalid" };
  }

  // Compute the rental window. Use UTC purely for date/time arithmetic, then
  // attach the Lisbon timezone to the event so Google interprets it locally.
  const start = new Date(`${d.dateISO}T${d.startTime}:00Z`);
  const end = new Date(start.getTime() + d.hours * 3600 * 1000);
  const startLocal = `${d.dateISO}T${d.startTime}:00`;
  const endISODate = end.toISOString().slice(0, 10);
  const endTime = end.toISOString().slice(11, 16);
  const endLocal = `${endISODate}T${endTime}:00`;

  const offset = tzOffset(new Date(`${startLocal}Z`), TZ);
  const timeMin = `${startLocal}${offset}`;
  const timeMax = `${endLocal}${offset}`;

  const calHeaders = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": calKey,
    "Content-Type": "application/json",
  };

  // 1. Check availability for THIS specific van only (events tagged with its name).
  try {
    const url =
      `${CAL_GW}/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
      `?singleEvents=true&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
      `&privateExtendedProperty=${encodeURIComponent(`van=${d.van}`)}`;
    const list = await fetch(url, { headers: calHeaders });
    if (list.ok) {
      const data = (await list.json()) as { items?: unknown[] };
      if ((data.items?.length ?? 0) > 0) {
        return { ok: false, error: "slot_taken" };
      }
    }
  } catch {
    // if the check fails, continue and still attempt booking
  }

  const price = vanPrice(d.hours, d.outsideRadius);

  // 2. Create a dedicated calendar event named after the van.
  let eventLink = "";
  try {
    const ev = await fetch(`${CAL_GW}/calendars/${encodeURIComponent(CALENDAR_ID)}/events`, {
      method: "POST",
      headers: calHeaders,
      body: JSON.stringify({
        summary: `Carrinha ${d.van} — ${d.name}`,
        description: `Aluguer de Carrinha — Oficina Vale\nCarrinha: ${d.van}\nCliente: ${d.name}\nTelefone: ${d.phone}${d.email ? `\nEmail: ${d.email}` : ""}\nDuração: ${d.hours}h\nFora do raio de 50 km: ${d.outsideRadius ? "Sim (+10€)" : "Não"}\nValor estimado: ${price}€\n\nDocumentos necessários (enviar por WhatsApp ou email): Cartão de Cidadão ou Passaporte, Carta de Condução, Comprovativo de Morada.`,
        start: { dateTime: startLocal, timeZone: TZ },
        end: { dateTime: endLocal, timeZone: TZ },
        extendedProperties: { private: { van: d.van, type: "aluguer" } },
      }),
    });
    if (ev.ok) {
      const evData = (await ev.json()) as { htmlLink?: string };
      eventLink = evData.htmlLink ?? "";
    }
  } catch {
    // non-fatal
  }

  // 3. Log the rental in the spreadsheet.
  try {
    const row = [
      new Date().toLocaleString("pt-PT", { timeZone: TZ }),
      d.name,
      d.phone,
      `Carrinha ${d.van}`,
      d.email ?? "",
      "Aluguer de Carrinha",
      d.dateLabel,
      `${d.startTime}–${endTime}`,
      `${d.hours}h`,
      `${price}€`,
      eventLink,
    ];
    await fetch(
      `${SHEETS_GW}/spreadsheets/${SPREADSHEET_ID}/values/Clientes!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": sheetsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      },
    );
  } catch {
    // non-fatal
  }

  return { ok: true, eventCreated: !!eventLink, eventLink, price, endTime };
}

// Return the busy time windows for a specific van on a given day, so the UI can
// hide/disable start slots that are already taken. Times are expressed in
// minutes-from-midnight in Lisbon local time for trivial client-side comparison.
export type VanBusy = { startMin: number; endMin: number };

function minutesInTz(iso: string, dateISO: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const localDate = `${get("year")}-${get("month")}-${get("day")}`;
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  // If the event spills onto a different day than the one requested, clamp.
  if (localDate < dateISO) return 0;
  if (localDate > dateISO) return 24 * 60;
  return mins;
}

export async function getVanBusy(
  van: Van,
  dateISO: string,
): Promise<{ ok: true; busy: VanBusy[] } | { ok: false; error: "missing_keys" | "invalid" }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const calKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!lovableKey || !calKey) return { ok: false, error: "missing_keys" };
  if (!VANS.includes(van) || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return { ok: false, error: "invalid" };
  }

  const offset = tzOffset(new Date(`${dateISO}T00:00:00Z`), TZ);
  const timeMin = `${dateISO}T00:00:00${offset}`;
  const timeMax = `${dateISO}T23:59:59${offset}`;

  const calHeaders = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": calKey,
    "Content-Type": "application/json",
  };

  try {
    const url =
      `${CAL_GW}/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
      `?singleEvents=true&orderBy=startTime` +
      `&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
      `&privateExtendedProperty=${encodeURIComponent(`van=${van}`)}`;
    const list = await fetch(url, { headers: calHeaders });
    if (!list.ok) return { ok: true, busy: [] };
    const data = (await list.json()) as {
      items?: {
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
      }[];
    };
    const busy: VanBusy[] = (data.items ?? [])
      .map((it) => {
        const startIso = it.start?.dateTime ?? (it.start?.date ? `${it.start.date}T00:00:00` : "");
        const endIso = it.end?.dateTime ?? (it.end?.date ? `${it.end.date}T00:00:00` : "");
        if (!startIso || !endIso) return null;
        return {
          startMin: it.start?.date ? 0 : minutesInTz(startIso, dateISO),
          endMin: it.end?.date ? 24 * 60 : minutesInTz(endIso, dateISO),
        };
      })
      .filter((b): b is VanBusy => b !== null && b.endMin > b.startMin);
    return { ok: true, busy };
  } catch {
    return { ok: true, busy: [] };
  }
}