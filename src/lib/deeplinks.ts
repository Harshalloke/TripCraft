export const gmapsSearchLink = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const gmapsDirectionsLink = (from: string, to: string, mode = "driving") =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`;

export const googleFlightsSearch = (from: string, to: string, dateISO?: string) => {
  const q = dateISO ? `flights ${from} to ${to} on ${dateISO}` : `flights ${from} to ${to}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
};

export const hotelsLink = (dest: string) =>
  `https://www.google.com/travel/hotels/${encodeURIComponent(dest)}?hl=en`;

export const restaurantsLink = (dest: string, tag = "") =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (tag ? tag + " " : "") + "restaurants near " + dest
  )}`;

export const attractionsLink = (dest: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("top attractions in " + dest)}`;
