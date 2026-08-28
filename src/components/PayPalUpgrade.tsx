import { useEffect, useRef, useState } from "react";
import { setPro } from "@/lib/invoice";

// Live PayPal client id (publishable — safe in frontend code)
const PAYPAL_CLIENT_ID =
  "ATXQu_jW6bgtzGCWk1AIluVm_0w6ExOQwOZSLp83QQhohWurPC55-qY6YeuoQ3oui6p93QMhvUGYoya5";
const PRO_PRICE = "4.99";

declare global {
  interface Window {
    paypal?: any;
  }
}

function loadSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>("script[data-paypal-sdk]");
  if (existing) {
    return new Promise((res, rej) => {
      existing.addEventListener("load", () => res());
      existing.addEventListener("error", () => rej(new Error("sdk")));
    });
  }
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    s.dataset["paypalSdk"] = "true";
    s.onload = () => res();
    s.onerror = () => rej(new Error("sdk"));
    document.body.appendChild(s);
  });
}

export function PayPalUpgrade({ onSuccess }: { onSuccess?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "done">("loading");

  useEffect(() => {
    let cancelled = false;
    loadSdk()
      .then(() => {
        if (cancelled || !ref.current || !window.paypal) return;
        ref.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: { color: "blue", shape: "rect", label: "paypal", height: 45 },
            createOrder: (_d: unknown, actions: any) =>
              actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    description: "JumpInvoice Pro",
                    amount: { currency_code: "USD", value: PRO_PRICE },
                  },
                ],
              }),
            onApprove: async (_d: unknown, actions: any) => {
              try {
                await actions.order.capture();
              } catch {
                /* capture already handled */
              }
              setPro(true);
              setStatus("done");
              onSuccess?.();
            },
            onError: () => setStatus("error"),
          })
          .render(ref.current);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [onSuccess]);

  return (
    <div className="space-y-3">
      <div ref={ref} />
      {status === "loading" && (
        <p className="text-sm text-muted-foreground">Loading PayPal checkout…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          PayPal could not load. Check your connection and try again.
        </p>
      )}
      {status === "done" && (
        <p className="text-sm font-medium text-primary">Pro unlocked — ads are off.</p>
      )}
      <p className="text-xs text-muted-foreground">
        Secure one-time payment of ${PRO_PRICE} USD via PayPal.

      </p>
    </div>
  );
}
