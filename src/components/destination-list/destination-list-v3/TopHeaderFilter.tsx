import { FilterIconButton } from "@/components/listing/ListFilterDrawer";
import type { DestinationSort } from "@/components/destination-list/types";

const sortOptions: { value: DestinationSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "name", label: "Name" },
  { value: "country", label: "Country" },
];

export function TopHeaderFilter({
  count,
  place,
  search,
  onSearch,
  sort,
  onSort,
  filtersActive,
  onOpenFilters,
  view,
  onView,
}: {
  count: number;
  place: string;
  search: string;
  onSearch: (value: string) => void;
  sort: DestinationSort;
  onSort: (sort: DestinationSort) => void;
  filtersActive: boolean;
  onOpenFilters: () => void;
  view: "list" | "map";
  onView: (view: "list" | "map") => void;
}) {
  const label = count === 1 ? "destination" : "destinations";

  return (
    <div className="tour-toolbar">
      <label className="tour-toolbar-search">
        <i className="icon-search text-16 text-light-1" />
        <input
          type="search"
          value={search}
          placeholder="Search destinations"
          aria-label="Search destinations"
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      <div className="destination-toolbar-count text-15">
        <span className="fw-500">
          {count.toLocaleString("en-US")} {label}
        </span>
        {place ? ` in ${place}` : ""}
      </div>

      <FilterIconButton active={filtersActive} onClick={onOpenFilters} />

      <div
        className="destination-view-toggle"
        role="group"
        aria-label="Change view"
      >
        <button
          type="button"
          className={view === "list" ? "is-active" : ""}
          aria-pressed={view === "list"}
          onClick={() => onView("list")}
        >
          List
        </button>
        <button
          type="button"
          className={view === "map" ? "is-active" : ""}
          aria-pressed={view === "map"}
          onClick={() => onView("map")}
        >
          Map
        </button>
      </div>

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
