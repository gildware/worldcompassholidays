"""Add missing public UI lines to site-phrases.json."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
phrase_path = root / "src/i18n/site-phrases.json"
cache_path = root / "scripts/.ui-phrase-cache.json"
source_path = Path("/tmp/ui-to-translate.json")

rows = json.loads(phrase_path.read_text())
existing = {row["en"] for row in rows}
keys = {row["key"] for row in rows}
cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
texts = [text for text in json.loads(source_path.read_text()) if text not in existing]
locales = ["fr", "hi", "he", "ar", "ur"]


def slug(text: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:48]
    return base or "line"


def translate(text: str, locale: str) -> str:
    key = f"{locale}\u0000{text}"
    stored = cache.get(key)
    if stored:
        return stored
    query = urllib.parse.urlencode({"q": text, "langpair": f"en|{locale}"})
    request = urllib.request.Request(
        f"https://api.mymemory.translated.net/get?{query}",
        headers={"User-Agent": "WorldCompassHolidays/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)
    value = (data.get("responseData") or {}).get("translatedText") or ""
    if "MYMEMORY WARNING" in value or data.get("responseStatus") != 200 or not value.strip():
        raise RuntimeError(value or str(data.get("responseStatus")))
    cache[key] = value.strip()
    return cache[key]


added = []
print(f"to translate {len(texts)}", flush=True)
for index, text in enumerate(texts, start=1):
    record = {"page": "gap", "en": text}
    for locale in locales:
        last = None
        for attempt in range(5):
            try:
                record[locale] = translate(text, locale)
                last = None
                break
            except Exception as error:
                last = error
                time.sleep(1.5 * (attempt + 1))
        if last:
            print(f"FAIL {text[:70]} {last}", flush=True)
            record[locale] = text
        time.sleep(0.25)
    base = f"gap.{slug(text)}"
    key = base
    number = 2
    while key in keys:
        key = f"{base}-{number}"
        number += 1
    record["key"] = key
    keys.add(key)
    added.append(record)
    if index % 10 == 0:
        cache_path.write_text(json.dumps(cache, ensure_ascii=False))
        print(f"progress {index}/{len(texts)}", flush=True)

cache_path.write_text(json.dumps(cache, ensure_ascii=False))
rows.extend(added)
phrase_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n")
print(f"added {len(added)} total {len(rows)}", flush=True)
