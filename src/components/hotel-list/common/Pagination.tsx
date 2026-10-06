"use client";

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  itemLabel = "properties",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  itemLabel?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="border-top-light mt-30 pt-30">
      <div className="row x-gap-10 y-gap-20 justify-between md:justify-center">
        <div className="col-auto md:order-1">
          <button
            type="button"
            className="button -blue-1 size-40 rounded-full border-light"
            onClick={() => onPage(Math.max(1, page - 1))}
            aria-label="Previous page"
          >
            <i className="icon-chevron-left text-12" />
          </button>
        </div>

        <div className="col-md-auto md:order-3">
          <div className="row x-gap-20 y-gap-20 items-center md:d-none">
            {pages.map((pageNumber) => (
              <div className="col-auto" key={pageNumber}>
                <div
                  className={`size-40 flex-center rounded-full cursor-pointer ${
                    pageNumber === page ? "bg-dark-1 text-white" : ""
                  }`}
                  onClick={() => onPage(pageNumber)}
                >
                  {pageNumber}
                </div>
              </div>
            ))}
          </div>

          <div className="row x-gap-10 y-gap-20 justify-center items-center d-none md:d-flex">
            {pages.map((pageNumber) => (
              <div className="col-auto" key={`m-${pageNumber}`}>
                <div
                  className={`size-40 flex-center rounded-full cursor-pointer ${
                    pageNumber === page ? "bg-dark-1 text-white" : ""
                  }`}
                  onClick={() => onPage(pageNumber)}
                >
                  {pageNumber}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-30 md:mt-10">
            <div className="text-14 text-light-1">
              {start} – {end} of {total} {itemLabel} found
            </div>
          </div>
        </div>

        <div className="col-auto md:order-2">
          <button
            type="button"
            className="button -blue-1 size-40 rounded-full border-light"
            onClick={() => onPage(Math.min(totalPages, page + 1))}
            aria-label="Next page"
          >
            <i className="icon-chevron-right text-12" />
          </button>
        </div>
      </div>
    </div>
  );
}
