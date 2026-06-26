## Add price previews to "Marcar Serviço" modal

Update `src/components/BookingModal.tsx` step 1 (service selection) to show a "desde X€" starting price on each service card, with a small caption for Revisões listing what's included, and a footnote that all prices include VAT.

### Pricing data

Add a `SERVICE_PRICING` map next to `SERVICES`:

```
"Manutenção e Revisões"   → desde 189,90 €
                            (Óleo motor, filtro de óleo, filtro de ar + check-up oferta)
"Travões"                 → desde 99,90 €   (troca de pastilhas)
"Diagnóstico Eletrónico"  → (no price shown)
"Pneus e Alinhamento"     → (no price shown)
"Restauro de Faróis"      → (no price shown)
"Pré-Inspeção IPO"        → (no price shown)
"Distribuição"            → desde 349,90 €   (NEW service entry)
"Embreagem"               → desde 349,90 €   (NEW service entry)
"Outro"                   → (no price shown)
```

Two new services (Distribuição, Embreagem) are added to the `SERVICES` list and `SERVICE_ICONS` map (using `Settings` / `Wrench`-style icons from lucide).

### UI changes (step 1 only)

Each service card becomes a two-line layout:
- Top row: icon + service name (existing)
- Bottom row (when price exists): `desde 189,90 €` in `text-brand` semibold, plus optional caption in `text-[11px] text-muted-foreground` (used for Revisões inclusions; Travões caption "Pastilhas de travão").

Below the grid, add a single footnote line: `Valores indicativos, IVA incluído.` in `text-[11px] text-muted-foreground`.

No other steps, no other files, no business logic changes. Booking flow, WhatsApp message, and server route remain identical.

### Out of scope

- Landing page pricing (user picked modal-only).
- Pricing for diagnostics/pneus/faróis/IPO (not provided).
- Editing the chat bot system prompt to quote prices (can be a follow-up if desired).
