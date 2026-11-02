import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretDownIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  CounterClockwiseClockIcon,
  DownloadIcon,
  EnvelopeClosedIcon,
  ArchiveIcon,
  Pencil1Icon,
  PersonIcon,
  ReaderIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/cn";
import { MONTHS, STREAMS, formatAmount, invoiceStatus, invoiceTotals, ocrFor, type InvoiceStatus } from "./data";
import { useKvittra } from "./store";
import { CreateButton, FooterSelect, GetPaidButton, ListPage, PillButton } from "./ui";

// What each filter tab of the invoice list shows. The tabs not listed here
// (Not booked, Voided, …) are empty in this mock.
const INVOICE_FILTERS: Record<string, (status: InvoiceStatus) => boolean> = {
  All: () => true,
  "To handle": (status) => status !== "paid",
  Unpaid: (status) => status !== "paid",
  "Unpaid overdue": (status) => status === "overdue",
  "Fully paid": (status) => status === "paid",
};

export function InvoicesPage() {
  const { invoices, customers, navigate } = useKvittra();
  return (
    <ListPage
      title="Invoices"
      searchPlaceholder="Invoice no, OCR, Customer no, Name"
      headerButtons={
        <>
          <GetPaidButton />
          <CreateButton label="Create invoice" onClick={() => navigate("invoices", { mode: "create" })} />
        </>
      }
      subActions={[{ icon: ReaderIcon, label: "Print list" }]}
      filters={[
        { label: "To handle" },
        { label: "All" },
        { label: "Not booked", swatch: "yellow" },
        { label: "Unpaid", swatch: "red" },
        { label: "Unpaid overdue", swatch: "red" },
        { label: "Fully paid", swatch: "green" },
        { label: "Voided", swatch: "gray" },
        { label: "Sellable", swatch: "green", badge: "0 kr" },
        { label: "Year-end", swatch: "red" },
        { label: "Failed" },
      ]}
      defaultFilter="All"
      total={invoices.length}
      id="invoices"
      matches={(row, filter) => (INVOICE_FILTERS[filter] ?? (() => false))(row.attrs?.["data-status"] as InvoiceStatus)}
      columns={[
        { label: "Inv no", width: "7%" },
        { label: "OCR", width: "6%" },
        { label: "Type", width: "4%" },
        { label: "Cust no", width: "6%" },
        { label: "Name", width: "15%" },
        { label: "Inv date", width: "8%" },
        { label: "Del date", width: "8%" },
        { label: "Total", width: "8%", align: "right" },
        { label: "Balance", width: "8%", align: "right" },
        { label: "Currency", width: "6.5%" },
        { label: "Due date", width: "8%" },
        { label: "Paid", width: "8%" },
      ]}
      rows={invoices.map((inv) => {
        const { total } = invoiceTotals(inv);
        const status = invoiceStatus(inv);
        const balance = status === "paid" ? 0 : total;
        const customerName = customers.find((c) => c.no === inv.customerNo)?.name ?? "";
        return {
          key: inv.no,
          tint: status === "paid" ? "green" : undefined,
          muted: [1, 2, 3, 5, 6, 9, 10, 11],
          attrs: {
            "data-invoice": inv.no,
            "data-customer": inv.customerNo ?? "",
            "data-customer-name": customerName,
            "data-issued": inv.invoiceDate,
            "data-due": inv.dueDate,
            "data-amount": total,
            "data-balance": balance,
            "data-currency": inv.currency,
            "data-status": status,
          },
          cells: [
            inv.no,
            ocrFor(inv.no),
            inv.type === "cash" ? "K" : "F",
            inv.customerNo ?? "",
            customerName,
            inv.invoiceDate,
            inv.deliveryDate,
            formatAmount(total),
            formatAmount(balance),
            inv.currency,
            inv.dueDate,
            inv.paidDate ?? "",
          ],
        };
      })}
      onRowClick={(no) => navigate("invoices", { mode: "edit", no: Number(no) })}
      rowIcons={[PersonIcon, EnvelopeClosedIcon, CopyIcon]}
      footer={(selected) => ({
        left: (
          <>
            ({selected} selected)
            <PillButton tone="green" disabled={selected === 0}>
              Year-end transfer
            </PillButton>
          </>
        ),
        right: (
          <>
            <FooterSelect label="Invoice services" value="No invoice services" />
            <FooterSelect label="Distribution" value="Default" />
            <FooterSelect label="Print template" value="Default template" />
            <PillButton tone="gray" disabled={selected === 0}>
              Preview
            </PillButton>
            <PillButton tone="green" disabled={selected === 0}>
              Send
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </PillButton>
          </>
        ),
      })}
    />
  );
}

export function CustomersPage() {
  const { customers, navigate } = useKvittra();
  return (
    <ListPage
      title="Customers"
      searchPlaceholder="Customer no, Name, Org/Personal no"
      headerButtons={
        <CreateButton label="Create customer" onClick={() => navigate("customers", { mode: "create" })} />
      }
      subActions={[
        { icon: EnvelopeClosedIcon, label: "E-invoice requests" },
        { icon: EnvelopeClosedIcon, label: "Invite customers to e-invoice" },
        { icon: ReaderIcon, label: "Print list" },
      ]}
      filters={[{ label: "All" }, { label: "Active" }, { label: "Inactive" }]}
      defaultFilter="All"
      total={27}
      columns={[
        { label: "Cust no", width: "7%" },
        { label: "Name", width: "20%" },
        { label: "Org/Personal no", width: "11%" },
        { label: "Postcode", width: "7%" },
        { label: "City", width: "11%" },
        { label: "Country", width: "9%" },
        { label: "Phone", width: "11%" },
        { label: "Email", width: "18%" },
      ]}
      rows={customers.map((c) => ({
        key: c.no,
        muted: [0, 2, 3, 4, 5, 6, 7],
        cells: [c.no, c.name, c.orgNo, c.postcode, c.city, c.country, c.phone, c.email],
      }))}
      onRowClick={(no) => navigate("customers", { mode: "edit", no: Number(no) })}
      footer={(selected) => ({
        left: (
          <>
            <PillButton tone="gray" disabled={selected === 0}>
              Delete
            </PillButton>
            ({selected} selected)
          </>
        ),
        right: (
          <>
            <PillButton tone="gray" disabled={selected === 0}>
              Deactivate
            </PillButton>
            <PillButton tone="green" disabled={selected === 0}>
              Activate
            </PillButton>
          </>
        ),
      })}
    />
  );
}

export function ArticlesPage() {
  const { articles, navigate } = useKvittra();
  return (
    <ListPage
      title="Articles"
      searchPlaceholder="Article no, Description"
      headerButtons={
        <CreateButton label="Create article" onClick={() => navigate("articles", { mode: "create" })} />
      }
      subActions={[
        { icon: DownloadIcon, label: "Export CSV" },
        { icon: ReaderIcon, label: "Print list" },
        { icon: CounterClockwiseClockIcon, label: "Undo price update", disabled: true },
      ]}
      filters={[{ label: "All" }, { label: "Active" }, { label: "Inactive" }]}
      defaultFilter="Active"
      total={30}
      columns={[
        { label: "Article no", width: "8%" },
        { label: "Description", width: "22%" },
        { label: "Price list A", width: "13%", align: "right" },
        { label: "Cost", width: "11%", align: "right" },
        { label: "In stock", width: "6.5%", align: "right" },
        { label: "Reserved", width: "7.5%", align: "right" },
        { label: "Available", width: "7.5%", align: "right" },
        { label: "Location", width: "7.5%" },
        { label: "Stock value", width: "7.5%", align: "right" },
      ]}
      rows={articles.map((a) => ({
        key: a.no,
        muted: [0, 1, 2, 3],
        cells: [a.no, a.name, formatAmount(a.price), formatAmount(0), "", "", "", "", ""],
      }))}
      onRowClick={(no) => navigate("articles", { mode: "edit", no: Number(no) })}
      rowIcons={[CopyIcon]}
      footer={(selected) => ({
        left: (
          <>
            <PillButton tone="gray" disabled={selected === 0}>
              Delete
            </PillButton>
            ({selected} selected)
          </>
        ),
        right: (
          <>
            <PillButton tone="green" disabled={selected === 0}>
              Activate
            </PillButton>
            <PillButton tone="gray" disabled={selected === 0}>
              Deactivate
            </PillButton>
            <PillButton tone="slate">Update all prices</PillButton>
            <PillButton tone="gray" disabled={selected === 0}>
              Update selected prices
            </PillButton>
          </>
        ),
      })}
    />
  );
}

export function AgentsPage() {
  return (
    <ListPage
      title="Agents"
      searchPlaceholder="Agent name"
      headerButtons={<CreateButton label="New agent" />}
      filters={[{ label: "All" }, { label: "Active" }, { label: "Archived" }]}
      defaultFilter="All"
      total={1}
      columns={[
        { label: "Agent name", width: "24%" },
        { label: "Status", width: "12%" },
        { label: "Invoices", width: "12%", align: "right" },
        { label: "Customers", width: "12%", align: "right" },
        { label: "Articles", width: "12%", align: "right" },
        { label: "Chats", width: "12%", align: "right" },
      ]}
      rows={[
        {
          key: "tab-1",
          tint: "green",
          cells: [
            <span key="n" className="flex items-center gap-2">
              Tab 1 <Pencil1Icon className="h-3 w-3 text-gray-400" />
            </span>,
            <span key="s" className="rounded bg-[#BFDBFE] px-1.5 py-0.5 text-[10px] font-semibold text-[#1E3A8A]">
              Active tab
            </span>,
            0,
            0,
            0,
            1,
          ],
        },
      ]}
      rowIcons={[ChatBubbleIcon, ArchiveIcon, TrashIcon]}
      footer={() => ({ left: null, right: null })}
    />
  );
}

function KpiCard({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "warn";
}) {
  const Arrow = trend === "down" ? ArrowDownIcon : ArrowUpIcon;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
        {value} <span className="text-sm font-normal text-gray-400">kr</span>
      </div>
      <div
        className={cn(
          "mt-2 flex items-center gap-1 text-xs",
          trend === "up" && "text-[#1D4ED8]",
          trend === "down" && "text-gray-600",
          trend === "warn" && "text-[#C2410C]",
        )}
      >
        <Arrow className="h-3.5 w-3.5" />
        {delta}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { articles, invoices } = useKvittra();
  const [period, setPeriod] = useState("Quarter");
  const max = Math.max(...MONTHS.map((_, m) => STREAMS.reduce((sum, s) => sum + s.values[m], 0)));

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#F0F0F0]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-300 px-6 py-3">
        <h1 className="flex items-center gap-3 text-base font-bold tracking-wide text-gray-900 uppercase">
          Overview <span className="font-mono text-sm font-semibold text-[#1D4ED8]">[Q2 2026]</span>
        </h1>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A4A4A] text-white">
          <ChevronUpIcon className="h-4 w-4" />
        </span>
      </div>
      <div className="h-8 shrink-0 border-b border-gray-300" />

      <div className="flex flex-col gap-4 px-6 py-3">
        <div className="flex gap-2">
          {["Month", "Quarter", "Year"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "flex h-6 items-center gap-1.5 rounded border bg-white px-2.5 text-[11px] font-semibold",
                p === period ? "border-gray-500 text-gray-900" : "border-gray-300 text-gray-700",
              )}
            >
              {p}
              <CaretDownIcon className="h-3 w-3 text-gray-500" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Invoiced" value="4 159 363" delta="12.4% vs Q1" trend="up" />
          <KpiCard label="Paid" value="1 084 200" delta="8.1% vs Q1" trend="up" />
          <KpiCard label="Outstanding" value="3 075 163" delta="4.2% lower" trend="down" />
          <KpiCard label="Overdue" value="757 589" delta="11 invoices" trend="warn" />
        </div>

        <div className="grid grid-cols-[1fr_440px] gap-4">
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Revenue per month</div>
                <div className="text-xs text-gray-400">Split by revenue stream · 2026</div>
              </div>
              <div className="flex gap-3 text-xs text-gray-600">
                {STREAMS.map((s) => (
                  <span key={s.name} className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex h-[210px] items-end justify-around border-b border-gray-200 pb-0">
              {MONTHS.map((month, m) => (
                <div key={month} className="flex h-full w-[50px] flex-col-reverse">
                  {STREAMS.map((s) => (
                    <div key={s.name} style={{ height: `${(s.values[m] / max) * 100}%`, background: s.color }} />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-around text-xs text-gray-600">
              {MONTHS.map((m) => (
                <span key={m} className="w-[50px] text-center">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
            <div className="text-sm font-bold text-gray-900">Revenue streams</div>
            <div className="text-xs text-gray-400">Share of the quarter&apos;s revenue</div>
            <div className="mt-4 flex flex-col gap-4">
              {[
                ["Consulting", "570 050 kr", 17, "8%"],
                ["Development", "1 899 310 kr", 57, "11%"],
                ["Licenses", "0 kr", 0, "14%"],
                ["Support & services", "858 000 kr", 26, "17%"],
              ].map(([name, amount, share, delta], i) => (
                <div key={name}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-900">{name}</span>
                    <span className="font-bold text-gray-900">{amount}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">{share}%</span>
                    <span className="font-semibold text-[#1D4ED8]">↑ {delta}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100">
                    <div
                      className="h-full"
                      style={{ width: `${Math.max(Number(share), 5)}%`, background: STREAMS[i].color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_440px] gap-4">
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Pricing — recent changes</div>
                <div className="text-xs text-gray-400">Price changes that affect revenue. Tracked per article.</div>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#1D4ED8]">
                Follow up <ArrowRightIcon className="h-3 w-3" />
              </span>
            </div>
            {articles.slice(12, 15).map(({ name, price }, i) => (
              <div key={name} className="mt-3 flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="text-xs font-semibold text-gray-900">{name}</div>
                  <div className="text-[10px] text-gray-400">Art. {28 + i} · 2026-06-15</div>
                </div>
                <span className="flex items-center gap-3 text-xs text-gray-600 tabular-nums">
                  {formatAmount(price / 1.05)} → {formatAmount(price)}
                  <span className="bg-[#DBEAFE] px-1.5 py-0.5 font-bold text-[#1E3A8A]">+5.0%</span>
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
            <div className="text-sm font-bold text-gray-900">Recent activity</div>
            {invoices
              .slice(-4)
              .reverse()
              .map((inv) => (
                <div key={inv.no} className="mt-3 flex justify-between border-b border-gray-100 pb-3 text-xs">
                  <span className="text-gray-900">Invoice {inv.no} created</span>
                  <span className="text-gray-400">2026-06-27</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyPage({ title }: { title: string }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F0F0F0]">
      <div className="flex shrink-0 items-center border-b border-gray-300 px-6 py-3.5">
        <h1 className="text-base font-bold tracking-wide text-gray-900 uppercase">{title}</h1>
      </div>
    </div>
  );
}
