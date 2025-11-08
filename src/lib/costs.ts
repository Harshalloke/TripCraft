import { Travelers } from "./types";

export type CostBreakdownItem = {
  label: string;
  amountINR: number;
  category: "transport" | "stay" | "food" | "attractions" | "local" | "buffer";
};

export function estimateCostsINR(params: {
  nights: number;
  travelers: Travelers;
  budget: "cheap" | "value" | "top";
  flightMedianINR?: number;
  stayNightlyINR?: number; // per room/night
  rooms?: number;
  kmLocal?: number;
  attractionINR?: number;
}) {
  const { nights, travelers, budget } = params;
  const A = travelers.adults, K = travelers.kids;
  const rooms = params.rooms ?? Math.max(1, Math.ceil(A / 2));
  const stay = (params.stayNightlyINR ?? tierStay(budget)) * nights * rooms;

  const flight = params.flightMedianINR ?? 0;
  const food = tierFood(budget) * (A + 0.6 * K) * (nights + 1);
  const local = (params.kmLocal ?? 40) * 25; // ₹/km heuristic
  const attractions = params.attractionINR ?? 1200 * (A + 0.5 * K);
  const base = flight + stay + food + local + attractions;
  const buffer = base * 0.12;

  const items: CostBreakdownItem[] = [
    { label: "Flights", amountINR: flight, category: "transport" },
    { label: "Stay", amountINR: stay, category: "stay" },
    { label: "Food", amountINR: food, category: "food" },
    { label: "Local commute", amountINR: local, category: "local" },
    { label: "Attractions", amountINR: attractions, category: "attractions" },
    { label: "Buffer (12%)", amountINR: buffer, category: "buffer" },
  ];

  const total = items.reduce((s, i) => s + i.amountINR, 0);
  const perPerson = total / (A + K || 1);
  return { items, total, perPerson };
}

function tierFood(b: "cheap" | "value" | "top") {
  if (b === "cheap") return 500;
  if (b === "value") return 900;
  return 1500;
}
function tierStay(b: "cheap" | "value" | "top") {
  if (b === "cheap") return 1800;
  if (b === "value") return 3200;
  return 6000;
}
