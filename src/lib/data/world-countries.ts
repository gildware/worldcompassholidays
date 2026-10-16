const codes = `
AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`.trim().split(/\s+/);

const aliases: Record<string, string> = {
  ae: "uae emirates dubai",
  gb: "uk britain england scotland wales",
  us: "usa america",
  kr: "south korea",
  kp: "north korea",
  nl: "holland",
  cz: "czech republic",
  tr: "turkey turkiye",
  vn: "viet nam",
  ci: "ivory coast",
  cv: "cape verde",
  cd: "congo",
  mk: "macedonia",
  sz: "swaziland",
};

const display = new Intl.DisplayNames(["en"], { type: "region" });

export type WorldCountry = {
  code: string;
  name: string;
  keywords: string;
};

export const worldCountries: WorldCountry[] = codes
  .map((code) => {
    let name = "";
    try {
      name = display.of(code) ?? "";
    } catch {
      name = "";
    }
    if (!name || name.toUpperCase() === code) return null;
    const iso = code.toLowerCase();
    const familiar: Record<string, string> = { tr: "Turkey" };
    return {
      code: iso,
      name: familiar[iso] ?? name,
      keywords: [iso, aliases[iso]].filter(Boolean).join(" "),
    };
  })
  .filter((country): country is WorldCountry => country !== null)
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const schengenDestination: WorldCountry = {
  code: "eu",
  name: "Schengen area",
  keywords: "eu europe schengen",
};
