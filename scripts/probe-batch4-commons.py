#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-4 tour place images (width >= 800)."""
import json
import re
import sys
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch4-probe)"
WAIT = 2.5

GROUPS = {
    "beas-kund": [
        "Beas Kund lake Manali",
        "Solang Valley Manali",
        "Solang meadow Himachal",
        "Dhundi Manali trek",
        "Hampta Pass Beas",
    ],
    "bhrigu": [
        "Bhrigu Lake Himachal",
        "Bhrigu lake trek",
        "Gulaba Manali",
        "Rola Kholi camp",
    ],
    "bir-camp": [
        "Bir Billing paragliding",
        "Billing takeoff Himachal",
        "Chokling Monastery Bir",
        "Bir village Kangra",
        "Tandem paragliding Bir",
    ],
    "sundarbans": [
        "Sundarbans mangrove",
        "Sundarbans tiger reserve",
        "Sundarbans boat",
        "Godkhali Sundarbans",
        "Sajnekhali watch tower",
        "Netidhopani Sundarbans",
    ],
    "goa-family": [
        "Baga beach Goa",
        "Calangute beach Goa",
        "Basilica Bom Jesus Old Goa",
        "Se Cathedral Goa",
        "Fort Aguada Goa",
        "Candolim beach Goa",
    ],
    "jaipur-udaipur": [
        "Hawa Mahal Jaipur",
        "Amber Fort Jaipur",
        "City Palace Udaipur",
        "Lake Pichola Udaipur",
        "Jag Mandir Udaipur",
        "Saheliyon Ki Bari Udaipur",
        "Jal Mahal Jaipur",
    ],
    "rishikesh-raft": [
        "Rafting Ganga Rishikesh",
        "River rafting Shivpuri",
        "Kaudiyala rafting",
        "Ram Jhula Rishikesh rafting",
        "Ganga rapids Rishikesh",
    ],
    "coorg": [
        "Coorg coffee plantation",
        "Madikeri Karnataka",
        "Abbey Falls Coorg",
        "Raja Seat Madikeri",
        "Talacauvery Coorg",
        "Dubare elephant camp",
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
            "srlimit": "15",
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
    r"logo|map|flag|svg|diagram|icon|sketch|coin|screenshot|WWII|British airmen|postcard template|tegelberg|aerostatic",
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
    path = "/tmp/batch4-search-results.json"
    json.dump(out, open(path, "w"), indent=2)
    print(f"\nWrote {path} ({len(out)} groups)")


if __name__ == "__main__":
    main()
