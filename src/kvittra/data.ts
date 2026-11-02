// Seed data for the kvittra mock. Fictional companies only — this is
// shown on our public marketing page, so no real brands. The mock keeps an
// in-memory copy of it (see store.tsx) that its forms create and edit.

export type Customer = {
  no: number;
  name: string;
  kind: "company" | "private";
  orgNo: string;
  address: string;
  address2: string;
  postcode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  active: boolean;
};

export type Article = {
  no: number;
  name: string;
  price: number;
  unit: "h" | "pcs";
  kind: "goods" | "service";
  account: string;
  active: boolean;
};

export type InvoiceLine = {
  articleNo: number | null;
  name: string;
  qty: number;
  unit: string;
  price: number;
  discount: number; // percent
};

export type Invoice = {
  no: number;
  customerNo: number | null;
  type: "invoice" | "cash";
  invoiceDate: string;
  dueDate: string;
  deliveryDate: string;
  currency: "SEK" | "EUR" | "USD";
  ourRef: string;
  yourRef: string;
  orderNo: string;
  text: string;
  lines: InvoiceLine[];
  paidDate?: string;
};

const RAW_CUSTOMERS: [string, string, string, string, string][] = [
  ["Nordvik Logistik AB", "Hamngatan 2", "405 08", "Gothenburg", "031-66 00 00"],
  ["Almgren Telecom AB", "Torshamnsgatan 21", "164 40", "Kista", "010-719 00 00"],
  ["Strand Kapital AB", "Arsenalsgatan 8", "103 32", "Stockholm", "08-614 20 00"],
  ["Fjällbacka Verktyg AB", "Sickla Industriväg 19", "131 34", "Nacka", "08-743 80 00"],
  ["Järnbruket Sandö AB", "Bruksgatan 1", "811 81", "Sandviken", "026-26 00 00"],
  ["Österlen Bank AB", "Kungsträdgårdsgatan 8", "106 40", "Stockholm", "0771-62 10 00"],
  ["Kustsparbanken AB", "Landsvägen 40", "105 34", "Stockholm", "08-585 900 00"],
  ["Lindqvist & Söner AB", "Kungsträdgårdsgatan 2", "106 70", "Stockholm", "08-701 10 00"],
  ["Mårtensson Mode AB", "Mäster Samuelsgatan 46", "106 38", "Stockholm", "08-796 55 00"],
  ["Vitvara Norden AB", "S:t Göransgatan 143", "105 45", "Stockholm", "08-738 60 00"],
  ["Spelhuset Öresund AB", "Hamngatan 11", "114 34", "Stockholm", "08-562 283 00"],
  ["Molnbro AB", "Lindhagensgatan 74", "111 22", "Stockholm", "08-600 12 00"],
  ["Telenova Sverige AB", "Stjärntorget 1", "169 94", "Solna", "0771-99 00 00"],
  ["Bergmalm Gruv AB", "Gruvvägen 1", "936 81", "Boliden", "0910-77 40 00"],
  ["Hygieia Pappers AB", "Waterfront Building", "101 23", "Stockholm", "08-788 51 00"],
];

function slug(name: string) {
  return name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
}

export const SEED_CUSTOMERS: Customer[] = RAW_CUSTOMERS.map(([name, address, postcode, city, phone], i) => ({
  no: 101 + i,
  name,
  kind: "company",
  orgNo: `5561${String(i + 1).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`,
  address,
  address2: "",
  postcode,
  city,
  country: "Sweden",
  phone,
  email: `billing@${slug(name)}.example`,
  website: `www.${slug(name)}.example`,
  active: true,
}));

const RAW_ARTICLES: [string, number, Article["unit"]][] = [
  ["Web development – WordPress", 950, "h"],
  ["Web development – WordPress + Copilot", 1050, "h"],
  ["Web development – Shopify (Liquid)", 1100, "h"],
  ["Web development – Webflow", 850, "h"],
  ["Web development – Astro", 1250, "h"],
  ["Web development – SvelteKit", 1300, "h"],
  ["Web development – Remix", 1350, "h"],
  ["Web development – Next.js (React)", 1400, "h"],
  ["Web development – Next.js + AI pairing", 1750, "h"],
  ["Web development – Vue/Nuxt", 1200, "h"],
  ["Web development – Legacy ASP.NET", 1550, "h"],
  ["Consulting – AI-assisted development", 1050, "h"],
  ["Consulting – Architecture review", 1450, "h"],
  ["Consulting – UI prototype", 1150, "h"],
  ["Consulting – Code audit", 1000, "h"],
  ["AI chatbot integration", 45000, "pcs"],
  ["SEO optimisation", 900, "h"],
  ["Hosting & maintenance (monthly)", 2500, "pcs"],
];

export const SEED_ARTICLES: Article[] = RAW_ARTICLES.map(([name, price, unit], i) => ({
  no: i + 1,
  name,
  price,
  unit,
  kind: unit === "h" ? "service" : "goods",
  account: unit === "h" ? "3041" : "3001",
  active: true,
}));

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function lineFromArticle(article: Article, qty = 1): InvoiceLine {
  return { articleNo: article.no, name: article.name, qty, unit: article.unit, price: article.price, discount: 0 };
}

// Today, local date. The seed data is dated from it, so what is overdue
// stays overdue whenever the app runs.
const now = new Date();
export const TODAY = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

export type InvoiceStatus = "paid" | "overdue" | "unpaid";

export function invoiceStatus(invoice: Pick<Invoice, "paidDate" | "dueDate">, today = TODAY): InvoiceStatus {
  if (invoice.paidDate) return "paid";
  return invoice.dueDate < today ? "overdue" : "unpaid";
}

// Whole days past the due date for an unpaid invoice; 0 when paid or not yet due.
export function daysOverdue(invoice: Pick<Invoice, "paidDate" | "dueDate">, today = TODAY) {
  if (invoiceStatus(invoice, today) !== "overdue") return 0;
  return Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${invoice.dueDate}T00:00:00Z`)) / 86_400_000);
}

const CURRENCIES = ["SEK", "EUR", "USD"] as const;
const PAID = new Set([1002, 1004, 1007, 1013]);
const REFS = ["Karin Svensson", "Erik Lund", "Sara Holm", "Johan Berg", "Emma Nyström"];

function seedInvoice(no: number, c: Customer, i: number, ageDays: number): Invoice {
  const invoiceDate = addDays(TODAY, -ageDays);
  const dueDate = addDays(invoiceDate, 30);
  // 1–3 deterministic lines per invoice, so totals vary but stay stable.
  const lines = [lineFromArticle(SEED_ARTICLES[i % 11], 8 + ((i * 5) % 40))];
  if (i % 3 !== 2) lines.push(lineFromArticle(SEED_ARTICLES[16], 4 + (i % 6)));
  if (i % 4 === 0) lines.push(lineFromArticle(SEED_ARTICLES[17], 3));
  if (i === 0) lines[0].discount = 10;
  return {
    no,
    customerNo: c.no,
    type: i % 6 === 1 || i % 6 === 5 ? "cash" : "invoice",
    invoiceDate,
    dueDate,
    deliveryDate: addDays(invoiceDate, (i * 3) % 8),
    currency: CURRENCIES[i % 3],
    ourRef: "Anna Lindgren",
    yourRef: REFS[i % REFS.length],
    orderNo: `ORD-${9081 + i * 7}`,
    text: `Web development and maintenance of ${c.name}'s website.`,
    lines,
    paidDate: PAID.has(no) ? addDays(dueDate, -16) : undefined,
  };
}

// One invoice per customer, 4 to 74 days old (so the older ones are past
// their 30 days), then a later invoice for a few customers so a customer can
// have several open at once: [customer index, age in days].
const SECOND_BATCH: [number, number][] = [
  [0, 35],
  [3, 12],
  [5, 48],
  [8, 9],
];

export const SEED_INVOICES: Invoice[] = [
  ...SEED_CUSTOMERS.map((c, i) => seedInvoice(1001 + i, c, i, (SEED_CUSTOMERS.length - 1 - i) * 5 + 4)),
  ...SECOND_BATCH.map(([i, age], k) => seedInvoice(1001 + SEED_CUSTOMERS.length + k, SEED_CUSTOMERS[i], i + 7, age)),
];

export const VAT_RATE = 0.25;

export function invoiceTotals(invoice: Pick<Invoice, "lines">) {
  const gross = invoice.lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const net = invoice.lines.reduce((sum, l) => sum + l.qty * l.price * (1 - l.discount / 100), 0);
  const vat = net * VAT_RATE;
  const total = Math.round(net + vat);
  return { gross, net, vat, rounding: total - (net + vat), total };
}

// Luhn check digit on the invoice number, like a real Swedish OCR reference.
export function ocrFor(no: number) {
  const base = `${no}${String(no).length + 2}`;
  let sum = 0;
  [...base].reverse().forEach((ch, i) => {
    let n = Number(ch) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    sum += n;
  });
  return `${base}${(10 - (sum % 10)) % 10}`;
}

// Overview page: stacked monthly revenue per stream (kSEK).
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;
export const STREAMS = [
  { name: "Consulting", color: "#1E3A8A", values: [95, 110, 80, 95, 140, 210] },
  { name: "Development", color: "#1D4ED8", values: [60, 70, 55, 60, 85, 140] },
  { name: "Licenses", color: "#3B82F6", values: [40, 45, 40, 40, 55, 95] },
  { name: "Support", color: "#D9A21B", values: [30, 35, 25, 35, 45, 65] },
] as const;

export function formatAmount(n: number) {
  return n.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
