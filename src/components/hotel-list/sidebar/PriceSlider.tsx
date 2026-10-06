"use client";

import Slider from "rc-slider";
import { formatMoney } from "@/lib/format";

export function PriceSlider({
  price,
  max,
  currency,
  onChange,
}: {
  price: [number, number];
  max: number;
  currency: string;
  onChange: (price: [number, number]) => void;
}) {
  return (
    <div className="js-price-rangeSlider">
      <div className="text-14 fw-500"></div>
      <div className="d-flex justify-between mb-20">
        <div className="text-15 text-dark-1">
          <span className="js-lower mx-1">{formatMoney(price[0], currency)}</span>-
          <span className="js-upper mx-1">{formatMoney(price[1], currency)}</span>
        </div>
      </div>
      <div className="px-5">
        <Slider
          range
          min={0}
          max={max}
          value={price}
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
