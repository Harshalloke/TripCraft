"use client";
import { useEffect, useState } from "react";

type Option = { display: string; lat: number; lon: number; type: string };

export default function DestinationAutocomplete({
  label,
  value,
  onChange,
  placeholder = "City or country",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState(value);
  const [opts, setOpts] = useState<Option[]>([]);
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q) return setOpts([]);
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      setOpts(await r.json());
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="w-full">
      <label className="text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full rounded-lg border p-2"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />
      {opts.length > 0 && (
        <div className="mt-1 max-h-56 overflow-auto rounded-lg border bg-white shadow">
          {opts.map((o, i) => (
            <button
              key={i}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onChange(o.display);
                setQ(o.display);
                setOpts([]);
              }}
            >
              {o.display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
