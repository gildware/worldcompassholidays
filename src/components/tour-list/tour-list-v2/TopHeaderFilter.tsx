import { FilterIconButton } from "@/components/listing/ListFilterDrawer";
import type { TourSort } from "@/components/tour-list/types";

const sortOptions: { value: TourSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title", label: "Title" },
];

export function TopHeaderFilter({
  name,
  onName,
  sort,
  onSort,
  filtersActive,
  onOpenFilters,
}: {
  name: string;
  onName: (name: string) => void;
  sort: TourSort;
  onSort: (sort: TourSort) => void;
  filtersActive: boolean;
  onOpenFilters: () => void;
}) {
  return (
    <div className="tour-toolbar">
      <label className="tour-toolbar-search">
        <i className="icon-search text-16 text-light-1" />
        <input
          type="search"
          value={name}
          placeholder="Search tours"
          aria-label="Search tours"
          onChange={(event) => onName(event.target.value)}
        />
      </label>

      <FilterIconButton active={filtersActive} onClick={onOpenFilters} />
      <div className="dropdown tour-toolbar-sort">
        <button
          type="button"
          className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
          data-bs-toggle="dropdown"
          aria-label="Sort"
        >
          <i className="icon-up-down text-14 mr-10" />
          <span className="tour-toolbar-sort-label">Sort</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          {sortOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`dropdown-item text-15 ${sort === option.value ? "fw-500" : ""}`}
                onClick={() => onSort(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
