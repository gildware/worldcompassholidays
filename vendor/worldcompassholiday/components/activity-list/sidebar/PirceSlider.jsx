"use client";

import { useState } from "react";
import Slider from "rc-slider";

const PirceSlider = () => {
  const [price, setPrice] = useState([0, 500]);

  return (
    <div className="js-price-rangeSlider">
      <div className="text-14 fw-500"></div>

      <div className="d-flex justify-between mb-20">
        <div className="text-15 text-dark-1">
          <span className="js-lower mx-1">${price[0]}</span>-
          <span className="js-upper mx-1">${price[1]}</span>
        </div>
      </div>

      <div className="px-5">
        <Slider min={0} max={2000} value={price} range onChange={setPrice} />
      </div>
    </div>
  );
};

export default PirceSlider;
