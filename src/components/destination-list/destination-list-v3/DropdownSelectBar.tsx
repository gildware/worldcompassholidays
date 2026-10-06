"use client";

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const current = options.find((option) => option.value === value)?.label ?? label;

  return (
    <div className="col-auto">
      <div className="dropdown js-dropdown js-amenities-active">
        <div
          className="dropdown__button d-flex items-center text-14 rounded-100 border-light px-15 h-34"
          data-bs-toggle="dropdown"
          data-bs-auto-close="true"
          aria-expanded="false"
          data-bs-offset="0,10"
          role="button"
        >
          <span className="js-dropdown-title">{value ? current : label}</span>
          <i className="icon icon-chevron-sm-down text-7 ml-10" />
        </div>

        <div className="toggle-element -dropdown js-click-dropdown dropdown-menu">
          <div className="text-15 y-gap-15 js-dropdown-list">
            {options.map((item) => (
              <div key={item.value || "all"}>
                <button
                  type="button"
                  className={`${item.value === value ? "text-blue-1 " : ""}d-block js-dropdown-link`}
                  onClick={() => onChange(item.value)}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DropdownSelectBar({
  countries,
  country,
  onCountry,
  regions,
  region,
  onRegion,
  popular,
  onPopular,
}: {
  countries: string[];
  country: string;
  onCountry: (value: string) => void;
  regions: string[];
  region: string;
  onRegion: (value: string) => void;
  popular: boolean;
  onPopular: (value: boolean) => void;
}) {
  return (
    <>
      <FilterChip
        label="Country"
        value={country}
        options={[{ value: "", label: "All countries" }, ...countries.map((item) => ({ value: item, label: item }))]}
        onChange={onCountry}
      />
      <FilterChip
        label="Region"
        value={region}
        options={[{ value: "", label: "All regions" }, ...regions.map((item) => ({ value: item, label: item }))]}
        onChange={onRegion}
      />
      <FilterChip
        label="Popular"
        value={popular ? "popular" : ""}
        options={[
          { value: "", label: "All destinations" },
          { value: "popular", label: "Popular only" },
        ]}
        onChange={(value) => onPopular(value === "popular")}
      />
    </>
  );
}
