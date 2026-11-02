import { useState, type ComponentType, type ReactNode } from "react";
import {
  CaretDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrackNextIcon,
  TrackPreviousIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/cn";

// GUI-only copies of kvittra's list-page building blocks (header bar,
// filter tabs, pagination, bordered table, bottom action bar). Classes are
// lifted from kvittra's own components so the mock reads as the real app;
// nothing here fetches or persists anything.

export const GREEN = "#1D4ED8";

type Icon = ComponentType<{ className?: string }>;

export function PillButton({
  tone,
  children,
  disabled,
}: {
  tone: "green" | "yellow" | "slate" | "gray";
  children: ReactNode;
  disabled?: boolean;
}) {
  const tones = {
    green: disabled ? "bg-[#BFDBFE] text-[#1E3A8A] opacity-80" : "bg-[#2563EB] text-white",
    yellow: "bg-[#F97316] text-black font-bold",
    slate: disabled ? "bg-[#C8C8C8] text-white" : "bg-[#5E636B] text-white",
    gray: disabled ? "bg-[#C8C8C8] text-white" : "bg-[#8E8E8E] text-white",
  };
  return (
    <span
      className={cn(
        "flex h-7 shrink-0 items-center gap-1 rounded-full px-4 text-xs font-semibold whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function CreateButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 items-center gap-1.5 rounded-full bg-[#F97316] px-4 text-xs font-bold text-black"
    >
      <PlusIcon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function GetPaidButton() {
  return (
    <span className="flex h-8 items-center rounded-full border border-[#1D4ED8] bg-white px-4 text-xs font-bold text-[#1D4ED8]">
      Get paid now
    </span>
  );
}

function PanelToggle() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A4A4A] text-white">
      <ChevronUpIcon className="h-4 w-4" />
    </span>
  );
}

export type Filter = { label: string; swatch?: "yellow" | "red" | "green" | "gray"; badge?: string };

const SWATCH = { yellow: "bg-[#DCD000]", green: "bg-[#BFDBFE]", red: "bg-[#F7C6C6]", gray: "bg-[#D5D5D5]" };

function FilterTabs({ filters, value, onChange }: { filters: Filter[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((f) => (
        <button
          key={f.label}
          type="button"
          onClick={() => onChange(f.label)}
          className={cn(
            "relative flex h-6 items-center gap-1.5 overflow-hidden rounded border px-2 text-[11px] font-semibold transition-colors",
            f.label === value
              ? "border-gray-500 bg-[#E5E5E5] font-bold text-gray-900 shadow-inner"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
          )}
        >
          {f.swatch && <span className={cn("absolute inset-y-0 left-0 w-2", SWATCH[f.swatch])} />}
          <span className={cn("flex items-center gap-1", f.swatch && "pl-1")}>
            {f.label}
            {f.badge && (
              <span className="rounded bg-[#DBEAFE] px-1 py-px text-[10px] font-bold text-[#1E3A8A]">{f.badge}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function Pagination({ total }: { total: number }) {
  const arrow = "flex h-7 w-6 items-center justify-center text-gray-400";
  return (
    <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
      <span className="flex h-7 w-7 items-center justify-center border border-gray-300 bg-white text-gray-600">
        <HamburgerMenuIcon className="h-4 w-4" />
      </span>
      <span className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="relative flex h-7 w-12 items-center border border-gray-300 bg-white pl-1.5">
          20
          <CaretDownIcon className="absolute right-1 h-3.5 w-3.5 text-gray-500" />
        </span>
        of {total}
      </span>
      <span className="flex overflow-hidden rounded border border-gray-300 bg-white">
        <span className={arrow}>
          <TrackPreviousIcon className="h-3.5 w-3.5" />
        </span>
        <span className={cn(arrow, "border-l border-gray-300")}>
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </span>
        <span className="flex h-7 w-6 items-center justify-center bg-[#1D4ED8] text-xs font-semibold text-white">
          1
        </span>
        <span className={cn(arrow, "border-r border-gray-300 text-gray-600")}>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </span>
        <span className={cn(arrow, "text-gray-600")}>
          <TrackNextIcon className="h-3.5 w-3.5" />
        </span>
      </span>
    </div>
  );
}

export type Column = { label: string; width: string; align?: "right" };
// attrs go on the row's <tr> as they are (data-* for anything that reads the
// page); matches (ListPage) filters on them.
export type Row = { key: string | number; cells: ReactNode[]; tint?: "green"; muted?: number[]; attrs?: Record<string, string | number> };

export function ListPage({
  id,
  title,
  searchPlaceholder,
  headerButtons,
  subActions,
  filters,
  defaultFilter,
  total,
  columns,
  rows,
  matches,
  rowIcons = [],
  onRowClick,
  footer,
}: {
  // Names the list's parts for anything that reads the page: <id>-filters, <id>-table.
  id?: string;
  title: string;
  searchPlaceholder: string;
  headerButtons: ReactNode;
  subActions?: { icon: Icon; label: string; disabled?: boolean }[];
  filters: Filter[];
  defaultFilter: string;
  total: number;
  columns: Column[];
  rows: Row[];
  // Which rows the chosen filter shows; without it the filters only look pressed.
  matches?: (row: Row, filter: string) => boolean;
  rowIcons?: Icon[];
  onRowClick?: (key: Row["key"]) => void;
  footer: (selected: number) => { left: ReactNode; right: ReactNode };
}) {
  const [filter, setFilter] = useState(defaultFilter);
  const shown = matches ? rows.filter((row) => matches(row, filter)) : rows;
  const [selected, setSelected] = useState<Set<Row["key"]>>(() => new Set());
  const { left, right } = footer(selected.size);

  function toggle(key: Row["key"]) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const checkbox = "h-3.5 w-3.5 cursor-pointer accent-[#1D4ED8]";

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F0F0F0]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-300 px-6 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="shrink-0 text-xl font-bold tracking-tight whitespace-nowrap text-slate-900">
            {title}
          </h1>
          <div className="relative w-72 shrink-0">
            <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <div className="flex h-8 items-center border border-gray-300 bg-white pl-8 text-xs text-gray-400 italic">
              {searchPlaceholder}
            </div>
          </div>
          <span className="shrink-0 text-xs whitespace-nowrap text-blue-600">Extended search</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerButtons}
          <PanelToggle />
        </div>
      </div>

      {subActions && (
        <div className="flex shrink-0 items-center justify-end gap-4 border-b border-gray-300 px-6 py-2.5 text-xs text-gray-600">
          {subActions.map(({ icon: Icon, label, disabled }) => (
            <span key={label} className={cn("flex items-center gap-1.5", disabled && "text-gray-400")}>
              <Icon className="h-3.5 w-3.5 text-gray-500" />
              {label}
            </span>
          ))}
        </div>
      )}

      <div id={id && `${id}-filters`} className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-6 py-2.5">
        <FilterTabs filters={filters} value={filter} onChange={setFilter} />
        <Pagination total={matches ? shown.length : total} />
      </div>

      <div className="min-h-0 flex-1 px-6 pt-3 pb-4">
        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table id={id && `${id}-table`} className="w-full table-fixed border-separate border-spacing-0 text-xs">
            <colgroup>
              <col className="w-10" />
              {columns.map((c) => (
                <col key={c.label} style={{ width: c.width }} />
              ))}
              {rowIcons.length > 0 && <col style={{ width: rowIcons.length * 28 + 12 }} />}
            </colgroup>
            <thead>
              <tr className="h-10">
                <th className="border-r border-b-2 border-gray-200 border-b-gray-300">
                  <input
                    type="checkbox"
                    className={checkbox}
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.key)))}
                    aria-label="Select all"
                  />
                </th>
                {columns.map((c, i) => (
                  <th
                    key={c.label}
                    className={cn(
                      "truncate border-r border-b-2 border-gray-200 border-b-gray-300 px-2 text-[11px] font-bold text-gray-900 uppercase",
                      c.align === "right" ? "text-right" : "text-left",
                      i === 0 && "bg-[#F7F7F7]",
                    )}
                  >
                    {c.label}
                  </th>
                ))}
                {rowIcons.length > 0 && <th className="border-b-2 border-b-gray-300 bg-[#F7F7F7]" />}
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr
                  key={row.key}
                  {...row.attrs}
                  onClick={() => onRowClick?.(row.key)}
                  className={cn(
                    "h-10",
                    onRowClick && "cursor-pointer hover:bg-[#F5F5F5]",
                    row.tint === "green" && "bg-[#EFF6FF]",
                    selected.has(row.key) && "bg-[#E0E7FF]",
                  )}
                >
                  <td className="border-r border-b border-gray-200 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className={checkbox}
                      checked={selected.has(row.key)}
                      onChange={() => toggle(row.key)}
                      aria-label={`Select row ${row.key}`}
                    />
                  </td>
                  {row.cells.map((cell, i) => (
                    <td
                      key={columns[i].label}
                      className={cn(
                        "truncate border-r border-b border-gray-200 px-2",
                        columns[i].align === "right" && "text-right tabular-nums",
                        row.muted?.includes(i) ? "text-gray-600" : "font-medium text-gray-900",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                  {rowIcons.length > 0 && (
                    <td className="border-b border-gray-200 bg-[#F7F7F7] px-1.5">
                      <span className="flex items-center justify-end gap-3 text-gray-400">
                        {rowIcons.map((Icon, i) => (
                          <Icon key={i} className="h-3.5 w-3.5" />
                        ))}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-gray-300 px-6 py-2.5">
        <div className="flex items-center gap-3 text-xs text-gray-600">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}

// Label + faux select pairs in the invoice list's bottom bar.
export function FooterSelect({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-2 border-r border-gray-300 pr-2 text-xs text-gray-700 last:border-r-0">
      {label}
      <span className="flex h-7 w-32 items-center justify-between border border-gray-300 bg-white px-2 text-gray-900">
        <span className="truncate">{value}</span>
        <CaretDownIcon className="h-3.5 w-3.5 text-gray-500" />
      </span>
    </span>
  );
}
