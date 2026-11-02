import { useState } from "react";
import {
  CheckboxIcon,
  CopyIcon,
  DotsHorizontalIcon,
  DragHandleDots2Icon,
  EyeOpenIcon,
  FileTextIcon,
  LockClosedIcon,
  PlusIcon,
  ChatBubbleIcon,
  CardStackIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/cn";
import {
  TODAY,
  addDays,
  formatAmount,
  invoiceTotals,
  lineFromArticle,
  ocrFor,
  type Invoice,
  type InvoiceLine,
} from "./data";
import {
  Field,
  FooterButton,
  Grid,
  NotInLedger,
  RecordFooter,
  RecordHeader,
  Section,
  Segmented,
  Select,
  TextArea,
  TextInput,
} from "./formUi";
import { useKvittra } from "./store";

function blankInvoice(no: number): Invoice {
  return {
    no,
    customerNo: null,
    type: "invoice",
    invoiceDate: TODAY,
    dueDate: addDays(TODAY, 30),
    deliveryDate: "",
    currency: "SEK",
    ourRef: "Peder Madsen",
    yourRef: "",
    orderNo: "",
    text: "",
    lines: [],
  };
}

function num(value: string) {
  const n = Number(value.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function LinesTable({ lines, onChange }: { lines: InvoiceLine[]; onChange: (lines: InvoiceLine[]) => void }) {
  const { articles } = useKvittra();
  const head = "border-b-2 border-r border-gray-200 border-b-gray-300 px-2 text-left text-[11px] font-bold uppercase";
  const cell = "border-r border-b border-gray-200 px-2";
  const cellInput = "h-9 w-full bg-transparent text-xs outline-none";

  function update(i: number, patch: Partial<InvoiceLine>) {
    onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  function setArticle(i: number, articleNo: string) {
    const article = articles.find((a) => a.no === Number(articleNo));
    if (article) update(i, { ...lineFromArticle(article, lines[i].qty || 1) });
  }

  const totalQty = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
        <colgroup>
          <col style={{ width: "10%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "11%" }} />
        </colgroup>
        <thead>
          <tr className="h-10 text-gray-900">
            <th className={head}>Article no</th>
            <th className={head}>Description</th>
            <th className={cn(head, "text-right")}>Qty</th>
            <th className={head}>Unit</th>
            <th className={cn(head, "text-right")}>Unit price</th>
            <th className={cn(head, "text-right")}>Discount</th>
            <th className={cn(head, "text-right")}>Amount</th>
            <th className={head}>VAT</th>
            <th className={head}>Account</th>
            <th className={cn(head, "text-right")}>Margin %</th>
            <th className="border-b-2 border-b-gray-300" />
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="h-10">
              <td className={cell}>
                <select
                  className={cn(cellInput, "appearance-none")}
                  value={line.articleNo ?? ""}
                  onChange={(e) => setArticle(i, e.target.value)}
                >
                  <option value="">—</option>
                  {articles.map((a) => (
                    <option key={a.no} value={a.no}>
                      {a.no}
                    </option>
                  ))}
                </select>
              </td>
              <td className={cell}>
                <input className={cellInput} value={line.name} onChange={(e) => update(i, { name: e.target.value })} />
              </td>
              <td className={cell}>
                <input
                  className={cn(cellInput, "text-right tabular-nums")}
                  value={formatAmount(line.qty)}
                  onChange={(e) => update(i, { qty: num(e.target.value) })}
                />
              </td>
              <td className={cn(cell, "text-gray-700")}>{line.unit}</td>
              <td className={cn(cell, "text-right tabular-nums")}>{formatAmount(line.price)}</td>
              <td className={cn(cell, "text-right tabular-nums")}>
                <span className="flex items-center justify-between gap-1">
                  <UpdateIcon className="h-3 w-3 text-gray-400" />
                  {line.discount ? `-${formatAmount(line.discount)} %` : ""}
                </span>
              </td>
              <td className={cn(cell, "text-right tabular-nums")}>
                {formatAmount(line.qty * line.price * (1 - line.discount / 100))}
              </td>
              <td className={cell}>25</td>
              <td className={cell}>{line.unit === "h" ? "3041" : "3001"}</td>
              <td className={cell} />
              <td className="border-b border-gray-200 px-2">
                <span className="flex items-center justify-around text-gray-400">
                  <DotsHorizontalIcon className="h-3.5 w-3.5" />
                  <button type="button" onClick={() => onChange(lines.filter((_, j) => j !== i))} title="Remove row">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                  <DragHandleDots2Icon className="h-3.5 w-3.5" />
                </span>
              </td>
            </tr>
          ))}
          <tr className="h-10 bg-[#F7F7F7]">
            <td className="border-r border-gray-200 px-2" colSpan={2}>
              <button
                type="button"
                onClick={() => onChange([...lines, { articleNo: null, name: "", qty: 1, unit: "h", price: 0, discount: 0 }])}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8]"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add row
              </button>
            </td>
            <td className="border-r border-gray-200 px-2 text-right text-gray-600 tabular-nums">
              {formatAmount(totalQty)}
            </td>
            <td colSpan={6} className="border-r border-gray-200" />
            <td className="border-r border-gray-200 px-2 text-right text-gray-600">0,00</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function InvoiceForm({ no }: { no: number | null }) {
  const { invoices, customers, saveInvoice, navigate, nextNo } = useKvittra();
  const existing = no === null ? undefined : invoices.find((inv) => inv.no === no);
  const [draft, setDraft] = useState<Invoice>(() => existing ?? blankInvoice(nextNo(invoices)));
  const [creditInvoice, setCreditInvoice] = useState<"yes" | "no">("no");
  const [pricesInclVat, setPricesInclVat] = useState<"yes" | "no">("no");
  const [paymentTerms, setPaymentTerms] = useState("30 days");
  const [deliveryMethod, setDeliveryMethod] = useState(existing ? "Post" : "");
  const [deliveryTerms, setDeliveryTerms] = useState(existing ? "Free to customer" : "");

  const customer = customers.find((c) => c.no === draft.customerNo);
  const totals = invoiceTotals(draft);
  const isNew = !existing;

  function set<K extends keyof Invoice>(key: K, value: Invoice[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function step(delta: -2 | -1 | 1 | 2) {
    const sorted = [...invoices].sort((a, b) => a.no - b.no);
    const index = sorted.findIndex((inv) => inv.no === draft.no);
    const target =
      delta === -2
        ? sorted[0]
        : delta === 2
          ? sorted[sorted.length - 1]
          : sorted[Math.min(sorted.length - 1, Math.max(0, (index === -1 ? sorted.length : index) + delta))];
    if (target) navigate("invoices", { mode: "edit", no: target.no });
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F0F0F0]">
      <RecordHeader
        title={`Customer invoice ${draft.no}${isNew ? "*" : ""}`}
        meta={
          <>
            OCR: {ocrFor(draft.no)}
            {isNew && "*"}
            <br />
            VER.NO:
          </>
        }
        createLabel="Create invoice"
        onCreate={() => navigate("invoices", { mode: "create" })}
        onShowList={() => navigate("invoices")}
        onStep={step}
        actions={[
          { icon: FileTextIcon, label: "Create credit invoice", disabled: true },
          { icon: CardStackIcon, label: "Payments" },
          { icon: CopyIcon, label: "Copy" },
          { icon: CheckboxIcon, label: "Credit check" },
          { icon: LockClosedIcon, label: "Mark as not ready" },
          { icon: ChatBubbleIcon, label: "Comment" },
          { icon: EyeOpenIcon, label: "Preview" },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto px-6 pt-3 pb-6">
        <Grid>
          <Field label="Customer">
            <Select
              value={draft.customerNo ? String(draft.customerNo) : ""}
              placeholder="Customer no, Name, Org/Personal no"
              options={customers.map((c) => ({ value: String(c.no), label: c.name }))}
              onChange={(v) => set("customerNo", v ? Number(v) : null)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice date">
              <TextInput value={draft.invoiceDate} onChange={(v) => set("invoiceDate", v)} icon="calendar" />
            </Field>
            <Field label="Due date">
              <TextInput value={draft.dueDate} onChange={(v) => set("dueDate", v)} icon="calendar" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice type">
              <Segmented
                value={draft.type}
                options={[
                  { value: "invoice", label: "Invoice" },
                  { value: "cash", label: "Cash invoice" },
                ]}
                onChange={(v) => set("type", v)}
              />
            </Field>
            <Field label="Credit invoice">
              <Segmented
                value={creditInvoice}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                onChange={setCreditInvoice}
              />
            </Field>
          </div>
        </Grid>

        <Section title="Invoice details">
          <Grid>
            <Field label="Payment terms">
              <Select
                value={paymentTerms}
                options={["10 days", "15 days", "30 days", "60 days"]}
                onChange={setPaymentTerms}
              />
            </Field>
            <Field label="Our reference">
              <TextInput value={draft.ourRef} onChange={(v) => set("ourRef", v)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price list">
                <Select value="Price list A" options={["Price list A", "Price list B"]} />
              </Field>
              <Field label="Prices incl. VAT">
                <Segmented
                  value={pricesInclVat}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  onChange={setPricesInclVat}
                />
              </Field>
            </div>
            <div />
            <Field label="Your order number">
              <TextInput value={draft.orderNo} onChange={(v) => set("orderNo", v)} />
            </Field>
            <Field label="Your reference">
              <TextInput value={draft.yourRef} onChange={(v) => set("yourRef", v)} />
            </Field>
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
              <Field label="Currency">
                <Select
                  value={draft.currency}
                  options={["SEK", "EUR", "USD"]}
                  onChange={(v) => set("currency", v as Invoice["currency"])}
                />
              </Field>
              <Field label="Rate">
                <TextInput value="1.0000" disabled />
              </Field>
              <Field label="Unit">
                <TextInput value="1" disabled />
              </Field>
            </div>
            <div />
            <div />
            <div />
            <NotInLedger label="VAT type" value={existing ? "SE" : ""} />
          </Grid>
        </Section>

        <Section title="Customer details">
          <Grid>
            <Field label="Name">
              <TextInput value={customer?.name ?? ""} />
            </Field>
            <Field label="Invoice address">
              <TextInput value={customer?.address ?? ""} />
            </Field>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Field label="Postcode">
                <TextInput value={customer?.postcode ?? ""} />
              </Field>
              <Field label="City">
                <TextInput value={customer?.city ?? ""} />
              </Field>
            </div>
            <Field label="Phone">
              <TextInput value={customer?.phone ?? ""} />
            </Field>
            <Field label={<span className="text-gray-400">Organisation number</span>}>
              <TextInput value={customer?.orgNo ?? ""} disabled />
            </Field>
            <Field label="Invoice address 2">
              <TextInput value={customer?.address2 ?? ""} />
            </Field>
            <Field label="Country">
              <TextInput value={customer?.country ?? ""} />
            </Field>
            <Field label="Email">
              <TextInput value={customer?.email ?? ""} />
            </Field>
            <div />
            <div />
            <div />
            <NotInLedger label="Email for reminders" />
          </Grid>
        </Section>

        <Section title="Delivery details">
          <Grid>
            <Field label="Name">
              <TextInput value={customer?.name ?? ""} />
            </Field>
            <Field label="Delivery address">
              <TextInput value={customer?.address ?? ""} />
            </Field>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Field label="Postcode">
                <TextInput value={customer?.postcode ?? ""} />
              </Field>
              <Field label="City">
                <TextInput value={customer?.city ?? ""} />
              </Field>
            </div>
            <Field label="Delivery method">
              <Select value={deliveryMethod} placeholder="" options={["Post", "Courier", "Pick-up"]} onChange={setDeliveryMethod} />
            </Field>
            <Field label="Delivery date">
              <TextInput value={draft.deliveryDate} onChange={(v) => set("deliveryDate", v)} icon="calendar" />
            </Field>
            <Field label="Delivery address 2">
              <TextInput value="" />
            </Field>
            <Field label="Country">
              <TextInput value={customer?.country ?? ""} />
            </Field>
            <Field label="Delivery terms">
              <Select
                value={deliveryTerms}
                placeholder=""
                options={["Free to customer", "Ex works", "Delivered duty paid"]}
                onChange={setDeliveryTerms}
              />
            </Field>
          </Grid>
        </Section>

        <LinesTable lines={draft.lines} onChange={(lines) => set("lines", lines)} />

        <div className="mt-6 grid grid-cols-4 gap-x-6 border-t border-gray-300 pt-3">
          <Field label="Invoice text">
            <TextArea value={draft.text} onChange={(v) => set("text", v)} />
          </Field>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Field label={<span className="block text-right">Freight fee</span>}>
                <TextInput value="0,00" align="right" />
              </Field>
              <Field label={<span className="block text-right">Invoice fee</span>}>
                <TextInput value="0,00" align="right" />
              </Field>
              <Field label={<span className="block text-right">Discount (%)</span>}>
                <TextInput value="0,00" align="right" />
              </Field>
            </div>
            <div className="grid grid-cols-[3fr_2fr] gap-3">
              <Field label="Print template">
                <Select value="Standard template" options={["Standard template"]} />
              </Field>
              <Field label="Language">
                <Select value="English" options={["English", "Swedish"]} />
              </Field>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-4 gap-y-3 text-right text-xs">
            {[
              ["Net", totals.net],
              ["Gross", totals.gross],
              ["Total excl. VAT", totals.net],
              ["Total", totals.total],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-gray-600">{label}</div>
                <div className="font-semibold text-gray-900 tabular-nums">{formatAmount(Number(value))}</div>
              </div>
            ))}
            <div />
            <div>
              <div className="text-gray-600">Rounding</div>
              <div className="font-semibold text-gray-900 tabular-nums">{formatAmount(totals.rounding)}</div>
            </div>
            <div>
              <div className="text-gray-600">VAT</div>
              <div className="font-semibold text-gray-900 tabular-nums">{formatAmount(totals.vat)}</div>
            </div>
            <div className="text-sm text-[#E4572E]">
              <div>To pay</div>
              <div className="tabular-nums">
                {formatAmount(totals.total)} {draft.currency}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecordFooter
        left={
          <>
            <FooterButton tone="gray" disabled={isNew}>
              Void
            </FooterButton>
            <FooterButton tone="muted" disabled>
              Create credit invoice
            </FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="gray" onClick={() => navigate("invoices")}>
              Cancel
            </FooterButton>
            <FooterButton
              tone="green"
              onClick={() => {
                saveInvoice(draft);
                navigate("invoices");
              }}
            >
              Save
            </FooterButton>
            <span className="ml-2 flex items-center gap-2 text-xs text-gray-700">
              Distribution
              <span className="w-24">
                <Select value="Email" options={["Email", "Post", "E-invoice"]} />
              </span>
            </span>
            <FooterButton
              tone="green"
              onClick={() => {
                saveInvoice(draft);
                navigate("invoices");
              }}
            >
              Send
            </FooterButton>
          </>
        }
      />
    </div>
  );
}
