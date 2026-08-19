"use client";

type RequestSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RequestSearchBar({ value, onChange }: RequestSearchBarProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-slate-400">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by request ID, subject, employee email, or assigned agent..."
        aria-label="Search requests"
        className="field-input w-full !py-2.5 !pr-11 !pl-11"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-2 z-10 flex items-center rounded-md px-2 text-slate-400 transition hover:text-slate-700"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M8.5 14.5a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M13.2 13.2 17 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
