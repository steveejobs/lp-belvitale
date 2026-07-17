import { useState } from "react";

export function CouponCode({ code, onCopied }: { readonly code: string; readonly onCopied: () => void }) {
  const [copied, setCopied] = useState(false);
  if (code.trim().length === 0) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopied();
  };
  return (
    <div className="q6-coupon">
      <span>Cupom validado</span>
      <strong>{code}</strong>
      <button type="button" onClick={() => void copy()}>{copied ? "Copiado" : "Copiar cupom"}</button>
    </div>
  );
}
