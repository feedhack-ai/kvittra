# kvittra

A fictional Swedish invoicing product, in English: an invoice list with
filters, a customer register, an article register and an invoice form. It is
the demo product that [feedhack](https://feedhack.ai) is shown on, so a
visitor can ask for a change and see it built on these pages.

Everything here is made up. The companies, people, addresses, phone numbers
and amounts are fictional, and any resemblance to a real business is
accidental. There is no backend: records live in memory and reset on reload.

## Run

```
npm ci
npm run dev -- --host --port 5173
```

The seed data is dated from today, so the overdue invoices stay overdue
whenever it runs. Rows in the invoice list carry `data-*` attributes
(invoice, customer, due, amount, balance, status) and the list's parts have
ids (`invoices-filters`, `invoices-table`, `sidebar`, `topbar`), so a change
built on the page has something stable to attach to.

## Layout

- `src/kvittra/KvittraApp.tsx`: the shell (top bar, sidebar, page switch).
- `src/kvittra/pages.tsx`: the list pages; `ui.tsx` the list component.
- `src/kvittra/*Form.tsx`: the create/edit forms; `formUi.tsx` their parts.
- `src/kvittra/data.ts`: the seed data and amounts; `store.tsx` the state.
