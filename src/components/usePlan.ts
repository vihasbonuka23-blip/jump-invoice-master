import { useEffect, useState } from "react";
import { isPro } from "@/lib/invoice";

export function usePlan() {
  const [pro, setProState] = useState(false);

  useEffect(() => {
    const sync = () => setProState(isPro());
    sync();
    window.addEventListener("jumpinvoice-plan", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("jumpinvoice-plan", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return pro;
}
