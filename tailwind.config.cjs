/** @type {import('tailwindcss').Config} */
module.exports = {
  // WorldCompassHoliday uses the same class names (lg:py-20, text-60, px-30) with different
  // values. Keep Tailwind utilities off the WorldCompassHoliday home page, but not pages
  // that only mount the shared header (.worldcompassholiday-header-scope).
  important: "body:not(:has(.worldcompassholiday-page:not(.worldcompassholiday-header-scope)))",
};
