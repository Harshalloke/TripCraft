"use client";
import { CostBreakdownItem } from "@/lib/costs";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function CostSummary({
  items,
  total,
  perPerson,
}: {
  items: CostBreakdownItem[];
  total: number;
  perPerson: number;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 text-sm font-semibold">Estimated Costs</div>
      <ul className="space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex justify-between">
            <span>{i.label}</span><span>{money(i.amountINR)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between font-semibold">
        <span>Total</span><span>{money(total)}</span>
      </div>
      <div className="text-sm opacity-70">≈ {money(perPerson)} per person</div>
    </div>
  );
}
