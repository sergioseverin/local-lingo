#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build a multilingual offline dictionary from top_10000.txt using Google Cloud Translate (v3).

- Reads: top_10000.txt (one lowercase word per line)
- Writes:
    base.json           ({"hello": {"fr": "bonjour", ...}, ...})
    base.min.json.gz    (gzip-compressed)

Features:
- Batching (100 words/request) per language
- Resumable via ./cache/{lang}.json (so re-runs don’t re-bill)
- Progress bars (tqdm)
- Retry with exponential backoff
- Cost estimate printed at the end (based on $20/M chars minus 500k free)

Usage:
  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
  export GOOGLE_CLOUD_PROJECT=<your-project-id>

  pip install google-cloud-translate google-api-core tqdm orjson
  python scripts/build_dictionary.py --limit 200   # test
  python scripts/build_dictionary.py               # full 10k

CLI flags:
  --limit N           only first N words (testing)
  --languages a,b,c   override target languages (comma-separated ISO)
  --dry-run           simulate cost only, no API calls
"""

from __future__ import annotations
import argparse
import gzip
import json
import math
import os
import sys
import time
from pathlib import Path
from typing import Dict, List

try:
    import orjson as fastjson  # type: ignore
except Exception:
    fastjson = None

from tqdm import tqdm

# Google Cloud Translate v3
from google.cloud import translate  # type: ignore
from google.api_core.exceptions import GoogleAPIError  # type: ignore

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / "cache"
CACHE_DIR.mkdir(exist_ok=True)

DEFAULT_LANGS = [
    "fr","es","de","it","pt","nl","pl","sv","no","da","fi","el","cs","sk","sl",
    "hu","ro","bg","sr","hr","mk","lt","lv","et","uk","ru","tr","is","ga"
]

BATCH_SIZE = 100
PRICE_PER_MILLION = 20.0  # USD per 1M chars
FREE_CHARS = 500_000

def read_wordlist(limit: int | None) -> List[str]:
    wl = (ROOT / "top_10000.txt")
    if not wl.exists():
        print(f"ERROR: {wl} not found. Run scripts/build_wordlist.py first.", file=sys.stderr)
        sys.exit(1)
    words = [w.strip().lower() for w in wl.read_text(encoding="utf-8").splitlines() if w.strip()]
    if limit:
        words = words[:limit]
    return words

def load_cache(lang: str) -> Dict[str, str]:
    fp = CACHE_DIR / f"{lang}.json"
    if not fp.exists():
        return {}
    try:
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return {}

def save_cache(lang: str, data: Dict[str, str]) -> None:
    fp = CACHE_DIR / f"{lang}.json"
    fp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def chunks(lst: List[str], size: int) -> List[List[str]]:
    for i in range(0, len(lst), size):
        yield lst[i:i+size]

def estimate_chars(words: List[str], target_langs: List[str]) -> int:
    # Rough char count = sum(len(word)) * num_langs
    total_in = sum(len(w) for w in words)
    return total_in * len(target_langs)

def cost_estimate(chars: int) -> float:
    billable = max(0, chars - FREE_CHARS)
    return (billable / 1_000_000.0) * PRICE_PER_MILLION

def translate_batch(
    client: translate.TranslationServiceClient,
    project_id: str,
    texts: List[str],
    target_lang: str,
    source_lang: str = "en",
    retries: int = 3,
    backoff: float = 0.8
) -> List[str]:
    # Endpoint & request (v3)
    parent = f"projects/{project_id}/locations/global"
    attempt = 0
    while True:
        try:
            response = client.translate_text(
                request={
                    "parent": parent,
                    "contents": texts,
                    "mime_type": "text/plain",
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                }
            )
            # Map outputs back to input order
            out = [t.translated_text for t in response.translations]
            # Ensure length matches (rare API anomalies)
            if len(out) != len(texts):
                # Pad or trim to match
                out = (out + [""] * len(texts))[:len(texts)]
            return out
        except GoogleAPIError as e:
            attempt += 1
            if attempt > retries:
                raise
            sleep = (backoff ** attempt) + (0.05 * attempt)
            time.sleep(sleep)

def build_dictionary(words: List[str], target_langs: List[str], dry_run: bool) -> Dict[str, Dict[str, str]]:
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if not dry_run and not project_id:
        print("ERROR: GOOGLE_CLOUD_PROJECT is not set.", file=sys.stderr)
        sys.exit(1)

    # Global cost tracking
    total_chars = 0

    # Prepare output structure
    # We'll fill per-english word: translations[word][lang] = translated
    translations: Dict[str, Dict[str, str]] = {w: {} for w in words}

    # Client (only if not dry-run)
    client = None
    if not dry_run:
        client = translate.TranslationServiceClient()

    # Per-language cache & progress
    for lang in target_langs:
        cache = load_cache(lang)

        # Determine which words are still missing for this lang
        missing = [w for w in words if w not in cache]
        if not missing:
            # cache hit for entire language
            for w in words:
                translations[w][lang] = cache[w]
            continue

        # Progress bar per language
        pbar = tqdm(total=len(missing), desc=f"{lang}", unit="w")

        # Process in batches
        for batch in chunks(missing, BATCH_SIZE):
            if dry_run:
                # simulate translation
                fake_out = batch  # pretend identity
                for w, t in zip(batch, fake_out):
                    cache[w] = t
                pbar.update(len(batch))
                continue

            # Real call
            out = translate_batch(client, project_id, batch, lang)
            for w, t in zip(batch, out):
                cache[w] = t
            # Update char counter
            total_chars += sum(len(w) for w in batch)
            # Save cache every batch to be resumable
            save_cache(lang, cache)
            pbar.update(len(batch))

        pbar.close()

        # Merge cache into master translations
        for w in words:
            translations[w][lang] = cache[w]

    # Sort keys for determinism
    translations = dict(sorted(translations.items(), key=lambda x: x[0]))

    # Print cost estimate
    est = cost_estimate(total_chars)
    print(f"\nCharacters sent (source * langs): {total_chars:,}")
    print(f"Estimated cost (after 500k free): ${est:,.2f}")

    return translations

def write_json(path: Path, data) -> None:
    if fastjson:
        path.write_bytes(fastjson.dumps(data, option=fastjson.OPT_INDENT_2))
    else:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def write_gzip(path: Path, data) -> None:
    raw = fastjson.dumps(data) if fastjson else json.dumps(data, ensure_ascii=False).encode("utf-8")
    with gzip.open(path, "wb") as f:
        f.write(raw)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="Only process first N words (testing)")
    ap.add_argument("--languages", type=str, default=None, help="Override target languages (comma-separated)")
    ap.add_argument("--dry-run", action="store_true", help="Simulate cost only; no API calls")
    args = ap.parse_args()

    words = read_wordlist(args.limit)
    if args.languages:
        langs = [s.strip() for s in args.languages.split(",") if s.strip()]
    else:
        langs = DEFAULT_LANGS

    # Show pre-flight estimate
    est_chars = estimate_chars(words, langs)
    est_cost = cost_estimate(est_chars)
    print(f"Words: {len(words):,} | Languages: {len(langs)}")
    print(f"Pre-flight estimate: chars={est_chars:,}, est cost=${est_cost:,.2f} (after 500k free)")

    data = build_dictionary(words, langs, dry_run=args.dry_run)

    out_json = ROOT / "base.json"
    out_gz = ROOT / "base.min.json.gz"
    write_json(out_json, data)
    write_gzip(out_gz, data)
    print(f"Wrote: {out_json.resolve()}")
    print(f"Wrote: {out_gz.resolve()}")

if __name__ == "__main__":
    main()