import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingWhatsappLink } from "@/lib/whatsapp";
import { Check, ChevronLeft, MessageCircle } from "lucide-react";

const SERVICES = [
  "Manutenção e Revisões",
  "Travões",
  "Diagnóstico Eletrónico",
  "Pneus e Alinhamento",
  "Restauro de Faróis",
  "Pré-Inspeção IPO",
  "Outro",
];

const SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30",
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
  d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

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
  const [service, setService] = useState(initialService ?? SERVICES[0]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", car: "", plate: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<null | string>(null);

  const dates = useMemo(() => nextWeekdays(14), []);

  useEffect(() => {
    if (open) {
      setStep(1);
      setService(initialService ?? SERVICES[0]);
      setDate(null);
      setTime(null);
      setDone(null);
      setErrors({});
    }
  }, [open, initialService]);

  function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (e[String(i.path[0])] = i.message));
      setErrors(e);
      return;
    }
    if (!date || !time) return;
    const link = bookingWhatsappLink({
      service,
      date: formatDateLong(date),
      time,
      name: form.name,
      phone: form.phone,
      car: form.car,
      plate: form.plate.toUpperCase(),
    });
    setDone(link);
    if (typeof window !== "undefined") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-surface border-border p-0 overflow-hidden">
        <div className="bg-brand h-1 w-full" />
        <div className="p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              {done ? "Marcação enviada" : "Marcar serviço"}
            </DialogTitle>
            {!done && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full ${
                      n <= step ? "bg-brand" : "bg-white/10"
                    }`}
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
                Abrimos o WhatsApp com a sua marcação preenchida.
                <br />
                <span className="text-muted-foreground text-sm">
                  Confirme o envio para concluir. Respondemos no horário de funcionamento.
                </span>
              </p>
              <a
                href={done}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Abrir WhatsApp novamente
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
                  <p className="text-sm text-muted-foreground">Que serviço pretende?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setService(s)}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                          service === s
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-border bg-background hover:border-white/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
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
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Escolha o dia</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
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
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-border"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      disabled={!date || !time}
                      onClick={() => setStep(3)}
                      className="flex-1 bg-brand hover:opacity-90 text-brand-foreground"
                    >
                      Continuar
                    </Button>
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
                  {errors.consent && (
                    <p className="text-xs text-destructive">{errors.consent}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="border-border"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      onClick={submit}
                      className="flex-1 bg-brand hover:opacity-90 text-brand-foreground"
                    >
                      Confirmar marcação
                    </Button>
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
