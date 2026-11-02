import { useState } from "react";
import { BarChartIcon, CopyIcon } from "@radix-ui/react-icons";
import { formatAmount, type Article } from "./data";
import {
  Field,
  FooterButton,
  Grid,
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

function blankArticle(no: number): Article {
  return { no, name: "", price: 0, unit: "h", kind: "goods", account: "", active: true };
}

export function ArticleForm({ no }: { no: number | null }) {
  const { articles, saveArticle, navigate, nextNo } = useKvittra();
  const existing = no === null ? undefined : articles.find((a) => a.no === no);
  const [draft, setDraft] = useState<Article>(() => existing ?? blankArticle(nextNo(articles)));
  const [tab, setTab] = useState<"basic" | "stock">("basic");
  const [priceText, setPriceText] = useState(existing ? formatAmount(existing.price) : "");
  const [notes, setNotes] = useState("");

  function set<K extends keyof Article>(key: K, value: Article[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function step(delta: -2 | -1 | 1 | 2) {
    const sorted = [...articles].sort((a, b) => a.no - b.no);
    const index = sorted.findIndex((a) => a.no === draft.no);
    const target =
      delta === -2
        ? sorted[0]
        : delta === 2
          ? sorted[sorted.length - 1]
          : sorted[Math.min(sorted.length - 1, Math.max(0, (index === -1 ? sorted.length : index) + delta))];
    if (target) navigate("articles", { mode: "edit", no: target.no });
  }

  const canSave = draft.name.trim() !== "";
  const head = "border-b-2 border-r border-gray-200 border-b-gray-300 px-2 text-left text-[11px] font-bold uppercase";
  const cell = "border-r border-gray-200 px-2";

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F0F0F0]">
      <RecordHeader
        title={`Article ${draft.no} - ${existing ? "Edit" : "Create new"}`}
        createLabel="Create article"
        onCreate={() => navigate("articles", { mode: "create" })}
        onShowList={() => navigate("articles")}
        onStep={step}
        actions={[
          { icon: BarChartIcon, label: "Print statistics", disabled: !existing },
          { icon: CopyIcon, label: "Copy article", disabled: !existing },
        ]}
      />
      <Tabs
        value={tab}
        tabs={[
          { value: "basic", label: "Basic details" },
          { value: "stock", label: "Stock details" },
        ]}
        onChange={setTab}
      />

      <div className="min-h-0 flex-1 overflow-auto px-6 pt-4 pb-6">
        {tab === "basic" ? (
          <>
            <Grid>
              <Field label="Article number *">
                <TextInput value={draft.no} icon="renumber" />
              </Field>
              <Field label="Description *" className="col-span-2">
                <TextInput value={draft.name} onChange={(v) => set("name", v)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Active">
                  <Segmented value={yesNo(draft.active)} options={YES_NO} onChange={(v) => set("active", v === "yes")} />
                </Field>
                <Field label="Package article">
                  <Segmented value="no" options={YES_NO} />
                </Field>
              </div>

              <div className="row-span-2 flex flex-col gap-4">
                <Field label="EAN">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <Field label="Supplier">
                  <TextInput value="" placeholder="Supplier no, Name, Org/Personal no" onChange={() => {}} />
                </Field>
              </div>
              <div className="row-span-2 flex flex-col gap-4">
                <Field label="Manufacturer">
                  <Select value="" placeholder="Manufacturer" options={["Nioatta AB", "Other"]} />
                </Field>
                <Field label="Manufacturer article number">
                  <TextInput value="" onChange={() => {}} />
                </Field>
              </div>
              <Field label="Notes" className="row-span-2">
                <TextArea value={notes} onChange={setNotes} />
              </Field>
              <div className="row-span-2 flex flex-col gap-4">
                <Field label="Unit">
                  <Select
                    value={draft.unit}
                    options={[
                      { value: "h", label: "h" },
                      { value: "pcs", label: "pcs" },
                    ]}
                    onChange={(v) => set("unit", v as Article["unit"])}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Article type">
                    <Segmented
                      value={draft.kind}
                      options={[
                        { value: "goods", label: "Goods" },
                        { value: "service", label: "Service" },
                      ]}
                      onChange={(v) => set("kind", v)}
                    />
                  </Field>
                  <Field label="Stock item">
                    <Segmented value={draft.kind === "goods" ? "yes" : "no"} options={YES_NO} disabled={draft.kind === "service"} />
                  </Field>
                  <Field label="External webshop">
                    <Segmented value="no" options={YES_NO} />
                  </Field>
                  <Field label="Discontinued">
                    <Segmented value="no" options={YES_NO} />
                  </Field>
                </div>
              </div>
            </Grid>

            <Section title="Prices">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr className="h-10 text-gray-900">
                      <th className={head}>Price list</th>
                      <th className={head}>Description</th>
                      <th className={head + " text-right"}>Price</th>
                      <th className={head + " text-right"}>Margin %</th>
                      <th className={head + " text-right"}>Margin SEK</th>
                      <th className="border-b-2 border-b-gray-300 px-2 text-left text-[11px] font-bold uppercase">
                        Changed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="h-10">
                      <td className={cell + " bg-[#F7F7F7]"}>A</td>
                      <td className={cell + " bg-[#F7F7F7]"}>Price list A</td>
                      <td className={cell}>
                        <input
                          className="h-9 w-full bg-transparent text-right text-xs tabular-nums outline-none"
                          value={priceText}
                          onChange={(e) => {
                            setPriceText(e.target.value);
                            const n = Number(e.target.value.replace(/\s/g, "").replace(",", "."));
                            if (Number.isFinite(n)) set("price", n);
                          }}
                        />
                      </td>
                      <td className={cell + " text-right tabular-nums"}>{draft.price ? "100,00" : "0,00"}</td>
                      <td className={cell + " text-right tabular-nums"}>{formatAmount(draft.price)}</td>
                      <td className="px-2 text-gray-700">Never changed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Accounting details">
              <Grid>
                <Field label="Sales">
                  <TextInput value={draft.account} placeholder="3001" onChange={(v) => set("account", v)} />
                </Field>
                <Field label="VAT">
                  <Select value="25%" options={["25%", "12%", "6%", "0%"]} />
                </Field>
                <Field label="Sales SE reverse charge">
                  <TextInput value="" onChange={() => {}} />
                </Field>
                <Field label="Sales EU reverse charge">
                  <TextInput value="" placeholder="3108" onChange={() => {}} />
                </Field>
                <Field label="Sales export">
                  <TextInput value="" placeholder="3105" onChange={() => {}} />
                </Field>
                <Field label="Purchases">
                  <TextInput value="" placeholder="4000" onChange={() => {}} />
                </Field>
                <div />
                <Field label="Sales EU VAT liable">
                  <TextInput value="" placeholder="3106" onChange={() => {}} />
                </Field>
              </Grid>
            </Section>
          </>
        ) : (
          <Grid>
            <Field label="In stock">
              <TextInput value="0" align="right" disabled={draft.kind === "service"} />
            </Field>
            <Field label="Reserved">
              <TextInput value="0" align="right" disabled />
            </Field>
            <Field label="Available">
              <TextInput value="0" align="right" disabled />
            </Field>
            <Field label="Stock location">
              <TextInput value="" onChange={() => {}} />
            </Field>
            <Field label="Purchase price">
              <TextInput value="0,00" align="right" onChange={() => {}} />
            </Field>
            <Field label="Stock value">
              <TextInput value="0,00" align="right" disabled />
            </Field>
            <Field label="Reorder point">
              <TextInput value="" align="right" onChange={() => {}} />
            </Field>
            <Field label="Weight (g)">
              <TextInput value="" align="right" onChange={() => {}} />
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
            <FooterButton tone="gray" onClick={() => navigate("articles")}>
              Cancel
            </FooterButton>
            <FooterButton
              tone="green"
              disabled={!canSave}
              onClick={() => {
                saveArticle(draft);
                navigate("articles");
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
