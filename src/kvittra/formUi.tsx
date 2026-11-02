import { useState, type ComponentType, type ReactNode } from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  HamburgerMenuIcon,
  PlusIcon,
  TrackNextIcon,
  TrackPreviousIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/cn";

// GUI copies of kvittra's record-form building blocks. Four equal columns
// on a 24px gap, 24px-tall bordered inputs, grey page background — matching
// the real create/edit pages for invoices, customers and articles.

type Icon = ComponentType<{ className?: string }>;

const inputBase =
  "h-6 w-full min-w-0 border border-gray-300 bg-white px-2 text-xs text-gray-900 outline-none placeholder:text-gray-400 placeholder:italic focus:border-[#1D4ED8] disabled:bg-[#EDEDED] disabled:text-gray-400";

export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-4 gap-x-6 gap-y-4", className)}>{children}</div>;
}

export function Field({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="truncate text-xs text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  align,
  icon,
}: {
  value: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: "right";
  icon?: "calendar" | "renumber";
}) {
  return (
    <span className="relative flex">
      <input
        className={cn(inputBase, align === "right" && "text-right", icon && "pr-7")}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {icon === "calendar" && (
        <CalendarIcon className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      )}
      {icon === "renumber" && (
        <UpdateIcon className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      )}
    </span>
  );
}

export function TextArea({ value, onChange }: { value: string; onChange?: (value: string) => void }) {
  return (
    <textarea
      className="h-[84px] w-full resize-none border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#1D4ED8]"
      value={value}
      readOnly={!onChange}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function Select({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: readonly string[] | { value: string; label: string }[];
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <span className="relative flex">
      <select
        className={cn(inputBase, "appearance-none pr-7", !value && "text-gray-400 italic")}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
    </span>
  );
}

// Two-option segmented control (Yes/No, Invoice/Cash, Goods/Service...).
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange?: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <span className="flex h-6 border border-gray-300">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(o.value)}
          className={cn(
            "flex-1 truncate px-2 text-[11px]",
            o.value === value ? "bg-white text-gray-900" : "bg-[#E5E5E5] text-gray-500",
            disabled && "opacity-50",
          )}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

export const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const satisfies { value: "yes" | "no"; label: string }[];

export function yesNo(b: boolean) {
  return b ? "yes" : "no";
}

// A field kvittra can't sync to the ledger: hatched, disabled, labelled.
export function NotInLedger({ label, value = "" }: { label: string; value?: string }) {
  return (
    <Field label={<span className="text-gray-400">{label}</span>}>
      <span
        className="flex h-6 items-center justify-between border border-gray-300 px-2 text-xs text-gray-400"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 5px, rgba(0,0,0,0.07) 5px 6px)",
        }}
      >
        {value}
        <span className="text-[10px] italic">Not in the ledger</span>
      </span>
    </Field>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 border-b border-gray-300 pb-1.5 text-left text-xs font-bold text-gray-900"
      >
        <ChevronDownIcon className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
        {title}
      </button>
      {open && <div className="pt-4">{children}</div>}
    </section>
  );
}

export function Tabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-gray-300 px-6">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px border-b-2 pt-3 pb-2 text-sm",
            t.value === value ? "border-gray-900 font-medium text-gray-900" : "border-transparent text-gray-500",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Title bar of a record form: title, record stepper, create + show-list
// buttons, collapse toggle; then the row of secondary actions under it.
export function RecordHeader({
  title,
  meta,
  createLabel,
  onCreate,
  onShowList,
  onStep,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  createLabel: string;
  onCreate: () => void;
  onShowList: () => void;
  onStep?: (delta: -2 | -1 | 1 | 2) => void;
  actions: { icon: Icon; label: string; disabled?: boolean; bold?: string }[];
}) {
  const step = "flex h-7 w-6 items-center justify-center text-gray-600 disabled:text-gray-300";
  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-300 px-6 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold tracking-wide text-gray-900 uppercase">{title}</h1>
          {meta && <div className="text-[10px] leading-tight text-gray-500">{meta}</div>}
        </div>
        <div className="flex items-center gap-2">
          {onStep && (
            <span className="mr-1 flex overflow-hidden rounded border border-gray-300 bg-white">
              <button type="button" className={step} onClick={() => onStep(-2)}>
                <TrackPreviousIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={cn(step, "border-x border-gray-300")} onClick={() => onStep(-1)}>
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={cn(step, "border-r border-gray-300")} onClick={() => onStep(1)}>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={step} onClick={() => onStep(2)}>
                <TrackNextIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={onCreate}
            className="flex h-8 items-center gap-1.5 rounded-full bg-[#6B7280] px-4 text-xs font-bold text-white"
          >
            <PlusIcon className="h-4 w-4" />
            {createLabel}
          </button>
          <button
            type="button"
            onClick={onShowList}
            className="flex h-8 items-center gap-1.5 rounded-full bg-[#F97316] px-4 text-xs font-bold text-black"
          >
            <HamburgerMenuIcon className="h-4 w-4" />
            Show list
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A4A4A] text-white">
            <ChevronUpIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-4 border-b border-gray-300 px-6 py-2.5 text-xs text-gray-600">
        {actions.map(({ icon: ActionIcon, label, disabled, bold }) => (
          <span key={label} className={cn("flex items-center gap-1.5", disabled && "text-gray-300")}>
            <ActionIcon className="h-3.5 w-3.5" />
            {bold && <b className="font-bold text-gray-900">{bold}</b>}
            {label}
          </span>
        ))}
      </div>
    </>
  );
}

export function RecordFooter({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-gray-300 bg-[#F0F0F0] px-6 py-2.5">
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export function FooterButton({
  tone,
  children,
  onClick,
  disabled,
}: {
  tone: "green" | "gray" | "muted";
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 items-center gap-1 rounded-full px-5 text-xs font-semibold whitespace-nowrap",
        tone === "green" && "bg-[#2563EB] text-white",
        tone === "gray" && "bg-[#8E8E8E] text-white",
        tone === "muted" && "bg-[#D5D5D5] text-white",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
    </button>
  );
}
