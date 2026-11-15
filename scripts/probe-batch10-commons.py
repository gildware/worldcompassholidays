#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-10 tour place images (width >= 800)."""
import json
import sys
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch10-probe)"
WAIT = 2.0

# Curated titles to verify from fetch-batch10-empty-tour-images.ts
VERIFY: dict[str, list[str]] = {
    "shimla-manali-combo": [
        "File:Shimla GPO Mall Road.jpg",
        "File:Shimla Town Hall.jpg",
        "File:Gaiety Theatre Shimla.jpg",
        "File:Himalayan Nature Park Kufri.jpg",
        "File:Manu Temple Old Manali.jpg",
        "File:Manali river Beas bridge.jpg",
        "File:Chandigarh International Airport.jpg",
    ],
    "ranthambore-jaipur-combo": [
        "File:Albert Hall Museum Jaipur.jpg",
        "File:Nahargarh Fort Jaipur.jpg",
        "File:Sheesh Mahal Amber Fort Jaipur.jpg",
        "File:Tiger in Ranthambore National Park.jpg",
        "File:Padam Talao Ranthambore.jpg",
        "File:Jaipur International Airport.jpg",
    ],
    "andaman-island-honeymoon": [
        "File:Radhanagar Beach Havelock sunset, Andaman Islands.jpg",
        "File:Chidiyatapu Andaman sunset.jpg",
        "File:Havelock Island, Radhanagar Beach, tropical bliss, Andaman Islands.jpg",
        "File:Cellular Jail, Andaman, Port Blair, India.jpg",
    ],
    "nafran-valley-trek": [
        "File:Sonamarg.jpg",
        "File:Thajiwas Glacier.jpg",
        "File:Sonamarg meadow.jpg",
        "File:Sind River Sonamarg.jpg",
    ],
    "leh-ladakh-honeymoon": [
        "File:Shanti Stupa Leh.jpg",
        "File:Leh Palace, Ladakh, India.jpg",
        "File:Jampa Buddha - Diskit Monastery - Ladakh - 1.jpg",
        "File:Pangong Lake in Ladakh.jpg",
        "File:Morning at Pangong Lake.jpg",
    ],
    "har-ki-dun-trek": [
        "File:Har Ki Dun Valley.jpg",
        "File:Har ki dun.jpg",
        "File:Osla Village Uttarakhand.jpg",
        "File:Sankri village Uttarakhand.jpg",
        "File:Swargarohini peak.jpg",
    ],
    "ladakh-family-expedition": [
        "File:Thiksey Monastery, Ladakh 14.jpg",
        "File:Hall of Fame Leh Ladakh.jpg",
        "File:Diskit Valley view from the Monastery.jpg",
        "File:En route Pangong Lake from Leh, Ladakh, India.jpg",
        "File:Leh Kushok Bakula Rimpochee Airport terminal.jpg",
    ],
    "north-sikkim-lachen-lachung-yumthang": [
        "File:Yumthang Valley of flowers Sikkim.jpg",
        "File:Yumthang valley Sikkim.jpg",
        "File:Lachung village Sikkim.jpg",
        "File:Lachen Sikkim.jpg",
        "File:Gurudongmar Lake Sikkim.jpg",
        "File:Zero Point North Sikkim.jpg",
    ],
}

GROUPS: dict[str, list[str]] = {
    "shimla-manali-combo": [
        "Shimla GPO Mall Road",
        "Shimla Town Hall Himachal",
        "Gaiety Theatre Shimla",
        "Kufri Himalayan Nature Park",
        "Manu Temple Old Manali",
        "Beas river Manali",
        "Chandigarh airport India",
    ],
    "ranthambore-jaipur-combo": [
        "Albert Hall Museum Jaipur",
        "Nahargarh Fort Jaipur",
        "Sheesh Mahal Amber Fort",
        "Tiger Ranthambore National Park",
        "Sawai Madhopur lodge",
        "Ranthambore Fort Rajasthan",
    ],
    "andaman-island-honeymoon": [
        "Radhanagar Beach Havelock sunset",
        "Chidiyatapu Andaman",
        "Vijay Nagar beach Havelock",
        "Cellular Jail Port Blair night",
    ],
    "nafran-valley-trek": [
        "Sonamarg meadow Kashmir trek",
        "Thajiwas glacier Sonamarg",
        "Sind river Sonamarg",
        "Kashmir alpine meadow trek",
        "Srinagar airport Kashmir",
    ],
    "leh-ladakh-honeymoon": [
        "Shanti Stupa Leh",
        "Leh Palace Ladakh",
        "Diskit monastery Buddha Ladakh",
        "Pangong Lake honeymoon Ladakh",
        "Chang La pass Ladakh",
    ],
    "har-ki-dun-trek": [
        "Har Ki Dun valley Uttarakhand",
        "Osla village Uttarakhand",
        "Sankri village Garhwal",
        "Swargarohini peak Har Ki Dun",
        "Govind National Park trek",
    ],
    "ladakh-family-expedition": [
        "Thiksey Monastery Ladakh",
        "Hall of Fame Leh",
        "Khardung La Ladakh family",
        "Pangong lake family Ladakh",
        "Shyok river Nubra",
    ],
    "north-sikkim-lachen-lachung-yumthang": [
        "Yumthang valley flowers Sikkim",
        "Lachung village Sikkim",
        "Lachen North Sikkim",
        "Gurudongmar Lake Sikkim",
        "Zero Point Sikkim snow",
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
    mode = sys.argv[2] if len(sys.argv) > 2 else "both"

    for group in sorted(set(list(GROUPS.keys()) + list(VERIFY.keys()))):
        if only and group != only:
            continue
        print(f"\n=== {group} ===")
        if mode in ("both", "verify"):
            print("  -- curated verify --")
            for title in VERIFY.get(group, []):
                ok, w = check_title(title)
                mark = "OK" if ok else "MISS"
                print(f"  [{mark}] {title} ({w}px)")
        if mode in ("both", "search"):
            print("  -- search --")
            seen: set[str] = set()
            for q in GROUPS.get(group, []):
                for title in search(q):
                    if title in seen:
                        continue
                    seen.add(title)
                    ok, w = check_title(title)
                    mark = "OK" if ok else "skip"
                    print(f"  [{mark}] {title} ({w}px)  <- {q}")


if __name__ == "__main__":
    main()