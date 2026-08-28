import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayPalUpgrade } from "@/components/PayPalUpgrade";
import { usePlan } from "@/components/usePlan";
import { setPro } from "@/lib/invoice";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "JumpInvoice Pricing — Free Invoices or Pro Excel Export" },
      {
        name: "description",
        content:
          "Free plan: unlimited ad-supported invoices. Pro plan: Excel downloads and an ad-free workspace, paid with PayPal.",
      },
      { property: "og:title", content: "JumpInvoice Pricing" },
      {
        property: "og:description",
        content: "Unlimited free invoices with ads, or Pro for Excel export and no ads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const pro = usePlan();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-navy">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold">
            Jump<span className="opacity-70">Invoice</span>
          </Link>
          <Button asChild size="sm" variant="secondary">
            <Link to="/">Invoice builder</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-bold md:text-4xl">Simple pricing</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Unlimited invoices on both plans. Pro removes ads and unlocks Excel exports.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="panel p-6">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="mt-1 text-3xl font-bold">$0</p>
            <ul className="mt-5 space-y-2 text-sm">
              <Item yes>Unlimited invoices</Item>
              <Item yes>Print / save as PDF</Item>
              <Item yes>Custom tax, currency & notes</Item>
              <Item>Excel (.xlsx) download</Item>
              <Item>Ad-free workspace</Item>
            </ul>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link to="/">Start invoicing free</Link>
            </Button>
          </div>

          <div className="panel border-primary/40 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pro</h2>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Best value
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold">
              $9 <span className="text-base font-normal text-muted-foreground">one-time</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Item yes>Everything in Free</Item>
              <Item yes>Excel (.xlsx) download</Item>
              <Item yes>No ads, anywhere</Item>
              <Item yes>Priority feature access</Item>
            </ul>
            <div className="mt-6">
              {pro ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-primary">You're on Pro. Enjoy!</p>
                  <Button asChild className="w-full">
                    <Link to="/">Back to builder</Link>
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setPro(false)}>
                    Reset to Free (testing)
                  </Button>
                </div>
              ) : (
                <PayPalUpgrade onSuccess={() => navigate({ to: "/" })} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Item({ children, yes = false }: { children: React.ReactNode; yes?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {yes ? (
        <Check className="size-4 text-primary" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      )}
      <span className={yes ? "" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}
