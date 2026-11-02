import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  ArchiveIcon,
  AvatarIcon,
  ChatBubbleIcon,
  CopyIcon,
  DashboardIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  FileTextIcon,
  GearIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/cn";
import { ArticleForm } from "./ArticleForm";
import { CustomerForm } from "./CustomerForm";
import { InvoiceForm } from "./InvoiceForm";
import { AgentsPage, ArticlesPage, CustomersPage, EmptyPage, InvoicesPage, OverviewPage } from "./pages";
import { KvittraStoreProvider, useKvittra, type KvittraPage, type Route } from "./store";

// kvittra: a fictional Swedish invoicing product (in English), the demo
// product feedhack is shown on. Page switching and records live in in-memory
// state (store.tsx): no routing, no backend, nothing persists past a reload.

type NavItem = { id: KvittraPage; label: string; icon: ComponentType<{ className?: string }>; create?: boolean };

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: DashboardIcon },
  { id: "agents", label: "Agents", icon: CopyIcon },
  { id: "invoices", label: "Invoices", icon: FileTextIcon, create: true },
  { id: "customers", label: "Customers", icon: PersonIcon, create: true },
  { id: "articles", label: "Articles", icon: ArchiveIcon, create: true },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings", icon: GearIcon },
  { id: "profile", label: "Profile", icon: AvatarIcon },
];

const COMPANY = "Söderberg Konsult AB";

function Header({ navOpen }: { navOpen: boolean }) {
  return (
    <header id="topbar" className="z-20 flex h-10 w-full shrink-0 items-stretch border-b border-gray-300 bg-white">
      <div
        className={cn(
          "flex shrink-0 items-center overflow-hidden border-r border-gray-300 transition-[width] duration-200",
          navOpen ? "w-44 justify-start gap-2 pl-2.5" : "w-10 justify-center",
        )}
      >
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="Kvittra" width={20} height={20} className="h-5 w-5" />
        {navOpen && <img src={`${import.meta.env.BASE_URL}wordmark.svg`} alt="kvittra" width={120} height={32} className="h-5 w-auto" />}
      </div>
      <div className="flex min-w-0 flex-1 items-stretch">
      </div>
      <div className="flex shrink-0 items-stretch border-l border-gray-300">
        <div className="flex items-center px-3 text-xs font-medium text-gray-700">{COMPANY}</div>
        <div className="flex w-10 items-center justify-center border-l border-gray-300 bg-white text-gray-600">
          <ChatBubbleIcon className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

function NavRow({ item, open }: { item: NavItem; open: boolean }) {
  const { route, navigate } = useKvittra();
  const Icon = item.icon;
  const active = item.id === route.page;
  const creating = active && route.view.mode === "create";
  return (
    <div
      className={cn(
        "flex w-full items-center text-sm transition-colors",
        active ? "bg-[#1D4ED8]/10 font-medium text-[#1D4ED8]" : "text-gray-600 hover:bg-black/5",
      )}
    >
      <button
        type="button"
        onClick={() => navigate(item.id)}
        title={item.label}
        className="flex min-w-0 flex-1 items-center text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <Icon className="h-4 w-4" />
        </span>
        {open && <span className="truncate">{item.label}</span>}
      </button>
      {open && item.create && (
        <button
          type="button"
          onClick={() => navigate(item.id, { mode: "create" })}
          title={`New ${item.label.toLowerCase().replace(/s$/, "")}`}
          className={cn(
            "mr-1 flex h-6 w-6 items-center justify-center rounded",
            creating ? "bg-[#1D4ED8]/15 text-[#1D4ED8]" : "text-gray-500 hover:bg-black/10",
          )}
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function LeftNav({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside
      id="sidebar"
      className={cn(
        "flex shrink-0 flex-col border-r border-gray-300 bg-[#FAFAFA] transition-[width] duration-200 select-none",
        open ? "w-44" : "w-10",
      )}
    >
      <nav className="flex flex-col">
        <button
          type="button"
          onClick={onToggle}
          title={open ? "Collapse menu" : "Open menu"}
          className="flex w-full items-center text-sm text-gray-600 hover:bg-black/5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            {open ? (
              <DoubleArrowLeftIcon className="h-4 w-4 opacity-70" />
            ) : (
              <DoubleArrowRightIcon className="h-4 w-4 opacity-70" />
            )}
          </span>
          {open && <span className="truncate pr-3 font-medium text-gray-700">{COMPANY}</span>}
        </button>
        {NAV.map((item) => (
          <NavRow key={item.id} item={item} open={open} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col border-t border-gray-300">
        {FOOTER_NAV.map((item) => (
          <NavRow key={item.id} item={item} open={open} />
        ))}
      </div>
    </aside>
  );
}

function Page({ route }: { route: Route }) {
  const { page, view } = route;
  // Keyed per record so moving between records (or to "create") starts the
  // form from a fresh draft instead of keeping the previous one's edits.
  const no = view.mode === "edit" ? view.no : null;
  const formKey = `${page}-${view.mode}-${no}`;
  switch (page) {
    case "overview":
      return <OverviewPage />;
    case "agents":
      return <AgentsPage />;
    case "invoices":
      return view.mode === "list" ? <InvoicesPage /> : <InvoiceForm key={formKey} no={no} />;
    case "customers":
      return view.mode === "list" ? <CustomersPage /> : <CustomerForm key={formKey} no={no} />;
    case "articles":
      return view.mode === "list" ? <ArticlesPage /> : <ArticleForm key={formKey} no={no} />;
    case "settings":
      return <EmptyPage title="Settings" />;
    case "profile":
      return <EmptyPage title="Profile" />;
  }
}

function Shell() {
  const { route } = useKvittra();
  const [navOpen, setNavOpen] = useState(true);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white text-gray-900">
      <Header navOpen={navOpen} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftNav open={navOpen} onToggle={() => setNavOpen((o) => !o)} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Page route={route} />
        </main>
      </div>
    </div>
  );
}

export function KvittraApp({ initialPage = "invoices" }: { initialPage?: KvittraPage }) {
  return (
    <KvittraStoreProvider initialPage={initialPage}>
      <Shell />
    </KvittraStoreProvider>
  );
}

export const DESIGN_WIDTH = 1440;
export const DESIGN_HEIGHT = 900;

// Renders the app at its real desktop width (1440px) and scales it down to
// the container's width, so it shows the actual layout shrunk rather than a
// cramped responsive version. Its height is the container's height at that
// same scale, so the app fills the container exactly (whatever its aspect
// ratio) with its bottom action bars in view.
export function ScaledKvittra(props: { initialPage?: KvittraPage }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 0, height: DESIGN_HEIGHT });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = width / DESIGN_WIDTH;
      setSize({ scale, height: scale ? height / scale : DESIGN_HEIGHT });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: DESIGN_WIDTH,
          height: size.height,
          transform: `scale(${size.scale})`,
          opacity: size.scale ? 1 : 0,
        }}
      >
        <KvittraApp {...props} />
      </div>
    </div>
  );
}
