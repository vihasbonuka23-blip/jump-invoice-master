export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  fromName: string;
  fromDetails: string;
  toName: string;
  toDetails: string;
  notes: string;
  taxRate: number;
  items: LineItem[];
};

export const MONETAG_LINK = "https://omg10.com/4/11676849";
const PRO_KEY = "jumpinvoice_pro";
const COUNT_KEY = "jumpinvoice_count";

export const newId = () => Math.random().toString(36).slice(2, 9);

export function emptyInvoice(): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  return {
    number: `INV-${String(Date.now()).slice(-6)}`,
    issueDate: today,
    dueDate: due,
    currency: "USD",
    fromName: "",
    fromDetails: "",
    toName: "",
    toDetails: "",
    notes: "Thank you for your business.",
    taxRate: 0,
    items: [{ id: newId(), description: "", quantity: 1, rate: 0 }],
  };
}

export function totals(inv: Invoice) {
  const subtotal = inv.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const tax = (subtotal * inv.taxRate) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

export function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export const isPro = () =>
  typeof window !== "undefined" && localStorage.getItem(PRO_KEY) === "true";

export const setPro = (value: boolean) => {
  localStorage.setItem(PRO_KEY, String(value));
  window.dispatchEvent(new Event("jumpinvoice-plan"));
};

export const bumpInvoiceCount = () => {
  const next = Number(localStorage.getItem(COUNT_KEY) ?? "0") + 1;
  localStorage.setItem(COUNT_KEY, String(next));
  return next;
};

export const invoiceCount = () =>
  typeof window === "undefined" ? 0 : Number(localStorage.getItem(COUNT_KEY) ?? "0");

export function openAd() {
  window.open(MONETAG_LINK, "_blank", "noopener,noreferrer");
}
