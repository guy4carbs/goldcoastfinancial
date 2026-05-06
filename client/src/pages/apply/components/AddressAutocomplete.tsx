import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

export interface AddressResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  display: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  inputStyle: React.CSSProperties;
}

let debounceTimer: ReturnType<typeof setTimeout>;

// Try Nominatim first (faster for suggestions), fall back to Census Bureau (more accurate)
async function searchAddresses(query: string): Promise<AddressResult[]> {
  if (query.length < 5) return [];

  // Nominatim — fast autocomplete with good US coverage
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=us&limit=5`,
      { headers: { "User-Agent": "GoldCoastFinancial/1.0" } }
    );
    if (resp.ok) {
      const data = await resp.json();
      const results: AddressResult[] = data
        .filter((r: any) => r.address && (r.address.house_number || r.address.road))
        .map((r: any) => {
          const a = r.address;
          const street = [a.house_number, a.road].filter(Boolean).join(" ");
          const city = a.city || a.town || a.village || a.hamlet || a.county || "";
          const state = a.state ? STATE_ABBR[a.state] || a.state : "";
          const zip = a.postcode || "";
          return { street, city, state, zip, display: `${street}, ${city}, ${state} ${zip}`.trim() };
        })
        .filter((r: AddressResult) => r.street);

      if (results.length > 0) return results;
    }
  } catch {}

  // Census Bureau fallback — slower but authoritative for US
  try {
    const resp = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=json`
    );
    if (resp.ok) {
      const data = await resp.json();
      const matches = data?.result?.addressMatches || [];
      return matches.slice(0, 5).map((m: any) => {
        const parts = m.matchedAddress?.split(",").map((s: string) => s.trim()) || [];
        return { street: parts[0] || "", city: parts[1] || "", state: (parts[2] || "").split(" ")[0] || "", zip: (parts[2] || "").split(" ")[1] || "", display: m.matchedAddress || "" };
      });
    }
  } catch {}

  return [];
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder = "Start typing an address...", inputStyle }: Props) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    const results = await searchAddresses(query);
    setSuggestions(results);
    setOpen(results.length > 0);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (r: AddressResult) => {
    onChange(r.street);
    onSelect(r);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          style={inputStyle}
          autoComplete="off"
        />
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--gc-text-muted)" }} />
            : <MapPin className="w-4 h-4" style={{ color: "var(--gc-gold)", opacity: 0.6 }} />
          }
        </div>
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          maxHeight: 220, overflowY: "auto", scrollbarWidth: "thin",
        }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button" onClick={() => handleSelect(s)} className="flex items-center gap-2"
              style={{
                display: "flex", width: "100%", textAlign: "left",
                padding: "10px 12px", border: "none", cursor: "pointer",
                backgroundColor: "transparent",
                color: "var(--gc-text-primary)",
                fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)",
                borderBottom: i < suggestions.length - 1 ? "1px solid var(--gc-border-subtle)" : "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--gc-gold)" }} />
              <span>{s.display}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// US state name → abbreviation
const STATE_ABBR: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "District of Columbia": "DC",
};
