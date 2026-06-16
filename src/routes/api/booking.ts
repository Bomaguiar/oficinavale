import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createBooking } from "@/lib/booking.server";

const schema = z.object({
  service: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  car: z.string().min(2).max(80),
  plate: z.string().min(2).max(15),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  dateLabel: z.string().min(2).max(120),
});

export const Route = createFileRoute("/api/booking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (await request.json().catch(() => null)) as unknown;
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
        }
        const result = await createBooking(parsed.data);
        if (!result.ok) {
          const status = result.error === "missing_keys" ? 500 : 200;
          return Response.json({ ok: false, error: result.error }, { status });
        }
        return Response.json({ ok: true, eventCreated: result.eventCreated });
      },
    },
  },
});