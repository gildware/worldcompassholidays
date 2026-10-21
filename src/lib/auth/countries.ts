export type Country = {
  iso: string;
  name: string;
  dial: string;
};

const RAW: readonly (readonly [string, string, string])[] = [
  ["AF", "Afghanistan", "93"],
  ["AL", "Albania", "355"],
  ["DZ", "Algeria", "213"],
  ["AS", "American Samoa", "1"],
  ["AD", "Andorra", "376"],
  ["AO", "Angola", "244"],
  ["AI", "Anguilla", "1"],
  ["AG", "Antigua and Barbuda", "1"],
  ["AR", "Argentina", "54"],
  ["AM", "Armenia", "374"],
  ["AW", "Aruba", "297"],
  ["AU", "Australia", "61"],
  ["AT", "Austria", "43"],
  ["AZ", "Azerbaijan", "994"],
  ["BS", "Bahamas", "1"],
  ["BH", "Bahrain", "973"],
  ["BD", "Bangladesh", "880"],
  ["BB", "Barbados", "1"],
  ["BY", "Belarus", "375"],
  ["BE", "Belgium", "32"],
  ["BZ", "Belize", "501"],
  ["BJ", "Benin", "229"],
  ["BM", "Bermuda", "1"],
  ["BT", "Bhutan", "975"],
  ["BO", "Bolivia", "591"],
  ["BA", "Bosnia and Herzegovina", "387"],
  ["BW", "Botswana", "267"],
  ["BR", "Brazil", "55"],
  ["IO", "British Indian Ocean Territory", "246"],
  ["VG", "British Virgin Islands", "1"],
  ["BN", "Brunei", "673"],
  ["BG", "Bulgaria", "359"],
  ["BF", "Burkina Faso", "226"],
  ["BI", "Burundi", "257"],
  ["KH", "Cambodia", "855"],
  ["CM", "Cameroon", "237"],
  ["CA", "Canada", "1"],
  ["CV", "Cape Verde", "238"],
  ["KY", "Cayman Islands", "1"],
  ["CF", "Central African Republic", "236"],
  ["TD", "Chad", "235"],
  ["CL", "Chile", "56"],
  ["CN", "China", "86"],
  ["CO", "Colombia", "57"],
  ["KM", "Comoros", "269"],
  ["CG", "Congo", "242"],
  ["CD", "Congo (DRC)", "243"],
  ["CK", "Cook Islands", "682"],
  ["CR", "Costa Rica", "506"],
  ["CI", "Côte d’Ivoire", "225"],
  ["HR", "Croatia", "385"],
  ["CU", "Cuba", "53"],
  ["CW", "Curaçao", "599"],
  ["CY", "Cyprus", "357"],
  ["CZ", "Czechia", "420"],
  ["DK", "Denmark", "45"],
  ["DJ", "Djibouti", "253"],
  ["DM", "Dominica", "1"],
  ["DO", "Dominican Republic", "1"],
  ["EC", "Ecuador", "593"],
  ["EG", "Egypt", "20"],
  ["SV", "El Salvador", "503"],
  ["GQ", "Equatorial Guinea", "240"],
  ["ER", "Eritrea", "291"],
  ["EE", "Estonia", "372"],
  ["SZ", "Eswatini", "268"],
  ["ET", "Ethiopia", "251"],
  ["FK", "Falkland Islands", "500"],
  ["FO", "Faroe Islands", "298"],
  ["FJ", "Fiji", "679"],
  ["FI", "Finland", "358"],
  ["FR", "France", "33"],
  ["GF", "French Guiana", "594"],
  ["PF", "French Polynesia", "689"],
  ["GA", "Gabon", "241"],
  ["GM", "Gambia", "220"],
  ["GE", "Georgia", "995"],
  ["DE", "Germany", "49"],
  ["GH", "Ghana", "233"],
  ["GI", "Gibraltar", "350"],
  ["GR", "Greece", "30"],
  ["GL", "Greenland", "299"],
  ["GD", "Grenada", "1"],
  ["GP", "Guadeloupe", "590"],
  ["GU", "Guam", "1"],
  ["GT", "Guatemala", "502"],
  ["GN", "Guinea", "224"],
  ["GW", "Guinea-Bissau", "245"],
  ["GY", "Guyana", "592"],
  ["HT", "Haiti", "509"],
  ["HN", "Honduras", "504"],
  ["HK", "Hong Kong", "852"],
  ["HU", "Hungary", "36"],
  ["IS", "Iceland", "354"],
  ["IN", "India", "91"],
  ["ID", "Indonesia", "62"],
  ["IR", "Iran", "98"],
  ["IQ", "Iraq", "964"],
  ["IE", "Ireland", "353"],
  ["IL", "Israel", "972"],
  ["IT", "Italy", "39"],
  ["JM", "Jamaica", "1"],
  ["JP", "Japan", "81"],
  ["JO", "Jordan", "962"],
  ["KZ", "Kazakhstan", "7"],
  ["KE", "Kenya", "254"],
  ["KI", "Kiribati", "686"],
  ["XK", "Kosovo", "383"],
  ["KW", "Kuwait", "965"],
  ["KG", "Kyrgyzstan", "996"],
  ["LA", "Laos", "856"],
  ["LV", "Latvia", "371"],
  ["LB", "Lebanon", "961"],
  ["LS", "Lesotho", "266"],
  ["LR", "Liberia", "231"],
  ["LY", "Libya", "218"],
  ["LI", "Liechtenstein", "423"],
  ["LT", "Lithuania", "370"],
  ["LU", "Luxembourg", "352"],
  ["MO", "Macao", "853"],
  ["MG", "Madagascar", "261"],
  ["MW", "Malawi", "265"],
  ["MY", "Malaysia", "60"],
  ["MV", "Maldives", "960"],
  ["ML", "Mali", "223"],
  ["MT", "Malta", "356"],
  ["MH", "Marshall Islands", "692"],
  ["MQ", "Martinique", "596"],
  ["MR", "Mauritania", "222"],
  ["MU", "Mauritius", "230"],
  ["MX", "Mexico", "52"],
  ["FM", "Micronesia", "691"],
  ["MD", "Moldova", "373"],
  ["MC", "Monaco", "377"],
  ["MN", "Mongolia", "976"],
  ["ME", "Montenegro", "382"],
  ["MS", "Montserrat", "1"],
  ["MA", "Morocco", "212"],
  ["MZ", "Mozambique", "258"],
  ["MM", "Myanmar", "95"],
  ["NA", "Namibia", "264"],
  ["NR", "Nauru", "674"],
  ["NP", "Nepal", "977"],
  ["NL", "Netherlands", "31"],
  ["NC", "New Caledonia", "687"],
  ["NZ", "New Zealand", "64"],
  ["NI", "Nicaragua", "505"],
  ["NE", "Niger", "227"],
  ["NG", "Nigeria", "234"],
  ["NU", "Niue", "683"],
  ["KP", "North Korea", "850"],
  ["MK", "North Macedonia", "389"],
  ["MP", "Northern Mariana Islands", "1"],
  ["NO", "Norway", "47"],
  ["OM", "Oman", "968"],
  ["PK", "Pakistan", "92"],
  ["PW", "Palau", "680"],
  ["PS", "Palestine", "970"],
  ["PA", "Panama", "507"],
  ["PG", "Papua New Guinea", "675"],
  ["PY", "Paraguay", "595"],
  ["PE", "Peru", "51"],
  ["PH", "Philippines", "63"],
  ["PL", "Poland", "48"],
  ["PT", "Portugal", "351"],
  ["PR", "Puerto Rico", "1"],
  ["QA", "Qatar", "974"],
  ["RE", "Réunion", "262"],
  ["RO", "Romania", "40"],
  ["RU", "Russia", "7"],
  ["RW", "Rwanda", "250"],
  ["WS", "Samoa", "685"],
  ["SM", "San Marino", "378"],
  ["ST", "São Tomé and Príncipe", "239"],
  ["SA", "Saudi Arabia", "966"],
  ["SN", "Senegal", "221"],
  ["RS", "Serbia", "381"],
  ["SC", "Seychelles", "248"],
  ["SL", "Sierra Leone", "232"],
  ["SG", "Singapore", "65"],
  ["SX", "Sint Maarten", "1"],
  ["SK", "Slovakia", "421"],
  ["SI", "Slovenia", "386"],
  ["SB", "Solomon Islands", "677"],
  ["SO", "Somalia", "252"],
  ["ZA", "South Africa", "27"],
  ["KR", "South Korea", "82"],
  ["SS", "South Sudan", "211"],
  ["ES", "Spain", "34"],
  ["LK", "Sri Lanka", "94"],
  ["BL", "St. Barthélemy", "590"],
  ["KN", "St. Kitts and Nevis", "1"],
  ["LC", "St. Lucia", "1"],
  ["MF", "St. Martin", "590"],
  ["VC", "St. Vincent and the Grenadines", "1"],
  ["SD", "Sudan", "249"],
  ["SR", "Suriname", "597"],
  ["SE", "Sweden", "46"],
  ["CH", "Switzerland", "41"],
  ["SY", "Syria", "963"],
  ["TW", "Taiwan", "886"],
  ["TJ", "Tajikistan", "992"],
  ["TZ", "Tanzania", "255"],
  ["TH", "Thailand", "66"],
  ["TL", "Timor-Leste", "670"],
  ["TG", "Togo", "228"],
  ["TO", "Tonga", "676"],
  ["TT", "Trinidad and Tobago", "1"],
  ["TN", "Tunisia", "216"],
  ["TR", "Turkey", "90"],
  ["TM", "Turkmenistan", "993"],
  ["TC", "Turks and Caicos Islands", "1"],
  ["TV", "Tuvalu", "688"],
  ["UG", "Uganda", "256"],
  ["UA", "Ukraine", "380"],
  ["AE", "United Arab Emirates", "971"],
  ["GB", "United Kingdom", "44"],
  ["US", "United States", "1"],
  ["VI", "U.S. Virgin Islands", "1"],
  ["UY", "Uruguay", "598"],
  ["UZ", "Uzbekistan", "998"],
  ["VU", "Vanuatu", "678"],
  ["VA", "Vatican City", "39"],
  ["VE", "Venezuela", "58"],
  ["VN", "Vietnam", "84"],
  ["YE", "Yemen", "967"],
  ["ZM", "Zambia", "260"],
  ["ZW", "Zimbabwe", "263"],
];

export const COUNTRIES: readonly Country[] = RAW.map(([iso, name, dial]) => ({ iso, name, dial })).sort((a, b) =>
  a.name.localeCompare(b.name),
);

const BY_ISO = new Map(COUNTRIES.map((country) => [country.iso, country]));

const DIALS = [...new Set(COUNTRIES.map((country) => country.dial))].sort((a, b) => b.length - a.length);

const NATIONAL_LENGTH: Record<string, readonly [number, number]> = {
  AE: [8, 9],
  AU: [9, 9],
  BD: [10, 10],
  BH: [8, 8],
  BR: [10, 11],
  CA: [10, 10],
  CN: [11, 11],
  DE: [10, 11],
  EG: [10, 10],
  FR: [9, 9],
  GB: [10, 10],
  HK: [8, 8],
  ID: [9, 12],
  IN: [10, 10],
  IT: [9, 10],
  JP: [10, 10],
  KE: [9, 9],
  KW: [8, 8],
  LK: [9, 9],
  MX: [10, 10],
  MY: [9, 10],
  NG: [10, 10],
  NP: [10, 10],
  NZ: [8, 10],
  OM: [8, 8],
  PH: [10, 10],
  PK: [10, 10],
  QA: [8, 8],
  SA: [9, 9],
  SG: [8, 8],
  TH: [9, 9],
  TR: [10, 10],
  US: [10, 10],
  VN: [9, 10],
  ZA: [9, 9],
};

const TIMEZONE_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Katmandu": "NP",
  "Asia/Thimphu": "BT",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID",
  "Asia/Makassar": "ID",
  "Asia/Jayapura": "ID",
  "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Macau": "MO",
  "Asia/Taipei": "TW",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA",
  "Asia/Kuwait": "KW",
  "Asia/Bahrain": "BH",
  "Asia/Muscat": "OM",
  "Asia/Baghdad": "IQ",
  "Asia/Tehran": "IR",
  "Asia/Jerusalem": "IL",
  "Asia/Amman": "JO",
  "Asia/Beirut": "LB",
  "Asia/Damascus": "SY",
  "Asia/Aden": "YE",
  "Asia/Kabul": "AF",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Zurich": "CH",
  "Europe/Vienna": "AT",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Lisbon": "PT",
  "Europe/Athens": "GR",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO",
  "Europe/Istanbul": "TR",
  "Europe/Moscow": "RU",
  "Europe/Kyiv": "UA",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Cairo": "EG",
  "Africa/Casablanca": "MA",
};

export function countryByIso(iso: string) {
  return BY_ISO.get(iso.trim().toUpperCase()) ?? null;
}

export function flagEmoji(iso: string) {
  const code = iso.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function countryFromTimeZone(timeZone: string) {
  return countryByIso(TIMEZONE_COUNTRY[timeZone] ?? "")?.iso ?? "";
}

export function countryIsoFromHeaders(headerStore: { get(name: string): string | null }) {
  const raw =
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    headerStore.get("cloudfront-viewer-country") ||
    "";
  return countryByIso(raw)?.iso ?? "";
}

export function matchDial(digits: string) {
  return DIALS.find((dial) => digits.startsWith(dial)) ?? "";
}

export function nationalNumber(iso: string, raw: string) {
  const country = countryByIso(iso);
  if (!country) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(country.dial) && digits.length - country.dial.length >= 6) {
    digits = digits.slice(country.dial.length);
  }
  return digits.replace(/^0+/, "");
}

export function nationalPhoneError(iso: string, national: string) {
  const country = countryByIso(iso);
  if (!country) return "Choose a country.";
  if (!national) return "Enter your mobile number without the country code.";
  const field = nationalPhoneField(iso);
  if (!new RegExp(`^(?:${field.pattern})$`).test(national)) return field.title;
  return null;
}

export function nationalPhoneField(iso: string) {
  const country = countryByIso(iso);
  const [min, max] = NATIONAL_LENGTH[iso] ?? [6, 14];
  const room = country ? Math.max(1, 15 - country.dial.length) : max;
  const maxLength = Math.min(max, room);
  const minLength = Math.min(min, maxLength);
  if (iso === "IN") {
    return {
      minLength: 10,
      maxLength: 10,
      pattern: "[6-9][0-9]{9}",
      title: "Enter a 10-digit Indian mobile number, without +91.",
    };
  }
  const pattern = minLength === maxLength ? `[0-9]{${minLength}}` : `[0-9]{${minLength},${maxLength}}`;
  const title = country
    ? `Enter a valid ${country.name} mobile number, without the country code.`
    : "Choose a country.";
  return { minLength, maxLength, pattern, title };
}

export function toInternational(iso: string, national: string) {
  const country = countryByIso(iso);
  if (!country || !national) return "";
  return `+${country.dial}${national}`;
}
