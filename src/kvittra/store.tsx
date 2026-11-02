import { createContext, useContext, useState, type ReactNode } from "react";
import {
  SEED_ARTICLES,
  SEED_CUSTOMERS,
  SEED_INVOICES,
  type Article,
  type Customer,
  type Invoice,
} from "./data";

// In-memory state for the kvittra mock: the three registers plus where the
// visitor is in the app. Forms really create and edit records here, so a
// saved invoice shows up in the list — but nothing persists past a reload,
// and there's no backend. Real functionality replaces this later.

export type KvittraPage = "overview" | "agents" | "invoices" | "customers" | "articles" | "settings" | "profile";

export type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; no: number };

export type Route = { page: KvittraPage; view: View };

function upsert<T extends { no: number }>(list: T[], item: T) {
  return list.some((x) => x.no === item.no) ? list.map((x) => (x.no === item.no ? item : x)) : [...list, item];
}

function useStoreState(initialPage: KvittraPage) {
  const [route, setRoute] = useState<Route>({ page: initialPage, view: { mode: "list" } });
  const [invoices, setInvoices] = useState(SEED_INVOICES);
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [articles, setArticles] = useState(SEED_ARTICLES);

  return {
    route,
    navigate: (page: KvittraPage, view: View = { mode: "list" }) => setRoute({ page, view }),
    invoices,
    customers,
    articles,
    saveInvoice: (invoice: Invoice) => setInvoices((list) => upsert(list, invoice)),
    saveCustomer: (customer: Customer) => setCustomers((list) => upsert(list, customer)),
    saveArticle: (article: Article) => setArticles((list) => upsert(list, article)),
    nextNo: (list: { no: number }[]) => Math.max(0, ...list.map((x) => x.no)) + 1,
  };
}

type Store = ReturnType<typeof useStoreState>;

const StoreContext = createContext<Store | null>(null);

export function KvittraStoreProvider({
  initialPage,
  children,
}: {
  initialPage: KvittraPage;
  children: ReactNode;
}) {
  const store = useStoreState(initialPage);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useKvittra() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useKvittra must be used inside KvittraStoreProvider");
  return store;
}
