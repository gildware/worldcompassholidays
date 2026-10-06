import type { DestinationSort } from "@/components/destination-list/types";

const sortOptions: { value: DestinationSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "name", label: "Name" },
  { value: "country", label: "Country" },
];

export function TopHeaderFilter({
  count,
  place,
  sort,
  onSort,
}: {
  count: number;
  place: string;
  sort: DestinationSort;
  onSort: (sort: DestinationSort) => void;
}) {
  const label = count === 1 ? "destination" : "destinations";

  return (
    <>
      <div className="col-auto">
        <div className="text-18">
          <span className="fw-500">
            {count.toLocaleString("en-US")} {label}
          </span>
          {place ? ` in ${place}` : ""}
        </div>
      </div>
      <div className="col-auto">
        <div className="dropdown">
          <button
            type="button"
            className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
            data-bs-toggle="dropdown"
          >
            <i className="icon-up-down text-14 mr-10" />
            Sort
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
    </>
  );
}
