import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createVanBooking } from "@/lib/booking.server";

const schema = z.object({
  van: z.enum(["Ronaldo", "Carlos", "Joana"]),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  email: z.string().email().max(120).optional().or(z.literal("")),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  hours: z.number().int().min(2).max(12),
  outsideRadius: z.boolean(),
  dateLabel: z.string().min(2).max(120),
});

export const Route = createFileRoute("/api/van-booking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (await request.json().catch(() => null)) as unknown;
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
        }
        const { email, ...rest } = parsed.data;
        const result = await createVanBooking({ ...rest, email: email || undefined });
        if (!result.ok) {
          const status = result.error === "missing_keys" ? 500 : 200;
          return Response.json({ ok: false, error: result.error }, { status });
        }
        return Response.json({
          ok: true,
          eventCreated: result.eventCreated,
          price: result.price,
          endTime: result.endTime,
        });
      },
    },
  },
});