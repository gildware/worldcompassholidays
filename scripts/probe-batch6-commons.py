#!/usr/bin/env python3
"""Probe Wikimedia Commons for batch-6 tour place images (width >= 800)."""
import json
import re
import time
import urllib.parse
import urllib.request

agent = "WorldCompassHoliday/1.0 (batch6-probe)"
WAIT = 2.0

GROUPS = {
    "puri": [
        "Jagannath Temple Puri",
        "Konark Sun Temple",
        "Puri beach Odisha",
        "Lingaraj Temple Bhubaneswar",
    ],
    "udaipur-romantic": [
        "Sajjangarh Monsoon Palace Udaipur",
        "Fateh Sagar Lake Udaipur",
        "Ambrai Ghat Udaipur",
        "Taj Lake Palace Udaipur",
    ],
    "ooty-family": [
        "Botanical Garden Ooty",
        "Ooty Lake boating",
        "Doddabetta Ooty",
        "Sim Park Coonoor",
        "Lamb Rock Coonoor",
    ],
    "pangong-camp": [
        "Pangong Lake Ladakh",
        "Spangmik Pangong",
        "Chang La Ladakh",
        "Leh Palace Ladakh",
    ],
    "darjeeling": [
        "Tiger Hill Darjeeling",
        "Darjeeling tea garden",
        "Darjeeling Himalayan Railway",
        "Japanese Peace Pagoda Darjeeling",
    ],
    "ooty-nilgiris": [
        "Rose Garden Ooty",
        "Dolphin Nose Coonoor",
        "Nilgiri Mountain Railway Coonoor",
        "Ooty tea factory",
    ],
    "pondy": [
        "Pondicherry White Town",
        "Matrimandir Auroville",
        "Promenade Rock Beach Pondicherry",
        "French War Memorial Pondicherry",
    ],
    "rishikesh-yoga": [
        "Parmarth Niketan aarti Rishikesh",
        "Beatles Ashram Rishikesh",
        "Neer Garh waterfall Rishikesh",
        "Yoga Rishikesh Ganges",
    ],
}


def api(params: dict) -> dict:
    time.sleep(WAIT)
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": agent})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


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


def width_ok(title: str) -> bool:
    data = api(
        {
            "action": "query",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "size|mime",
            "format": "json",
        }
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        ii = (page.get("imageinfo") or [{}])[0]
        w = ii.get("width") or 0
        mime = str(ii.get("mime") or "")
        if w >= 800 and mime.startswith("image/") and "svg" not in mime:
            return True
    return False


def main() -> None:
    for group, queries in GROUPS.items():
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
