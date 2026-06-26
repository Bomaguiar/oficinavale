import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingWhatsappLink } from "@/lib/whatsapp";
import {
  Check,
  ChevronLeft,
  Circle,
  ClipboardCheck,
  Gauge,
  Lightbulb,
  MessageCircle,
  Ruler,
  Settings,
  Wrench,
} from "lucide-react";

const SERVICES = [
  "Manutenção e Revisões",
  "Travões",
  "Distribuição",
  "Embreagem",
  "Diagnóstico Eletrónico",
  "Restauro de Faróis",
  "Serviço Inspeção",
  "Outro",
];

const SERVICE_ICONS: Record<string, React.ElementType<{ className?: string }>> = {
  "Manutenção e Revisões": Wrench,
  Travões: Circle,
  Distribuição: Settings,
  Embreagem: Wrench,
  "Diagnóstico Eletrónico": Gauge,
  "Restauro de Faróis": Lightbulb,
  "Serviço Inspeção": ClipboardCheck,
  Outro: Settings,
};

const SERVICE_PRICING: Record<string, { price: string; note?: string }> = {
  "Manutenção e Revisões": {
    price: "desde 189,90 €",
    note: "Óleo motor, filtro de óleo, filtro de ar + check-up oferta",
  },
  Travões: { price: "desde 99,90 €", note: "Troca de pastilhas de travão" },
  Distribuição: { price: "desde 349,90 €" },
  Embreagem: { price: "desde 349,90 €" },
  "Diagnóstico Eletrónico": {
    price: "49,20 €",
    note: "Gratuito se outra reparação for efetuada",
  },
  "Restauro de Faróis": {
    price: "61,50 €",
    note: "Preço por par",
  },
  "Serviço Inspeção": {
    price: "123,00 €",
  },
};

const SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

function nextWeekdays(count = 14) {
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
  d.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome").max(80),
  phone: z
    .string()
    .trim()
    .min(9, "Telefone inválido")
    .max(20)
    .regex(/^[+0-9\s]+$/, "Telefone inválido"),
  car: z.string().trim().min(2, "Indique a marca e modelo").max(80),
  plate: z.string().trim().min(4, "Matrícula inválida").max(15),
  consent: z.literal(true, { errorMap: () => ({ message: "Tem de aceitar a política" }) }),
});

export function BookingModal({
  open,
  onOpenChange,
  initialService,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialService?: string | null;
}) {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialService ? [initialService] : [SERVICES[0]]
  );
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", car: "", plate: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<
    | null
    | { type: "calendar"; date: string; time: string; link: string }
    | { type: "whatsapp"; link: string }
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);

  const dates = useMemo(() => nextWeekdays(14), []);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedServices(initialService ? [initialService] : [SERVICES[0]]);
      setDate(null);
      setTime(null);
      setDone(null);
      setErrors({});
      setSubmitting(false);
      setSlotTaken(false);
    }
  }, [open, initialService]);

  const toggleService = (s: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(s)) {
        return prev.filter((x) => x !== s);
      }
      return [...prev, s];
    });
  };

  async function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (e[String(i.path[0])] = i.message));
      setErrors(e);
      return;
    }
    if (!date || !time) return;
    setSubmitting(true);
    setSlotTaken(false);

    const dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          name: form.name,
          phone: form.phone,
          car: form.car,
          plate: form.plate.toUpperCase(),
          dateISO,
          time,
          dateLabel: formatDateLong(date),
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (data && data.ok === false && data.error === "slot_taken") {
        setSlotTaken(true);
        setSubmitting(false);
        setStep(2);
        setTime(null);
        return;
      }
      if (data && data.ok === true) {
        // Booking confirmed and added to the calendar — also send a WhatsApp confirmation.
        const link = bookingWhatsappLink({
          service,
          date: formatDateLong(date),
          time,
          name: form.name,
          phone: form.phone,
          car: form.car,
          plate: form.plate.toUpperCase(),
        });
        setSubmitting(false);
        setDone({ type: "calendar", date: formatDateLong(date), time, link });
        if (typeof window !== "undefined") {
          window.open(link, "_blank", "noopener,noreferrer");
        }
        return;
      }
    } catch {
      // network/server issue — fall back to WhatsApp so the booking is never lost
    }

    // Fallback only when the server could not confirm the booking.
    const link = bookingWhatsappLink({
      service,
      date: formatDateLong(date),
      time,
      name: form.name,
      phone: form.phone,
      car: form.car,
      plate: form.plate.toUpperCase(),
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
              {done
                ? done.type === "calendar"
                  ? "Marcação confirmada"
                  : "Marcação enviada"
                : "Marcar serviço"}
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
              {done.type === "calendar" ? (
                <>
                  <p className="text-base text-foreground">
                    O horário estava livre e a sua marcação foi adicionada à agenda da oficina.
                    <br />
                    <span className="text-muted-foreground text-sm">
                      {done.date} às {done.time}. Abrimos o WhatsApp para confirmar com a oficina.
                    </span>
                  </p>
                  <a
                    href={done.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" /> Enviar confirmação por WhatsApp
                  </a>
                </>
              ) : (
                <>
                  <p className="text-base text-foreground">
                    Abrimos o WhatsApp com a sua marcação preenchida.
                    <br />
                    <span className="text-muted-foreground text-sm">
                      Confirme o envio para concluir. Respondemos no horário de funcionamento.
                    </span>
                  </p>
                  <a
                    href={done.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" /> Abrir WhatsApp novamente
                  </a>
                </>
              )}
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
                  <p className="text-sm text-muted-foreground">Que serviço pretende?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map((s) => {
                      const Icon = SERVICE_ICONS[s];
                      const pricing = SERVICE_PRICING[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setService(s)}
                          className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                            service === s
                              ? "border-brand bg-brand/10 text-foreground"
                              : "border-border bg-background hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            <span>{s}</span>
                          </div>
                          {pricing && (
                            <div className="mt-1.5 pl-6">
                              <div className="text-[13px] font-semibold text-brand">
                                {pricing.price}
                              </div>
                              {pricing.note && (
                                <div className="text-[11px] leading-snug text-muted-foreground">
                                  {pricing.note}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Valores indicativos, IVA incluído.
                  </p>
                  <button
                    className="w-full mt-4 inline-flex items-center justify-center rounded-md px-4 h-10 text-sm font-semibold bg-brand text-brand-foreground hover:opacity-90"
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
                      Esse horário já está ocupado. Por favor escolha outra hora.
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Escolha o dia</p>
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
                    <p className="text-sm text-muted-foreground mb-2">Escolha a hora</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SLOTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setTime(s)}
                          className={`rounded-md border px-2 py-2 text-sm font-medium ${
                            time === s
                              ? "border-brand bg-brand/10 text-foreground"
                              : "border-border hover:border-white/30 text-muted-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Apenas dias úteis, 08:00–18:00.
                    </p>
                  </div>
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:border-white/30"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </button>
                    <button
                      disabled={!date || !time}
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
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Marca e modelo"
                      value={form.car}
                      onChange={(v) => setForm({ ...form, car: v })}
                      error={errors.car}
                      placeholder="Ex: VW Golf"
                    />
                    <Field
                      label="Matrícula"
                      value={form.plate}
                      onChange={(v) => setForm({ ...form, plate: v.toUpperCase() })}
                      error={errors.plate}
                      placeholder="00-AA-00"
                    />
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
                      {submitting ? "A confirmar…" : "Confirmar marcação"}
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center pt-1">
                    Ao confirmar, abrimos o WhatsApp com a sua marcação para enviar à oficina.
                  </p>
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
