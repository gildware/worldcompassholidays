function stayIcon(name: string) {
  const value = name.toLowerCase();
  if (/wi-?fi|internet/.test(value)) return "icon-wifi";
  if (/breakfast|half board|full board|meal|dining|restaurant|food/.test(value)) return "icon-food";
  if (/pool|swim/.test(value)) return "icon-yatch";
  if (/parking|valet/.test(value)) return "icon-parking";
  if (/garden|park|nature/.test(value)) return "icon-nature";
  if (/transfer|airport|shuttle/.test(value)) return "icon-car";
  if (/air[\s-]?condition|\bac\b|cooling/.test(value)) return "icon-day-night";
  if (/balcony|terrace/.test(value)) return "icon-living-room";
  if (/bath|tub/.test(value)) return "icon-bathtub";
  if (/laundry|wash/.test(value)) return "icon-washing-machine";
  if (/spa|massage/.test(value)) return "icon-award";
  if (/gym|fitness/.test(value)) return "icon-hiking";
  if (/desk|reception|24/.test(value)) return "icon-bell-ring";
  if (/tv|television/.test(value)) return "icon-tv";
  if (/safe/.test(value)) return "icon-shield";
  if (/kettle|coffee|tea|minibar|bar\b/.test(value)) return "icon-juice";
  if (/kitchen/.test(value)) return "icon-kitchen";
  if (/sea|beach|ocean/.test(value)) return "icon-beach-umbrella";
  if (/mountain|valley|view|hike/.test(value)) return "icon-hiking";
  if (/city/.test(value)) return "icon-city";
  if (/address|pin/.test(value)) return "icon-location-pin";
  if (/area|location|where/.test(value)) return "icon-nearby";
  if (/check-?out/.test(value)) return "icon-calendar-2";
  if (/check-?in|calendar/.test(value)) return "icon-calendar";
  if (/cancel/.test(value)) return "icon-close";
  if (/rule/.test(value)) return "icon-plans";
  if (/pay|card|price/.test(value)) return "icon-price-label";
  if (/bed/.test(value)) return "icon-bed";
  return "icon-check";
}

export function StayMark({ name }: { name: string }) {
  return <i className={stayIcon(name)} aria-hidden="true" />;
}
