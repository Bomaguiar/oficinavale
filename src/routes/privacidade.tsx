import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Oficina Vale" },
      {
        name: "description",
        content: "Política de privacidade e tratamento de dados pessoais da Oficina Vale.",
      },
      { property: "og:title", content: "Política de Privacidade — Oficina Vale" },
      { property: "og:url", content: "/privacidade" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="min-h-dvh bg-background text-foreground px-4 sm:px-6 py-24">
      <article className="mx-auto max-w-2xl space-y-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar ao início
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Política de Privacidade</h1>
        <p className="text-muted-foreground">
          A Oficina Vale respeita a sua privacidade e cumpre o Regulamento Geral de Proteção de Dados (RGPD).
        </p>

        <Section title="Responsável pelo tratamento">
          Oficina Vale — Praceta José Sebastião e Silva 18, Seixal, Portugal. Contacto: 962 527 006.
        </Section>

        <Section title="Dados recolhidos">
          Quando preenche o formulário de marcação ou contacta o nosso assistente, recolhemos: nome, telefone, marca/modelo/matrícula da viatura e o serviço pretendido. Estes dados são enviados diretamente para o nosso WhatsApp profissional.
        </Section>

        <Section title="Finalidade">
          Os dados são utilizados exclusivamente para responder ao pedido, agendar o serviço e contactar o cliente sobre a marcação. Não são partilhados com terceiros nem usados para marketing.
        </Section>

        <Section title="Conservação">
          Os dados são conservados pelo tempo estritamente necessário à prestação do serviço e ao cumprimento de obrigações legais (contabilísticas e fiscais).
        </Section>

        <Section title="Os seus direitos">
          Pode a qualquer momento solicitar o acesso, retificação ou eliminação dos seus dados, contactando-nos pelo telefone 962 527 006.
        </Section>

        <Section title="Cookies">
          Este site utiliza apenas cookies técnicos essenciais ao seu funcionamento. Não usamos cookies de marketing ou de perfilagem.
        </Section>

        <p className="text-xs text-muted-foreground pt-8">
          Última atualização: {new Date().toLocaleDateString("pt-PT")}
        </p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold mt-8 mb-2">{title}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
