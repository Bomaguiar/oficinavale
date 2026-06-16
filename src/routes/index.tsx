import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Wrench,
  Disc3,
  Cpu,
  Gauge,
  Lightbulb,
  ClipboardCheck,
  ArrowRight,
  Check,
  Facebook,
  Instagram,
  Truck,
  Ruler,
  FileCheck,
  Menu,
  X,
} from "lucide-react";

import { BookingModal } from "@/components/BookingModal";
import { VanRentalModal } from "@/components/VanRentalModal";
import { ChatWidget } from "@/components/ChatWidget";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { PHONE, PHONE_DISPLAY, whatsappLink } from "@/lib/whatsapp";

import googleBadge from "@/assets/google-badge.png";
import vanAsset from "@/assets/van.png";
import ownerAsset from "@/assets/owner.png";
import headlightAsset from "@/assets/headlight-before-after.png";
import heroBg from "@/assets/hero-workshop-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oficina Vale — Oficina Auto no Seixal | Marcações Online" },
      {
        name: "description",
        content:
          "Oficina multimarca no Seixal. Manutenção, travões, diagnóstico, pneus, restauro de faróis e pré-IPO. Orçamento gratuito e marcação online em 30 segundos.",
      },
      { property: "og:title", content: "Oficina Vale — Oficina Auto no Seixal" },
      {
        property: "og:description",
        content: "A sua oficina de confiança no Seixal. Marcação online em 30 segundos.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const SERVICES = [
  {
    icon: Wrench,
    name: "Manutenção e Revisões",
    desc: "Mudanças de óleo, filtros, correia. O básico, bem feito.",
  },
  { icon: Disc3, name: "Travões", desc: "Pastilhas, discos e líquido. Para travar a sério." },
  {
    icon: Cpu,
    name: "Diagnóstico Eletrónico",
    desc: "Leitura de avarias com equipamento multimarca.",
  },
  { icon: Gauge, name: "Pneus e Alinhamento", desc: "Montagem, equilibragem e direção a direito." },
  {
    icon: Lightbulb,
    name: "Restauro de Faróis",
    desc: "Faróis novos sem trocar peças. Vê a diferença.",
  },
  {
    icon: ClipboardCheck,
    name: "Pré-Inspeção IPO",
    desc: "Check-up completo antes do centro de inspeções.",
  },
];

const REVIEWS = [
  {
    name: "Bruno Reis",
    date: "Setembro 2024",
    text: "Oficina de qualidade, que demonstra altos conhecimentos mecânicos a todos os níveis, prontos para resolver qualquer avaria. Preço justo e transparência total na resolução. Aconselho vivamente.",
  },
  {
    name: "Carlos Gaudêncio",
    date: "Dezembro 2023",
    text: "Não podia mesmo estar mais contente. Fui comprar o meu primeiro carro e o Xsara que comprei está IMPECÁVEL! Tive a maior sorte em encontrar esta oficina. Ando a sugerir a amigos e família.",
  },
  {
    name: "Américo Jorge Faria",
    date: "Março 2021",
    text: "Estamos perante um atendimento sério e muito profissional. Recomendado para quem tem algum tipo de problema com a sua viatura — nesta oficina o seu carro será altamente bem reparado, com grande profissionalismo e honestidade.",
  },
];

function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);
  const [vanOpen, setVanOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openBooking = (service?: string) => {
    setPreselected(service ?? null);
    setBookingOpen(true);
  };

  const openChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ov-open-chat"));
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CookieBanner />

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2" aria-label="Oficina Vale — início">
            <AnimatedLogo size={22} />
          </a>
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => {
                track("booking_started");
                openBooking();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-brand hover:bg-surface/60"
            >
              <Wrench className="h-4 w-4" /> Marcar Serviço
            </button>
            <button
              onClick={() => {
                track("van_rental_started");
                setVanOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-brand hover:bg-surface/60"
            >
              <Truck className="h-4 w-4" /> Reservar Carrinha
            </button>
            <button
              onClick={() => {
                track("chat_opened");
                openChat();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-brand hover:bg-surface/60"
            >
              <MessageCircle className="h-4 w-4" /> Assistente
            </button>
            <a
              href="#contacto"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-brand hover:bg-surface/60"
            >
              <MapPin className="h-4 w-4" /> Localização
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center">
              {showPhone ? (
                <a
                  href={`tel:${PHONE}`}
                  onClick={() => track("call_clicked")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 h-9 text-sm font-medium text-foreground hover:text-brand"
                >
                  <Phone className="h-4 w-4" />
                  {PHONE_DISPLAY}
                </a>
              ) : (
                <button
                  onClick={() => setShowPhone(true)}
                  aria-label="Mostrar número de telefone"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/60 text-foreground transition hover:text-brand hover:border-brand"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
            </div>
            <a
              href={whatsappLink("Olá! Gostaria de marcar um serviço na Oficina Vale.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_clicked")}
              aria-label="Falar no WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href={`tel:${PHONE}`}
              onClick={() => track("call_clicked")}
              aria-label="Ligar"
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/60 text-foreground transition hover:text-brand hover:border-brand"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE / TABLET MENU */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-3 grid gap-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  track("booking_started");
                  openBooking();
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:text-brand hover:bg-surface/60"
              >
                <Wrench className="h-4 w-4 text-brand" /> Marcar Serviço
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  track("van_rental_started");
                  setVanOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:text-brand hover:bg-surface/60"
              >
                <Truck className="h-4 w-4 text-brand" /> Reservar Carrinha
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  track("chat_opened");
                  openChat();
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:text-brand hover:bg-surface/60"
              >
                <MessageCircle className="h-4 w-4 text-brand" /> Falar com Assistente
              </button>
              <a
                href="#contacto"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:text-brand hover:bg-surface/60"
              >
                <MapPin className="h-4 w-4 text-brand" /> Localização
              </a>
              <a
                href={`tel:${PHONE}`}
                onClick={() => {
                  setMenuOpen(false);
                  track("call_clicked");
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:text-brand hover:bg-surface/60"
              >
                <Phone className="h-4 w-4 text-brand" /> {PHONE_DISPLAY}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative isolate min-h-dvh flex items-center pt-24 pb-32 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-background"
      >
        <img
          aria-hidden
          src={heroBg}
          alt=""
          width={1440}
          height={1600}
          className="absolute inset-0 z-0 h-full w-full object-cover object-right opacity-90"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,13,15,0.9) 0%, rgba(13,13,15,0.62) 46%, rgba(13,13,15,0.08) 100%), linear-gradient(180deg, rgba(13,13,15,0.1) 0%, rgba(13,13,15,0.28) 58%, var(--background) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(227,34,25,0.25), transparent 60%)",
          }}
        />
        <div className="relative z-20 mx-auto max-w-6xl w-full">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Aberto agora · Seg–Sex 08:00–18:00
          </div>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] text-balance max-w-4xl">
            A sua oficina de <span className="text-brand">confiança</span> no Seixal.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl text-balance">
            Reparações honestas, preços transparentes e entrega rápida. Multimarca, sem rodeios.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => {
                track("booking_started");
                openBooking();
              }}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 py-4 text-base font-semibold shadow-glow transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
            >
              <Wrench className="h-5 w-5" /> Marcar Serviço
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                track("van_rental_started");
                setVanOpen(true);
              }}
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-6 py-4 text-base font-medium transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-surface/80 hover:shadow-lg"
            >
              <Truck className="h-5 w-5" /> Reservar Carrinha
            </button>
            <button
              onClick={() => {
                track("chat_opened");
                openChat();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-6 py-4 text-base font-medium transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-surface/80 hover:shadow-lg"
            >
              <MessageCircle className="h-4 w-4" /> Falar com Assistente
            </button>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <img
              src={googleBadge}
              alt="Google 4,9 estrelas"
              className="h-14 w-auto"
              width={56}
              height={56}
            />
            <div className="text-sm">
              <div className="flex items-center gap-1 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
                <span className="ml-1 font-semibold text-foreground">4,9</span>
              </div>
              <p className="text-muted-foreground text-xs">avaliações reais no Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            "Multimarca · todas as marcas",
            "Orçamento gratuito",
            "Preço justo e transparente",
            "Atendimento profissional",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-brand shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="px-4 sm:px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-brand text-sm font-medium uppercase tracking-wider">Serviços</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2">
                Tudo o que o seu carro precisa.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Clique num serviço para marcar diretamente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => {
                  track("booking_started", { service: s.name });
                  openBooking(s.name);
                }}
                className="group text-left rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-brand/60 hover:bg-surface/80 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden"
              >
                {s.name === "Restauro de Faróis" && (
                  <div className="absolute inset-x-0 top-0 h-32 -z-0 opacity-30 group-hover:opacity-50 transition">
                    <img
                      src={headlightAsset}
                      alt=""
                      className="w-full h-full object-cover"
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
                  </div>
                )}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-brand" />
                    </div>
                    <span className="text-xs text-muted-foreground">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-display font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm text-foreground group-hover:text-brand transition">
                    Marcar <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Before/after proof */}
          <div className="mt-16 rounded-2xl border border-border bg-surface overflow-hidden grid md:grid-cols-2">
            <img
              src={headlightAsset}
              alt="Antes e depois de restauro de faróis numa viatura"
              className="w-full h-full object-cover aspect-[4/3] md:aspect-auto"
              loading="lazy"
            />
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <p className="text-brand text-sm font-medium uppercase tracking-wider">
                Antes / Depois
              </p>
              <h3 className="font-display text-3xl font-bold mt-2">
                Faróis como novos. Sem trocar peças.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Restauramos a transparência dos faróis em poucas horas. Mais visibilidade, mais
                segurança, e o seu carro com outra cara.
              </p>
              <button
                onClick={() => openBooking("Restauro de Faróis")}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-brand text-brand-foreground px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
              >
                Marcar restauro <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section id="sobre" className="px-4 sm:px-6 py-24 bg-surface/30 border-y border-border">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-brand/10 blur-3xl rounded-full -z-10" />
            <img
              src={ownerAsset}
              alt="Mecânico da Oficina Vale junto à carrinha da empresa"
              className="rounded-2xl border border-border w-full max-w-md aspect-square object-cover"
              loading="lazy"
            />
            <img
              src={vanAsset}
              alt="Carrinha Oficina Vale"
              className="hidden md:block absolute -bottom-6 -right-6 w-44 rounded-xl border border-border shadow-2xl"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-brand text-sm font-medium uppercase tracking-wider">Quem somos</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-balance">
              Pessoas reais. Reparações honestas.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg">
              Somos uma oficina de bairro no Seixal. Aqui não há surpresas na conta — explicamos o
              problema, mostramos a peça, e só fazemos o que é preciso.
            </p>
            <p className="mt-4 text-muted-foreground">
              Trabalhamos todas as marcas, com equipamento de diagnóstico atualizado e o cuidado de
              quem trata do carro como se fosse o seu.
            </p>
            <button
              onClick={() => openBooking()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 py-3.5 font-semibold transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
            >
              Marcar Serviço <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ALUGUER DE CARRINHAS */}
      <section id="carrinhas" className="px-4 sm:px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-border bg-surface overflow-hidden grid lg:grid-cols-2">
            <div className="relative p-8 sm:p-10 flex flex-col justify-center">
              <p className="text-brand text-sm font-medium uppercase tracking-wider">
                Novo serviço
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-balance">
                Aluguer de carrinhas.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Temos 3 carrinhas disponíveis —{" "}
                <span className="text-foreground font-medium">Ronaldo</span>,{" "}
                <span className="text-foreground font-medium">Carlos</span> e{" "}
                <span className="text-foreground font-medium">Joana</span>. Cada cliente pode alugar
                uma de cada vez.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">10€/hora</strong> · mínimo de 2 horas
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">+10€</strong> se sair do raio de 50 km
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Ruler className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    3,10 m × 1,75 m × 1,90 m (comp. × larg. × alt.)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Documentos por WhatsApp ou email</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm">
                <p className="font-medium text-foreground">Documentos necessários para reservar</p>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Cartão de Cidadão ou Passaporte</li>
                  <li>Carta de Condução</li>
                  <li>Comprovativo de Morada</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  track("van_rental_started");
                  setVanOpen(true);
                }}
                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 py-4 text-base font-semibold shadow-glow transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
              >
                <Truck className="h-5 w-5" /> Reservar Carrinha
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <div className="relative min-h-[280px] bg-background flex items-center justify-center p-8">
              <div className="absolute inset-0 opacity-30">
                <img src={vanAsset} alt="" aria-hidden className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
              </div>
              <img
                src={vanAsset}
                alt="Carrinha de aluguer da Oficina Vale"
                className="relative w-full max-w-sm rounded-xl border border-border shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-4 sm:px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-brand text-sm font-medium uppercase tracking-wider">
                Recomendações
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2">
                O que dizem os nossos clientes.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r) => (
              <figure
                key={r.name}
                className="rounded-2xl border border-border bg-surface p-6 flex flex-col"
              >
                <div className="flex items-center gap-1 text-brand mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-foreground/90 text-[15px] leading-relaxed flex-1">
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Recomenda no Facebook · {r.date}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://www.facebook.com/people/Oficina-Vale/100056785751097/?sk=reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Facebook className="h-4 w-4" /> Ver avaliações no Facebook
            </a>
            <a
              href="https://www.google.com/search?sxsrf=ANbL-n6A76bUvGmOyL4_AL0wVp6mS_qxfA:1781209801349&q=Oficina+Vale+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNLM0tbQwtjAysjQzszAzNDUyttzAyPiKUcQ_LTM5My9RISwxJ1UhKLUsM7W8eBErVmEA3s8aMEkAAAA&rldimm=16959838229668615239&tbm=lcl&hl=en-PT#lkt=LocalPoiReviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Star className="h-4 w-4" /> Ver avaliações no Google
            </a>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="contacto" className="px-4 sm:px-6 py-24 bg-surface/30 border-y border-border">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-brand text-sm font-medium uppercase tracking-wider">Onde estamos</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-balance">
              Praceta José Sebastião e Silva 18, Seixal.
            </h2>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Horário</p>
                  <p className="text-muted-foreground text-sm">Seg–Sex: 08:00 – 18:00</p>
                  <p className="text-muted-foreground text-sm">Sáb–Dom: Encerrado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Telefone / WhatsApp</p>
                  <a
                    href={`tel:${PHONE}`}
                    onClick={() => track("call_clicked")}
                    className="text-muted-foreground text-sm hover:text-foreground"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Morada</p>
                  <p className="text-muted-foreground text-sm">
                    Praceta José Sebastião e Silva 18, Seixal
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Praceta+Jos%C3%A9+Sebasti%C3%A3o+e+Silva+18%2C+Seixal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:border-white/40 hover:shadow-lg"
            >
              <MapPin className="h-4 w-4" /> Como chegar
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border bg-surface min-h-[320px]">
            <iframe
              title="Mapa Oficina Vale"
              src="https://www.google.com/maps?q=Praceta+Jos%C3%A9+Sebasti%C3%A3o+e+Silva+18%2C+Seixal&output=embed"
              className="w-full h-full min-h-[320px] grayscale invert-[0.92] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="assistente"
        className="px-4 sm:px-6 py-24 sm:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(227,34,25,0.95), rgba(227,34,25,0.55) 40%, var(--background) 75%)",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl sm:text-6xl font-bold text-white text-balance">
            O seu carro precisa de atenção?
            <br />
            <span className="opacity-80">Trate disso em 30 segundos.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                track("booking_started");
                openBooking();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-6 py-4 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] active:scale-[0.98]"
            >
              Marcar Agora <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href={whatsappLink("Olá! Gostaria de marcar um serviço na Oficina Vale.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_clicked")}
              className="inline-flex items-center gap-2 rounded-xl bg-black/40 backdrop-blur text-white border border-white/20 px-6 py-4 font-semibold transition-all duration-300 hover:scale-105 hover:bg-black/70 hover:border-white/40 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.25)]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 py-12 border-t border-border">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <AnimatedLogo size={22} />
            <p className="mt-4 text-muted-foreground">
              Oficina auto multimarca no Seixal. Reparação honesta, preço justo.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Contacto</p>
            <p className="text-muted-foreground">Praceta José Sebastião e Silva 18, Seixal</p>
            <a
              href={`tel:${PHONE}`}
              className="block mt-2 text-muted-foreground hover:text-foreground"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="mt-2 text-muted-foreground">Seg–Sex · 08:00 – 18:00</p>
          </div>
          <div>
            <p className="font-semibold mb-3">Siga-nos</p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/people/Oficina-Vale/100056785751097/?sk=reviews"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-brand"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/oficinavale"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-brand"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <a
              href="/privacidade"
              className="block mt-6 text-muted-foreground hover:text-foreground"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Oficina Vale. Todos os direitos reservados.</span>
          <span>Seixal · Portugal</span>
        </div>
      </footer>

      {/* MOBILE STICKY BAR */}
      <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden border-t border-border bg-background/95 backdrop-blur p-3 grid grid-cols-2 gap-2">
        <a
          href={`tel:${PHONE}`}
          onClick={() => track("call_clicked")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-semibold"
        >
          <Phone className="h-4 w-4" /> Ligar
        </a>
        <button
          onClick={() => {
            track("booking_started");
            openBooking();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98]"
        >
          Marcar Agora
        </button>
      </div>

      <ChatWidget />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} initialService={preselected} />
      <VanRentalModal open={vanOpen} onOpenChange={setVanOpen} />
    </div>
  );
}

function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    plausible?: (e: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (cmd: string, e: string, data?: Record<string, unknown>) => void;
  };
  w.plausible?.(event, data ? { props: data } : undefined);
  w.gtag?.("event", event, data);
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("ov-cookie") !== "1") setShow(true);
    } catch {}
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-20 sm:bottom-4 inset-x-2 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50 rounded-xl border border-border bg-surface p-4 text-sm shadow-2xl">
      <p className="text-foreground">
        Usamos cookies essenciais para o funcionamento do site.{" "}
        <a href="/privacidade" className="underline">
          Saber mais
        </a>
        .
      </p>
      <button
        onClick={() => {
          try {
            localStorage.setItem("ov-cookie", "1");
          } catch {}
          setShow(false);
        }}
        className="mt-3 w-full rounded-md bg-brand text-brand-foreground py-2 font-semibold transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
      >
        Aceitar
      </button>
    </div>
  );
}
