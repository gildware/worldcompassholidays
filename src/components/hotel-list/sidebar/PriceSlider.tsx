"use client";

import Slider from "rc-slider";
import { formatMoney } from "@/lib/format";

export function PriceSlider({
  price,
  min = 0,
  max,
  step = 1,
  currency,
  onChange,
  title = "",
  showReadout = true,
}: {
  price: [number, number];
  min?: number;
  max: number;
  step?: number;
  currency: string;
  onChange: (price: [number, number]) => void;
  title?: string;
  showReadout?: boolean;
}) {
  const low = Math.min(price[0], price[1]);
  const high = Math.max(price[0], price[1]);

  return (
    <div className="js-price-rangeSlider">
      {title ? <div className="text-14 fw-500">{title}</div> : null}
      {showReadout ? (
        <div className="d-flex justify-between mb-20">
          <div className="text-15 text-dark-1">
            <span className="js-lower mx-1">{formatMoney(low, currency)}</span>-
            <span className="js-upper mx-1">{formatMoney(high, currency)}</span>
          </div>
        </div>
      ) : null}
      <div className="px-5">
        <Slider
          range
          min={min}
          max={max}
          step={step}
          value={[low, high]}
          onChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              onChange([value[0], value[1]]);
            }
          }}
        />
      </div>
    </div>
  );
}
