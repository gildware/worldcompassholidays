#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-7 tour place images (width >= 800)."""
import json
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch7-probe)"
WAIT = 2.0

GROUPS = {
    "holi-mathura": [
        "Holi Barsana Uttar Pradesh",
        "Lathmar Holi Barsana",
        "Holi Vrindavan colors",
        "Banke Bihari Holi",
        "Dwarkadhish Temple Mathura",
        "Yamuna ghat Mathura",
    ],
    "periyar-thekkady": [
        "Periyar Lake Kerala boat",
        "Thekkady wildlife Kerala",
        "Periyar National Park lake",
        "Kumily spice plantation Kerala",
        "Cardamom Hills Kerala",
    ],
    "rann-utsav": [
        "Rann Utsav Dhordo tents",
        "Rann Utsav festival Kutch",
        "Kalo Dungar Kutch",
        "Hodka village Kutch",
        "Bhuj Aina Mahal",
        "Kutch handicraft embroidery",
    ],
    "pushkar-fair": [
        "Pushkar camel fair",
        "Pushkar fair Rajasthan camels",
        "Pushkar fair ferris wheel",
        "Kartik Purnima Pushkar",
        "Pushkar lake fair",
    ],
    "gurez-valley-trek": [
        "Gurez valley Kashmir trek",
        "Dawar village Gurez",
        "Razdan pass Kashmir",
        "Kishanganga Gurez",
        "Gurez meadow shepherd",
    ],
    "naranag-gangabal": [
        "Gangbal Lake Kashmir",
        "Gangabal trek Harmukh",
        "Naranag temple Ganderbal",
        "Trunkhol meadow Kashmir",
        "Alpine lake trek Kashmir",
    ],
    "dwarka-somnath": [
        "Dwarkadhish Temple Dwarka",
        "Bet Dwarka temple",
        "Somnath temple Gujarat",
        "Nageshwar Jyotirlinga",
        "Porbandar Gujarat",
    ],
    "rameswaram": [
        "Ramanathaswamy Temple Rameswaram",
        "Pamban bridge Rameswaram",
        "Dhanushkodi Tamil Nadu",
        "Rameswaram temple corridor",
        "Agni Theertham Rameswaram",
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
            "srlimit": "15",
            "format": "json",
        }
    )
    return [r["title"] for r in data.get("query", {}).get("search", [])]


def width_ok(title: str) -> bool:
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
        ii = (page.get("imageinfo") or [{}])[0]
        w = ii.get("width") or 0
        mime = str(ii.get("mime") or "")
        lic = str((ii.get("extmetadata") or {}).get("LicenseShortName", {}).get("value") or "")
        if "nc" in lic.lower():
            return False
        if w >= 800 and mime.startswith("image/") and "svg" not in mime:
            return True
    return False


import sys

def main() -> None:
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for group, queries in GROUPS.items():
        if only and group != only:
            continue
        print(f"\n=== {group} ===")
        seen: set[str] = set()
        for q in queries:
            for title in search(q):
                if title in seen:
                    continue
                seen.add(title)
                ok = width_ok(title)
                mark = "OK" if ok else "skip"
                print(f"  [{mark}] {title}")


if __name__ == "__main__":
    main()
