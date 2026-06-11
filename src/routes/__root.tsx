import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "Oficina Vale",
  image: "/og-cover.jpg",
  "@id": "https://oficinavale.pt",
  url: "https://oficinavale.pt",
  telephone: "+351962527006",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Praceta José Sebastião e Silva 18",
    addressLocality: "Seixal",
    addressCountry: "PT",
  },
  geo: { "@type": "GeoCoordinates", latitude: 38.6402, longitude: -9.1031 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "60",
  },
  sameAs: [
    "https://www.facebook.com/oficinavale",
    "https://www.instagram.com/oficinavale",
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que procura não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:opacity-90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo correu mal. Pode tentar novamente ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Oficina Vale — Oficina Auto no Seixal | Marcações Online" },
      {
        name: "description",
        content:
          "Oficina multimarca no Seixal. Manutenção, travões, diagnóstico, pneus e mais. Orçamento gratuito. Marcação online em 30 segundos.",
      },
      { name: "author", content: "Oficina Vale" },
      { name: "theme-color", content: "#0D0D0D" },
      { property: "og:title", content: "Oficina Vale — Oficina Auto no Seixal | Marcações Online" },
      {
        property: "og:description",
        content: "A sua oficina de confiança no Seixal. Marcação online em 30 segundos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_PT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Oficina Vale — Oficina Auto no Seixal | Marcações Online" },
      { name: "description", content: "Bem vindo a oficina Vale, uma oficina onde nos destacamos pela honestidade e profissionalismo e sempre com os melhores preços do mercado, tratamos do seu veícul" },
      { property: "og:description", content: "Bem vindo a oficina Vale, uma oficina onde nos destacamos pela honestidade e profissionalismo e sempre com os melhores preços do mercado, tratamos do seu veícul" },
      { name: "twitter:description", content: "Bem vindo a oficina Vale, uma oficina onde nos destacamos pela honestidade e profissionalismo e sempre com os melhores preços do mercado, tratamos do seu veícul" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/337F5yxA42ZYtKzA4jQVL4JzvMG2/social-images/social-1781197142087-oficinaVale.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/337F5yxA42ZYtKzA4jQVL4JzvMG2/social-images/social-1781197142087-oficinaVale.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(JSONLD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
