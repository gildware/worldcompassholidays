export function TopHeaderFilter({ count, place }: { count: number; place: string }) {
  const label = count === 1 ? "property" : "properties";

  return (
    <div className="row y-gap-10 items-center justify-between">
      <div className="col-auto">
        <div className="text-18">
          <span className="fw-500">
            {count.toLocaleString("en-US")} {label}
          </span>
          {place ? ` in ${place}` : ""}
        </div>
      </div>

      <div className="col-auto">
        <div className="row x-gap-20 y-gap-20">
          <div className="col-auto">
            <button
              type="button"
              className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
            >
              <i className="icon-up-down text-14 mr-10" />
              Top picks for your search
            </button>
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
