import type { CarSort } from "@/components/car-list/types";

const sortOptions: { value: CarSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export function TopHeaderFilter({
  count,
  place,
  sort,
  onSort,
}: {
  count: number;
  place: string;
  sort: CarSort;
  onSort: (sort: CarSort) => void;
}) {
  return (
    <div className="row y-gap-10 items-center justify-between">
      <div className="col-auto">
        <div className="text-18">
          <span className="fw-500">{count.toLocaleString("en-US")} properties</span>
          {place ? ` in ${place}` : " in Europe"}
        </div>
      </div>

      <div className="col-auto">
        <div className="row x-gap-20 y-gap-20">
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

          <div className="col-auto d-none xl:d-block">
            <button
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#listingSidebar"
              className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
            >
              <i className="icon-up-down text-14 mr-10" />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
