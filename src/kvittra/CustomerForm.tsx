import { useState } from "react";
import { CheckboxIcon, MagnifyingGlassIcon, InfoCircledIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import type { Customer } from "./data";
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
  Tabs,
  TextArea,
  TextInput,
  YES_NO,
  yesNo,
} from "./formUi";
import { useKvittra } from "./store";

function blankCustomer(no: number): Customer {
  return {
    no,
    name: "",
    kind: "company",
    orgNo: "",
    address: "",
    address2: "",
    postcode: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    active: true,
  };
}

export function CustomerForm({ no }: { no: number | null }) {
  const { customers, saveCustomer, navigate, nextNo } = useKvittra();
  const existing = no === null ? undefined : customers.find((c) => c.no === no);
  const [draft, setDraft] = useState<Customer>(() => existing ?? blankCustomer(nextNo(customers)));
  const [tab, setTab] = useState<"basic" | "billing">("basic");
  const [notes, setNotes] = useState("");

  function set<K extends keyof Customer>(key: K, value: Customer[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function step(delta: -2 | -1 | 1 | 2) {
    const sorted = [...customers].sort((a, b) => a.no - b.no);
    const index = sorted.findIndex((c) => c.no === draft.no);
    const target =
      delta === -2
        ? sorted[0]
        : delta === 2
          ? sorted[sorted.length - 1]
          : sorted[Math.min(sorted.length - 1, Math.max(0, (index === -1 ? sorted.length : index) + delta))];
    if (target) navigate("customers", { mode: "edit", no: target.no });
  }

  const canSave = draft.name.trim() !== "";

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F0F0F0]">
      <RecordHeader
        title={existing ? `Customer ${draft.no} - Edit` : "Customer - Create new"}
        createLabel="Create customer"
        onCreate={() => navigate("customers", { mode: "create" })}
        onShowList={() => navigate("customers")}
        onStep={existing ? step : undefined}
        actions={[
          { icon: EnvelopeClosedIcon, label: "to e-invoice", bold: "Invite" },
          { icon: InfoCircledIcon, label: "Credit check" },
          { icon: CheckboxIcon, label: "Fetch customer details" },
          { icon: MagnifyingGlassIcon, label: "Look up company" },
        ].slice(0, existing ? 4 : 3)}
      />
      <Tabs
        value={tab}
        tabs={[
          { value: "basic", label: "Basic details" },
          { value: "billing", label: "Billing details" },
        ]}
        onChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-auto px-6 pt-4 pb-6">
        {tab === "basic" ? (
          <>
            <Grid>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer number *">
                  <TextInput value={draft.no} icon="renumber" />
                </Field>
                <Field label="Customer type">
                  <Segmented
                    value={draft.kind}
                    options={[
                      { value: "company", label: "Company" },
                      { value: "private", label: "Private" },
                    ]}
                    onChange={(v) => set("kind", v)}
                  />
                </Field>
              </div>
              <Field label="Org/Personal number">
                <TextInput value={draft.orgNo} onChange={(v) => set("orgNo", v)} />
              </Field>
              <div />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Active">
                  <Segmented value={yesNo(draft.active)} options={YES_NO} onChange={(v) => set("active", v === "yes")} />
                </Field>
              </div>

              <Field label="Name *">
                <TextInput value={draft.name} onChange={(v) => set("name", v)} />
              </Field>
              <Field label="Phone">
                <TextInput value={draft.phone} onChange={(v) => set("phone", v)} />
              </Field>
              <div />
              <div />

              <Field label="Invoice address">
                <TextInput value={draft.address} onChange={(v) => set("address", v)} />
              </Field>
              <Field label="Phone 2">
                <TextInput value="" onChange={() => {}} />
              </Field>
              <div />
              <div />

              <Field label="Invoice address 2">
                <TextInput value={draft.address2} onChange={(v) => set("address2", v)} />
              </Field>
              <Field label="Fax">
                <TextInput value="" onChange={() => {}} />
              </Field>
              <div />
              <div />

              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <Field label="Postcode">
                  <TextInput value={draft.postcode} onChange={(v) => set("postcode", v)} />
                </Field>
                <Field label="City">
                  <TextInput value={draft.city} onChange={(v) => set("city", v)} />
                </Field>
              </div>
              <Field label="Email">
                <TextInput value={draft.email} onChange={(v) => set("email", v)} />
              </Field>
              <div />
              <div />

              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <Field label="Country">
                  <TextInput value={draft.country} onChange={(v) => set("country", v)} />
                </Field>
                <Field label="Country code">
                  <TextInput value={draft.country === "Sweden" ? "SE" : ""} disabled />
                </Field>
              </div>
              <Field label="Website">
                <TextInput value={draft.website} onChange={(v) => set("website", v)} />
              </Field>
            </Grid>

            <Section title="More address details">
              <Grid>
                <Select value="Delivery address" options={["Delivery address", "Visiting address"]} />
              </Grid>
              <Grid className="mt-4">
                <Field label="Name">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <Field label="Phone">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <div />
                <div />
                <Field label="Delivery address">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <Field label="Phone 2">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <div />
                <div />
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <Field label="Postcode">
                    <TextInput value="" onChange={() => {}} />
                  </Field>
                  <Field label="City">
                    <TextInput value="" onChange={() => {}} />
                  </Field>
                </div>
              </Grid>
            </Section>

            <Section title="More customer details">
              <Grid>
                <div className="grid grid-cols-2 gap-3">
                  <NotInLedger label="Industry code (SNI)" />
                  <NotInLedger label="Workplace no (CFAR)" />
                </div>
                <NotInLedger label="Store ID" />
                <Field label="Notes" className="col-span-2">
                  <TextArea value={notes} onChange={setNotes} />
                </Field>
              </Grid>
            </Section>
          </>
        ) : (
          <Grid>
            <Field label="Payment terms">
              <Select value="30 days" options={["10 days", "15 days", "30 days", "60 days"]} />
            </Field>
            <Field label="Price list">
              <Select value="Price list A" options={["Price list A", "Price list B"]} />
            </Field>
            <Field label="Currency">
              <Select value="SEK" options={["SEK", "EUR", "USD"]} />
            </Field>
            <Field label="Distribution">
              <Select value="Email" options={["Email", "Post", "E-invoice"]} />
            </Field>
            <Field label="Our reference">
              <TextInput value="Peder Madsen" onChange={() => {}} />
            </Field>
            <Field label="Your reference">
              <TextInput value="" onChange={() => {}} />
            </Field>
            <Field label="Invoice discount (%)">
              <TextInput value="0,00" align="right" onChange={() => {}} />
            </Field>
            <Field label="VAT type">
              <Select value="SE" options={["SE", "EU reverse charge", "Export"]} />
            </Field>
            <Field label="Invoice email">
              <TextInput value={draft.email} onChange={(v) => set("email", v)} />
            </Field>
            <Field label="Invoice fee">
              <Segmented value="no" options={YES_NO} />
            </Field>
          </Grid>
        )}
      </div>

      <RecordFooter
        left={
          <FooterButton tone="muted" disabled={!existing}>
            Delete
          </FooterButton>
        }
        right={
          <>
            <FooterButton tone="gray" onClick={() => navigate("customers")}>
              Cancel
            </FooterButton>
            <FooterButton
              tone="green"
              disabled={!canSave}
              onClick={() => {
                saveCustomer(draft);
                navigate("customers");
              }}
            >
              Save
            </FooterButton>
          </>
        }
      />
    </div>
  );
}
