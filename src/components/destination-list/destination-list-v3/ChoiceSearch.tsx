"use client";

export function ChoiceSearch({
  icon,
  label,
  value,
  placeholder,
  options,
  onChange,
  className,
}: {
  icon: string;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  className: string;
}) {
  return (
    <div className={`${className} px-30 lg:py-20 lg:px-0 js-form-dd position-relative`}>
      <div data-bs-toggle="dropdown" data-bs-auto-close="true" data-bs-offset="0,22">
        <div className="d-flex">
          <i className={`${icon} text-20 text-light-1 mt-5`} />
          <div className="ml-10">
            <h4 className="text-15 fw-500 ls-2 lh-16">{label}</h4>
            <div className="text-15 text-light-1 ls-2 lh-16">{value || placeholder}</div>
          </div>
        </div>
      </div>

      <div className="shadow-2 dropdown-menu min-width-400">
        <div className="bg-white px-20 py-20 sm:px-0 sm:py-15 rounded-4">
          <ul className="y-gap-5">
            <li
              className={`-link d-block col-12 text-left rounded-4 px-20 py-15 mb-1 ${value ? "" : "active"}`}
              role="button"
              onClick={() => onChange("")}
            >
              <div className="text-15 lh-12 fw-500">{placeholder}</div>
            </li>
            {options.map((option) => (
              <li
                className={`-link d-block col-12 text-left rounded-4 px-20 py-15 mb-1 ${
                  option === value ? "active" : ""
                }`}
                key={option}
                role="button"
                onClick={() => onChange(option)}
              >
                <div className="text-15 lh-12 fw-500">{option}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
