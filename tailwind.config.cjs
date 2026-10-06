/** @type {import('tailwindcss').Config} */
module.exports = {
  // GoTrip uses the same class names (lg:py-20, text-60, px-30) with different
  // values. Keep Tailwind utilities off the GoTrip home page, but not pages
  // that only mount the shared header (.gotrip-header-scope).
  important: "body:not(:has(.gotrip-page:not(.gotrip-header-scope)))",
};
