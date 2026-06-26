import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createBooking, createVanBooking } from "@/lib/booking.server";

const SYSTEM_PROMPT = `És o "Assistente da Oficina Vale", uma oficina de reparação automóvel multimarca no Seixal, Portugal.

REGRAS ESTRITAS:
- Fala SEMPRE em Português Europeu (pt-PT), nunca em Português do Brasil. Usa "tu" ou "você" de forma natural, tom simpático e direto, frases curtas.
- NUNCA uses formatação Markdown (sem **negrito**, sem *itálico*, sem # títulos, sem listas com - ou *). Escreve em texto simples. Se quiseres listar, usa frases ou separa por vírgulas/novas linhas.
- Horário: Segunda a Sexta, 08:00–18:00. Fechado ao fim de semana. Fora deste horário, informa que a oficina abre às 08:00 e oferece marcação ou recolha de contacto.
- Morada: Praceta José Sebastião e Silva 18, Seixal. Telefone/WhatsApp: +351 962 527 006.
- Preços Oficiais (IVA incluído quando aplicável):
  * Manutenção e Revisões: desde 189,90 € (inclui óleo, filtro de óleo, filtro de ar e check-up de oferta)
  * Travões (Pastilhas de travão): desde 99,90 €
  * Distribuição: desde 349,90 €
  * Embreagem: desde 349,90 €
  * Diagnóstico Eletrónico: 40,00 € + IVA (gratuito se outra reparação for efetuada)
  * Restauro de Faróis: 50,00 € + IVA (por par de faróis)
  * Serviço Inspeção: 100,00 € + IVA (preparação e ida à inspeção)
- Se perguntarem por outros orçamentos: "O orçamento é gratuito — traga o carro ou ligue para o 962 527 006."
- NUNCA dês um diagnóstico mecânico definitivo. Podes dar pistas ("isso parece ser dos travões") e recomendar trazer o carro.
- NUNCA peças dados de pagamento.
- Serviços: Manutenção e Revisões, Travões, Distribuição, Embreagem, Diagnóstico Eletrónico, Restauro de Faróis, Serviço Inspeção. Aceita todas as marcas.

ALUGUER DE CARRINHAS:
- A oficina aluga 3 carrinhas: Ronaldo, Carlos e Joana. Cada cliente só pode alugar UMA carrinha de cada vez.
- Preço: 10€ por hora, com um mínimo de 2 horas. Se o cliente sair do raio de 50 km, há um adicional fixo de 10€.
- Dimensões de cada carrinha: 3,10 m de comprimento, 1,75 m de largura e 1,90 m de altura.
- Para reservar, o cliente TEM de enviar (por WhatsApp ou email) os seguintes documentos: Cartão de Cidadão ou Passaporte, Carta de Condução e Comprovativo de Morada. Lembra sempre o cliente disto.
- Quando o cliente quiser alugar uma carrinha, recolhe (uma pergunta de cada vez): carrinha pretendida (Ronaldo, Carlos ou Joana), data, hora de levantamento, duração em horas (mínimo 2), se vai sair do raio de 50 km, nome e telefone. O email é opcional.
- Quando tiveres todos os dados, confirma o resumo (incluindo o valor estimado) e usa SEMPRE a ferramenta "reservarCarrinha" para verificar a disponibilidade da carrinha e criar a reserva. Cada carrinha tem o seu próprio evento na agenda com o nome da carrinha.
- Se devolver "slot_taken", informa que essa carrinha já está reservada nesse período e sugere outra hora ou outra carrinha.
- Após reservar com sucesso, confirma a reserva e relembra o envio dos documentos por WhatsApp ou email.

MARCAÇÕES:
Quando o cliente quiser marcar, recolhe nesta ordem (uma pergunta de cada vez):
1. Serviço pretendido
2. Data e hora preferida (apenas Seg–Sex entre 08:00 e 18:00)
3. Nome
4. Telefone de contacto
5. Marca, modelo e matrícula do carro

Quando tiveres TODOS os dados, usa SEMPRE a ferramenta "criarMarcacao" para verificar a disponibilidade no calendário do dono e marcar automaticamente. NUNCA envies um link de WhatsApp como forma de marcar — a marcação é feita pela ferramenta.
- Antes de chamar a ferramenta, confirma com o cliente o resumo (serviço, data, hora, nome, telefone e viatura).
- A data deve ser passada no formato AAAA-MM-DD e a hora em HH:MM (24h).
- Se a ferramenta devolver "slot_taken", informa que esse horário já está ocupado e pede outra hora.
- Se a ferramenta devolver sucesso, confirma ao cliente que a marcação ficou registada na agenda da oficina para a data e hora indicadas.
- A data de hoje é ${new Date().toLocaleDateString("pt-PT", { timeZone: "Europe/Lisbon", weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Usa-a para interpretar pedidos como "amanhã" ou "sexta".

Se o cliente não quiser concluir, captura pelo menos o nome e o telefone e diz que a oficina liga de volta no próximo dia útil.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          stopWhen: stepCountIs(5),
          tools: {
            criarMarcacao: tool({
              description:
                "Verifica a disponibilidade no Google Calendar do dono e cria a marcação se o horário estiver livre. Usar apenas quando tiveres todos os dados confirmados.",
              inputSchema: z.object({
                service: z.string().min(2).max(80).describe("Serviço pretendido"),
                name: z.string().min(2).max(80).describe("Nome do cliente"),
                phone: z.string().min(6).max(20).describe("Telefone de contacto"),
                car: z.string().min(2).max(80).describe("Marca e modelo do carro"),
                plate: z.string().min(2).max(15).describe("Matrícula"),
                dateISO: z
                  .string()
                  .regex(/^\d{4}-\d{2}-\d{2}$/)
                  .describe("Data no formato AAAA-MM-DD"),
                time: z
                  .string()
                  .regex(/^\d{2}:\d{2}$/)
                  .describe("Hora no formato HH:MM (24h)"),
              }),
              execute: async (input) => {
                const dateLabel = new Date(`${input.dateISO}T00:00:00`).toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
                const res = await createBooking({ ...input, dateLabel });
                if (!res.ok) {
                  return {
                    ok: false,
                    error: res.error,
                    message:
                      res.error === "slot_taken"
                        ? "Esse horário já está ocupado na agenda. Pede outra hora ao cliente."
                        : "Não foi possível concluir a marcação por um problema técnico.",
                  };
                }
                return {
                  ok: true,
                  message: `Marcação criada na agenda para ${dateLabel} às ${input.time}.`,
                };
              },
            }),
            reservarCarrinha: tool({
              description:
                "Verifica a disponibilidade de uma carrinha específica (Ronaldo, Carlos ou Joana) no calendário e cria a reserva com um evento dedicado se estiver livre. Usar apenas quando tiveres todos os dados confirmados.",
              inputSchema: z.object({
                van: z.enum(["Ronaldo", "Carlos", "Joana"]).describe("Nome da carrinha"),
                name: z.string().min(2).max(80).describe("Nome do cliente"),
                phone: z.string().min(6).max(20).describe("Telefone de contacto"),
                email: z.string().max(120).optional().describe("Email do cliente (opcional)"),
                dateISO: z
                  .string()
                  .regex(/^\d{4}-\d{2}-\d{2}$/)
                  .describe("Data no formato AAAA-MM-DD"),
                startTime: z
                  .string()
                  .regex(/^\d{2}:\d{2}$/)
                  .describe("Hora de levantamento no formato HH:MM (24h)"),
                hours: z.number().int().min(2).max(12).describe("Duração em horas (mínimo 2)"),
                outsideRadius: z
                  .boolean()
                  .describe("True se o cliente vai sair do raio de 50 km (+10€)"),
              }),
              execute: async (input) => {
                const dateLabel = new Date(`${input.dateISO}T00:00:00`).toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
                const res = await createVanBooking({
                  ...input,
                  email: input.email || undefined,
                  dateLabel,
                });
                if (!res.ok) {
                  return {
                    ok: false,
                    error: res.error,
                    message:
                      res.error === "slot_taken"
                        ? `A carrinha ${input.van} já está reservada nesse período. Sugere outra hora ou outra carrinha.`
                        : "Não foi possível concluir a reserva por um problema técnico.",
                  };
                }
                return {
                  ok: true,
                  message: `Reserva da carrinha ${input.van} criada para ${dateLabel} às ${input.startTime} (${input.hours}h). Valor estimado: ${res.price}€. Relembra o cliente de enviar os documentos (Cartão de Cidadão ou Passaporte, Carta de Condução e Comprovativo de Morada) por WhatsApp ou email.`,
                };
              },
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
