import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Lock, Plus, Printer, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdSlot } from "@/components/AdSlot";
import { usePlan } from "@/components/usePlan";
import {
  bumpInvoiceCount,
  emptyInvoice,
  money,
  newId,
  openAd,
  totals,
  type Invoice,
} from "@/lib/invoice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JumpInvoice — Free Unlimited Invoice Generator" },
      {
        name: "description",
        content:
          "Create unlimited professional invoices free with JumpInvoice. Go Pro for Excel exports and an ad-free workspace.",
      },
      { property: "og:title", content: "JumpInvoice — Free Unlimited Invoice Generator" },
      {
        property: "og:description",
        content:
          "Build, print and export invoices in seconds. Unlimited invoices on the free plan; Excel export on Pro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const pro = usePlan();
  const [inv, setInv] = useState<Invoice>(emptyInvoice);
  const t = useMemo(() => totals(inv), [inv]);

  const set = <K extends keyof Invoice>(key: K, value: Invoice[K]) =>
    setInv((p) => ({ ...p, [key]: value }));

  const setItem = (id: string, patch: Partial<Invoice["items"][number]>) =>
    setInv((p) => ({
      ...p,
      items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const addItem = () =>
    setInv((p) => ({
      ...p,
      items: [...p.items, { id: newId(), description: "", quantity: 1, rate: 0 }],
    }));

  const removeItem = (id: string) =>
    setInv((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));

  const handlePrint = () => {
    bumpInvoiceCount();
    if (!pro) openAd();
    window.print();
  };

  const handleExcel = () => {
    const rows = inv.items.map((i) => ({
      Description: i.description,
      Quantity: i.quantity,
      Rate: i.rate,
      Amount: i.quantity * i.rate,
    }));
    const sheet = XLSX.utils.json_to_sheet([
      { Description: `Invoice ${inv.number}`, Quantity: "", Rate: "", Amount: "" },
      { Description: `From: ${inv.fromName}`, Quantity: "", Rate: "", Amount: "" },
      { Description: `Bill to: ${inv.toName}`, Quantity: "", Rate: "", Amount: "" },
      { Description: "", Quantity: "", Rate: "", Amount: "" },
      ...rows,
      { Description: "", Quantity: "", Rate: "", Amount: "" },
      { Description: "Subtotal", Quantity: "", Rate: "", Amount: t.subtotal },
      { Description: `Tax (${inv.taxRate}%)`, Quantity: "", Rate: "", Amount: t.tax },
      { Description: "Total", Quantity: "", Rate: "", Amount: t.total },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Invoice");
    XLSX.writeFile(wb, `${inv.number || "invoice"}.xlsx`);
    bumpInvoiceCount();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print surface-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-bold tracking-tight">
            Jump<span className="opacity-70">Invoice</span>
          </span>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/pricing" className="opacity-80 transition-opacity hover:opacity-100">
              Pricing
            </Link>
            {pro ? (
              <span className="rounded-full bg-navy-foreground/15 px-3 py-1 text-xs font-semibold">
                PRO
              </span>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/pricing">Upgrade</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <section className="no-print surface-navy border-t border-white/5">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-10">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Unlimited invoices, zero friction.
          </h1>
          <p className="mt-4 max-w-xl text-base opacity-80">
            JumpInvoice builds clean, print-ready invoices in your browser. Free forever with
            ads — upgrade to Pro for Excel exports and an ad-free workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href="#builder">Create an invoice</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent hover:bg-white/10"
            >
              <Link to="/pricing">See Pro</Link>
            </Button>
          </div>
        </div>
      </section>

      <main id="builder" className="mx-auto max-w-6xl px-5 py-10">
        {!pro && (
          <div className="mb-6">
            <AdSlot />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="no-print panel space-y-5 p-5">
            <h2 className="text-lg font-semibold">Invoice details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice number">
                <Input value={inv.number} onChange={(e) => set("number", e.target.value)} />
              </Field>
              <Field label="Currency">
                <Input
                  value={inv.currency}
                  onChange={(e) => set("currency", e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Issue date">
                <Input
                  type="date"
                  value={inv.issueDate}
                  onChange={(e) => set("issueDate", e.target.value)}
                />
              </Field>
              <Field label="Due date">
                <Input
                  type="date"
                  value={inv.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                />
              </Field>
              <Field label="From">
                <Input
                  placeholder="Your business"
                  value={inv.fromName}
                  onChange={(e) => set("fromName", e.target.value)}
                />
              </Field>
              <Field label="Bill to">
                <Input
                  placeholder="Client name"
                  value={inv.toName}
                  onChange={(e) => set("toName", e.target.value)}
                />
              </Field>
              <Field label="Your address / details">
                <Textarea
                  rows={3}
                  value={inv.fromDetails}
                  onChange={(e) => set("fromDetails", e.target.value)}
                />
              </Field>
              <Field label="Client address / details">
                <Textarea
                  rows={3}
                  value={inv.toDetails}
                  onChange={(e) => set("toDetails", e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Line items
                </h3>
                <Button size="sm" variant="secondary" onClick={addItem}>
                  <Plus className="size-4" /> Add item
                </Button>
              </div>
              {inv.items.map((item) => (
                <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_80px_100px_40px]">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => setItem(item.id, { description: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => setItem(item.id, { quantity: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => setItem(item.id, { rate: Number(e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tax rate (%)">
                <Input
                  type="number"
                  min={0}
                  value={inv.taxRate}
                  onChange={(e) => set("taxRate", Number(e.target.value))}
                />
              </Field>
              <Field label="Notes">
                <Input value={inv.notes} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
              <Button onClick={handlePrint}>
                <Printer className="size-4" /> Print / Save PDF
              </Button>
              {pro ? (
                <Button variant="secondary" onClick={handleExcel}>
                  <FileSpreadsheet className="size-4" /> Download Excel
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/pricing">
                    <Lock className="size-4" /> Excel export (Pro)
                  </Link>
                </Button>
              )}
              <Button variant="ghost" onClick={() => setInv(emptyInvoice())}>
                <Download className="size-4 rotate-180" /> New invoice
              </Button>
            </div>
          </div>

          <InvoicePreview inv={inv} totals={t} />
        </div>

        {!pro && (
          <div className="mt-8">
            <AdSlot label="Advertisement" />
          </div>
        )}
      </main>

      <footer className="no-print surface-navy">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm opacity-80">
          <span>© {new Date().getFullYear()} JumpInvoice</span>
          <span className="flex items-center gap-2">
            <Zap className="size-4" /> Unlimited invoices on every plan
          </span>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function InvoicePreview({
  inv,
  totals: t,
}: {
  inv: Invoice;
  totals: { subtotal: number; tax: number; total: number };
}) {
  return (
    <div className="panel print-area p-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-display text-2xl font-bold text-primary">INVOICE</p>
          <p className="mt-1 text-sm text-muted-foreground">{inv.number}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Issued {inv.issueDate}</p>
          <p>Due {inv.dueDate}</p>
        </div>
      </div>

      <div className="grid gap-6 py-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From
          </p>
          <p className="mt-1 font-semibold">{inv.fromName || "Your business"}</p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{inv.fromDetails}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bill to
          </p>
          <p className="mt-1 font-semibold">{inv.toName || "Client name"}</p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{inv.toDetails}</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary text-left">
            <th className="rounded-l-md px-3 py-2 font-semibold">Description</th>
            <th className="px-3 py-2 text-right font-semibold">Qty</th>
            <th className="px-3 py-2 text-right font-semibold">Rate</th>
            <th className="rounded-r-md px-3 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((i) => (
            <tr key={i.id} className="border-b border-border">
              <td className="px-3 py-2">{i.description || "—"}</td>
              <td className="px-3 py-2 text-right">{i.quantity}</td>
              <td className="px-3 py-2 text-right">{money(i.rate, inv.currency)}</td>
              <td className="px-3 py-2 text-right">
                {money(i.quantity * i.rate, inv.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
        <Row label="Subtotal" value={money(t.subtotal, inv.currency)} />
        <Row label={`Tax (${inv.taxRate}%)`} value={money(t.tax, inv.currency)} />
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-primary">
          <span>Total</span>
          <span>{money(t.total, inv.currency)}</span>
        </div>
      </div>

      {inv.notes && <p className="mt-5 text-sm text-muted-foreground">{inv.notes}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
