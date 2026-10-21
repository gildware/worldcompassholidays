/** @type {import('tailwindcss').Config} */
module.exports = {
  // WorldCompassHoliday uses the same class names (lg:py-20, text-60, px-30) with different
  // values. Keep Tailwind utilities off full template pages, but not pages that only
  // mount the shared header or footer.
  important: "body:not(:has(.worldcompassholiday-page:not(.worldcompassholiday-header-scope, .site-footer-scope)))",
};
