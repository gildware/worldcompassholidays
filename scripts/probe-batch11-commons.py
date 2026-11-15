#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-11 final empty tours (width >= 800)."""
import json
import sys
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch11-probe)"
WAIT = 1.5

GROUPS: dict[str, list[str]] = {
    "best-of-kerala-full-circuit": [
        "Kovalam beach Kerala lighthouse",
        "Padmanabhaswamy Temple Trivandrum",
        "Mattancherry Palace Kochi",
        "Marari beach Kerala",
        "Cherai beach Kerala",
        "Vembanad lake Kerala houseboat",
        "Tea plantation Munnar Kerala",
        "Periyar National Park Thekkady",
    ],
    "gaumukh-tapovan-trek": [
        "Gangotri temple Uttarakhand",
        "Gaumukh glacier Uttarakhand",
        "Tapovan meadow Shivling Uttarakhand",
        "Bhojbasa Gangotri trek",
        "Uttarkashi Bhagirathi",
    ],
    "goecha-la-trek": [
        "Yuksom Sikkim monastery",
        "Dzongri meadow Kanchenjunga Sikkim",
        "Samiti Lake Sikkim trek",
        "Goecha La Sikkim trek",
        "Rhododendron Sikkim forest trek",
    ],
    "royal-rajasthan-circuit": [
        "Mehrangarh Fort Jodhpur",
        "Jaswant Thada Jodhpur",
        "Ranakpur Jain temple Rajasthan",
        "Jodhpur blue city clock tower",
        "Udaipur Lake Pichola",
    ],
    "royal-rajasthan-family-trail": [
        "Sam sand dunes Jaisalmer camel",
        "Jaisalmer fort Rajasthan",
        "Gadisar Lake Jaisalmer",
        "Kuldhara village Jaisalmer",
        "Lake Pichola Udaipur family",
    ],
    "rupin-pass-trek": [
        "Rupin Pass trek Uttarakhand",
        "Jhaka village Uttarakhand hanging",
        "Sangla valley Himachal Kinnaur",
        "Rupin waterfall trek",
        "Kinnaur Sangla Kinner Kailash",
    ],
    "spiti-bike-circuit": [
        "Kibber village Spiti Himachal",
        "Chicham bridge Spiti",
        "Hikkim post office Spiti",
        "Langza Buddha Spiti",
        "Royal Enfield Spiti Valley motorcycle",
        "Dhankar monastery Spiti",
    ],
    "twelve-jyotirlinga-highlights-circuit": [
        "Somnath temple Gujarat",
        "Nageshwar temple Dwarka",
        "Mahakaleshwar Ujjain",
        "Omkareshwar Mandhata island",
        "Trimbakeshwar Nashik temple",
        "Grishneshwar temple Ellora",
        "Kashi Vishwanath Varanasi",
        "Baidyanath Deoghar temple",
        "Ramanathaswamy Rameswaram",
        "Ellora caves Maharashtra",
    ],
    "warwan-valley-trek": [
        "Warwan valley Kashmir trek",
        "Kishtwar Kashmir mountains",
        "Kashmir alpine meadow trek",
        "Srinagar Dal Lake trek departure",
    ],
}


def api(params: dict) -> dict:
    time.sleep(WAIT)
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": agent})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 5:
                time.sleep(15 * (attempt + 1))
                continue
            raise
    raise RuntimeError("api retries exhausted")


def search(q: str) -> list[str]:
    data = api(
        {
            "action": "query",
            "list": "search",
            "srsearch": f"{q} filetype:bitmap",
            "srnamespace": "6",
            "srlimit": "12",
            "format": "json",
        }
    )
    return [r["title"] for r in data.get("query", {}).get("search", [])]


def check_title(title: str) -> tuple[bool, int]:
    data = api(
        {
            "action": "query",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "size|mime|extmetadata",
            "format": "json",
        }
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        if "missing" in page:
            return False, 0
        ii = (page.get("imageinfo") or [{}])[0]
        w = ii.get("width") or 0
        mime = str(ii.get("mime") or "")
        lic = str((ii.get("extmetadata") or {}).get("LicenseShortName", {}).get("value") or "")
        if "nc" in lic.lower():
            return False, w
        if w >= 800 and mime.startswith("image/") and "svg" not in mime:
            return True, w
    return False, 0


def main() -> None:
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for group in sorted(GROUPS.keys()):
        if only and group != only:
            continue
        print(f"\n=== {group} ===")
        seen: set[str] = set()
        for q in GROUPS[group]:
            for title in search(q):
                if title in seen:
                    continue
                seen.add(title)
                if any(
                    x in title.lower()
                    for x in (
                        "logo",
                        "map",
                        "flag",
                        "svg",
                        "diagram",
                        "icon",
                        "sketch",
                        "gps",
                        "collage",
                        "screenshot",
                    )
                ):
                    continue
                ok, w = check_title(title)
                if ok:
                    print(f'  "{title}",  // {w}px <- {q}')


if __name__ == "__main__":
    main()