import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vanRentalWhatsappLink } from "@/lib/whatsapp";
import { Check, ChevronLeft, MessageCircle, Truck, FileCheck } from "lucide-react";

const VANS = ["Ronaldo", "Carlos", "Joana"] as const;
type Van = (typeof VANS)[number];

const RATE = 10;
const MIN_HOURS = 2;
const RADIUS_FEE = 10;

const START_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];
const HOUR_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

function nextDays(count = 14) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(new Date(d));
  }
  return out;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" });
const formatDateLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

const schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome").max(80),
  phone: z
    .string()
    .trim()
    .min(9, "Telefone inválido")
    .max(20)
    .regex(/^[+0-9\s]+$/, "Telefone inválido"),
  email: z.union([z.literal(""), z.string().trim().email("Email inválido").max(120)]),
  consent: z.literal(true, { errorMap: () => ({ message: "Tem de aceitar a política" }) }),
});

export function VanRentalModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [van, setVan] = useState<Van>(VANS[0]);
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(MIN_HOURS);
  const [outsideRadius, setOutsideRadius] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<
    | null
    | { type: "calendar"; price: number; docsLink: string }
    | { type: "whatsapp"; link: string }
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);
  const [busy, setBusy] = useState<{ startMin: number; endMin: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const dates = useMemo(() => nextDays(14), []);
  const price = hours * RATE + (outsideRadius ? RADIUS_FEE : 0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setVan(VANS[0]);
      setDate(null);
      setStartTime(null);
      setHours(MIN_HOURS);
      setOutsideRadius(false);
      setForm({ name: "", phone: "", email: "", consent: false });
      setDone(null);
      setErrors({});
      setSubmitting(false);
      setSlotTaken(false);
      setBusy([]);
      setLoadingSlots(false);
    }
  }, [open]);

  // Review the calendar for the selected van + day and hide unavailable slots.
  useEffect(() => {
    if (!open || !date) {
      setBusy([]);
      return;
    }
    const dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    let cancelled = false;
    setLoadingSlots(true);
    fetch("/api/van-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ van, dateISO }),
    })
      .then((r) => r.json())
      .then((d: { ok?: boolean; busy?: { startMin: number; endMin: number }[] }) => {
        if (cancelled) return;
        setBusy(d?.ok && Array.isArray(d.busy) ? d.busy : []);
      })
      .catch(() => {
        if (!cancelled) setBusy([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, date, van]);

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  // A start slot is unavailable if it falls inside an existing booking window.
  const isSlotTaken = (slot: string) => {
    const m = toMin(slot);
    return busy.some((b) => m >= b.startMin && m < b.endMin);
  };

  // Clear a chosen start time if it became unavailable after refreshing the calendar.
  useEffect(() => {
    if (startTime && isSlotTaken(startTime)) setStartTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  async function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (e[String(i.path[0])] = i.message));
      setErrors(e);
      return;
    }
    if (!date || !startTime) return;
    setSubmitting(true);
    setSlotTaken(false);

    const dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/van-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          van,
          name: form.name,
          phone: form.phone,
          email: form.email,
          dateISO,
          startTime,
          hours,
          outsideRadius,
          dateLabel: formatDateLong(date),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; price?: number }
        | null;
      if (data && data.ok === false && data.error === "slot_taken") {
        setSlotTaken(true);
        setSubmitting(false);
        setStep(2);
        return;
      }
      if (data && data.ok === true) {
        const docsLink = vanRentalWhatsappLink({
          van,
          date: formatDateLong(date),
          startTime,
          hours,
          outsideRadius,
          price: data.price ?? price,
          name: form.name,
          phone: form.phone,
        });
        setSubmitting(false);
        setDone({ type: "calendar", price: data.price ?? price, docsLink });
        if (typeof window !== "undefined") {
          window.open(docsLink, "_blank", "noopener,noreferrer");
        }
        return;
      }
    } catch {
      // network/server issue — fall back to WhatsApp so the request is never lost
    }

    const link = vanRentalWhatsappLink({
      van,
      date: formatDateLong(date),
      startTime,
      hours,
      outsideRadius,
      price,
      name: form.name,
      phone: form.phone,
    });
    setSubmitting(false);
    setDone({ type: "whatsapp", link });
    if (typeof window !== "undefined") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[calc(100dvh-1.5rem)] bg-surface border-border p-0 overflow-hidden">
        <div className="bg-brand h-1 w-full" />
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              {done ? "Reserva registada" : "Alugar carrinha"}
            </DialogTitle>
            {!done && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full ${n <= step ? "bg-brand" : "bg-white/10"}`}
                  />
                ))}
              </div>
            )}
          </DialogHeader>

          {done ? (
            <div className="mt-6 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/15">
                <Check className="h-7 w-7 text-brand" />
              </div>
              <p className="text-base text-foreground">
                {done.type === "calendar"
                  ? "A carrinha foi reservada na agenda da oficina."
                  : "Abrimos o WhatsApp com a sua reserva preenchida."}
                <br />
                <span className="text-muted-foreground text-sm">
                  Valor estimado:{" "}
                  <strong className="text-foreground">
                    {done.type === "calendar" ? done.price : price}€
                  </strong>
                </span>
              </p>
              <div className="rounded-lg border border-border bg-background p-4 text-left text-sm">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <FileCheck className="h-4 w-4 text-brand" /> Falta enviar os documentos
                </p>
                <p className="mt-2 text-muted-foreground">
                  Para confirmar a reserva, envie por WhatsApp ou email:
                </p>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Cartão de Cidadão ou Passaporte</li>
                  <li>Carta de Condução</li>
                  <li>Comprovativo de Morada</li>
                </ul>
              </div>
              <a
                href={done.type === "calendar" ? done.docsLink : done.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Enviar documentos por WhatsApp
              </a>
              <button
                onClick={() => onOpenChange(false)}
                className="block w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="mt-6">
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Escolha a carrinha (1 por pessoa)</p>
                  <div className="grid grid-cols-1 gap-2">
                    {VANS.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVan(v)}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                          van === v
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-border bg-background hover:border-white/30"
                        }`}
                      >
                        <Truck className="h-5 w-5 text-brand shrink-0" />
                        <span className="font-medium">{v}</span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground space-y-1">
                    <p>Dimensões: 3,10 m (comp.) × 1,75 m (larg.) × 1,90 m (alt.)</p>
                    <p>
                      Preço: <strong className="text-foreground">10€/hora</strong> · mínimo {MIN_HOURS}h
                      · +10€ se sair do raio de 50 km
                    </p>
                  </div>
                  <button
                    className="w-full mt-2 inline-flex items-center justify-center rounded-md px-4 h-10 text-sm font-semibold bg-brand text-brand-foreground hover:opacity-90"
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {slotTaken && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground">
                      A carrinha {van} já está reservada nesse período. Escolha outra hora ou carrinha.
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Dia de levantamento</p>
                    <div className="flex max-w-full min-w-0 gap-2 overflow-x-auto pb-2">
                      {dates.map((d) => {
                        const sel = date && d.toDateString() === date.toDateString();
                        return (
                          <button
                            key={d.toISOString()}
                            onClick={() => setDate(d)}
                            className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs uppercase tracking-wide ${
                              sel
                                ? "border-brand bg-brand/10 text-foreground"
                                : "border-border hover:border-white/30 text-muted-foreground"
                            }`}
                          >
                            {formatDate(d)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Hora de levantamento</p>
                    {!date ? (
                      <p className="text-xs text-muted-foreground">Escolha primeiro o dia.</p>
                    ) : loadingSlots ? (
                      <p className="text-xs text-muted-foreground">A verificar disponibilidade…</p>
                    ) : (
                      (() => {
                        const free = START_SLOTS.filter((s) => !isSlotTaken(s));
                        if (free.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground">
                              Sem horas livres para a {van} neste dia. Escolha outro dia ou carrinha.
                            </p>
                          );
                        }
                        return (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {free.map((s) => (
                              <button
                                key={s}
                                onClick={() => setStartTime(s)}
                                className={`rounded-md border px-2 py-2 text-sm font-medium ${
                                  startTime === s
                                    ? "border-brand bg-brand/10 text-foreground"
                                    : "border-border hover:border-white/30 text-muted-foreground"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Duração (mínimo {MIN_HOURS}h)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {HOUR_OPTIONS.map((h) => (
                        <button
                          key={h}
                          onClick={() => setHours(h)}
                          className={`rounded-md border px-2 py-2 text-sm font-medium ${
                            hours === h
                              ? "border-brand bg-brand/10 text-foreground"
                              : "border-border hover:border-white/30 text-muted-foreground"
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={outsideRadius}
                      onChange={(e) => setOutsideRadius(e.target.checked)}
                      className="mt-0.5 accent-[color:var(--brand)]"
                    />
                    <span>Vou sair do raio de 50 km (adicional fixo de 10€)</span>
                  </label>
                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm flex items-center justify-between">
                    <span className="text-muted-foreground">Valor estimado</span>
                    <span className="text-lg font-display font-bold text-foreground">{price}€</span>
                  </div>
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:border-white/30"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </button>
                    <button
                      disabled={!date || !startTime}
                      onClick={() => setStep(3)}
                      className="inline-flex h-10 min-w-0 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <Field
                    label="Nome"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    error={errors.name}
                    placeholder="O seu nome"
                  />
                  <Field
                    label="Telefone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    error={errors.phone}
                    placeholder="9XX XXX XXX"
                    type="tel"
                  />
                  <Field
                    label="Email (opcional)"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    error={errors.email}
                    placeholder="email@exemplo.pt"
                    type="email"
                  />
                  <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Documentos necessários</p>
                    <p className="mt-1">
                      Após reservar, envie por WhatsApp ou email: Cartão de Cidadão ou Passaporte,
                      Carta de Condução e Comprovativo de Morada.
                    </p>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-0.5 accent-[color:var(--brand)]"
                    />
                    <span>
                      Aceito a{" "}
                      <a href="/privacidade" className="text-foreground underline">
                        política de privacidade
                      </a>
                      .
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:border-white/30"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </button>
                    <button
                      onClick={submit}
                      disabled={submitting}
                      className="inline-flex h-10 min-w-0 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "A reservar…" : "Confirmar reserva"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 bg-background border-border"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}