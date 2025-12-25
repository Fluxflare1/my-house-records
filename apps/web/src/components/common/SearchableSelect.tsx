"use client";

import { useMemo, useState } from "react";

export type SelectOption = { value: string; label: string };

export function SearchableSelect(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return props.options;
    return props.options.filter((o) => o.label.toLowerCase().includes(query));
  }, [q, props.options]);

  return (
    <div className="space-y-1">
      <label className="text-sm">{props.label}</label>
      <input
        className="w-full border p-2 text-sm"
        placeholder={props.searchPlaceholder || "Search..."}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={props.disabled}
      />
      <select
        className="w-full border p-2"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
      >
        <option value="">{props.placeholder || "Select..."}</option>
        {filtered.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-600">
        Showing {filtered.length} of {props.options.length}
      </div>
    </div>
  );
}
