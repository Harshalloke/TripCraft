export type Travelers = {
  adults: number;
  kids: number;
};

export type TripForm = {
  origin?: string;
  destination: string;
  domestic: boolean;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  travelers: Travelers;
  budget: "cheap" | "value" | "top";
};

export type AIPlan = {
  summary: string;
  days: { date: string; plan: { time: string; title: string; note?: string }[] }[];
  checkpoints: { name: string; why?: string }[];
  hotels: { name: string; note?: string; googleQuery: string }[];
  restaurants: { name: string; note?: string; googleQuery: string }[];
  transports: { mode: string; note?: string; googleQuery: string }[];
  costHints?: {
    stayPerNightHintINR?: number;
    foodPerAdultPerDayINR?: number;
    attractionsPerAdultINR?: number;
  };
  tips?: string[];
  similarPlaces?: { place: string; why?: string }[];
};
