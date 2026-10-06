"use client";

export function SearchBox({
  value,
  onChange,
  placeholder = "e.g. Best Western",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="single-field relative d-flex items-center py-10">
        <input
          className="pl-50 border-light text-dark-1 h-50 rounded-8"
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="submit" className="absolute d-flex items-center h-full">
          <i className="icon-search text-20 px-15 text-dark-1" />
        </button>
      </div>
    </form>
  );
}
