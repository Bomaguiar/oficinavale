import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getVanBusy } from "@/lib/booking.server";

const schema = z.object({
  van: z.enum(["Ronaldo", "Carlos", "Joana"]),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const Route = createFileRoute("/api/van-availability")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (await request.json().catch(() => null)) as unknown;
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
        }
        const result = await getVanBusy(parsed.data.van, parsed.data.dateISO);
        if (!result.ok) {
          const status = result.error === "missing_keys" ? 500 : 400;
          return Response.json({ ok: false, error: result.error }, { status });
        }
        return Response.json({ ok: true, busy: result.busy });
      },
    },
  },
});