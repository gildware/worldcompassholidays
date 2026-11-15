#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-3 tour place images (width >= 800)."""
import json
import re
import sys
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch3-probe)"
WAIT = 2.8

GROUPS = {
    "mathura": ["Mathura temple", "Vishram Ghat Yamuna", "Krishna Janmasthan"],
    "vrindavan": ["Vrindavan temple", "Govardhan hill parikrama", "Banke Bihari"],
    "agra": ["Taj Mahal", "Agra Fort"],
    "ajmer": ["Ajmer Sharif Dargah", "Ana Sagar Ajmer", "Adhai Din Ka Jhonpra"],
    "pushkar": ["Pushkar lake", "Brahma temple Pushkar"],
    "ujjain": [
        "Mahakaleshwar Ujjain",
        "Shipra Ram Ghat Ujjain",
        "Harsiddhi Ujjain",
        "Kal Bhairav Ujjain",
        "Indore Rajwada",
    ],
    "manali": [
        "Vashisht temple Manali",
        "Manali mall road",
        "Naggar castle Kullu",
        "Old Manali village",
        "Kullu valley airport",
    ],
    "shimla": ["Kufri Himachal", "Mandi town Himachal", "Rock Garden Chandigarh", "Sukhna Lake Chandigarh"],
    "lonavala": ["Lonavala hill station", "Pawna lake Lonavala", "Lohagad fort", "Tungarli lake"],
    "wayanad": [
        "Wayanad Kerala",
        "Edakkal caves",
        "Soochipara falls Wayanad",
        "Chembra peak",
        "Wayanad tea plantation",
    ],
}


def api(params: dict) -> dict:
    time.sleep(WAIT)
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": agent})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except Exception as e:
            if "429" in str(e) and attempt < 4:
                time.sleep(15 * (attempt + 1))
                continue
            raise


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
    return [x["title"] for x in data.get("query", {}).get("search", [])]


def verify(title: str) -> tuple[str, int, str] | None:
    data = api(
        {
            "action": "query",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "mime|size|extmetadata",
            "format": "json",
        }
    )
    for pid, p in data.get("query", {}).get("pages", {}).items():
        if pid == "-1":
            return None
        ii = (p.get("imageinfo") or [{}])[0]
        w = ii.get("width", 0)
        mime = ii.get("mime", "")
        lic = (ii.get("extmetadata", {}).get("LicenseShortName", {}) or {}).get("value", "")
        if w >= 800 and mime.startswith("image/") and "svg" not in mime and "nc" not in lic.lower():
            return (title, w, lic)
    return None


SKIP = re.compile(
    r"logo|map|flag|svg|diagram|icon|sketch|coin|screenshot|WWII|British airmen|postcard template",
    re.I,
)


def main() -> None:
    keys = sys.argv[1:] or list(GROUPS)
    out: dict[str, list[dict]] = {}
    for key in keys:
        if key not in GROUPS:
            print(f"unknown group {key}", file=sys.stderr)
            continue
        rows: list[dict] = []
        seen: set[str] = set()
        for q in GROUPS[key]:
            print(f"# {key}: {q}", flush=True)
            for t in search(q):
                if SKIP.search(t) or t in seen:
                    continue
                seen.add(t)
                v = verify(t)
                if v:
                    row = {"title": v[0], "width": v[1], "license": v[2], "query": q}
                    rows.append(row)
                    print(f"  {v[0]}  w={v[1]}  {v[2]}", flush=True)
        out[key] = rows
    path = "/tmp/batch3-search-results.json"
    existing: dict = {}
    try:
        existing = json.load(open(path))
    except OSError:
        pass
    existing.update(out)
    json.dump(existing, open(path, "w"), indent=2)
    print(f"\nWrote {path} ({len(existing)} groups)")


if __name__ == "__main__":
    main()
