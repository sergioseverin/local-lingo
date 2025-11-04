#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build a top-10,000 English word list (SUBTLEX-US style).
- If you have a local SUBTLEX-US CSV, use: --subtlex-csv /path/to/SUBTLEX-US.csv
  The CSV must contain a word column (like 'Word' or 'Word_lemma') and a frequency column.
- Otherwise, fall back to the `wordfreq` library (modern, multi-corpus spoken usage).
- Outputs: top_10000.txt (one lowercase word per line).

Examples:
  python scripts/build_wordlist.py
  python scripts/build_wordlist.py --limit 2000
  python scripts/build_wordlist.py --subtlex-csv ./data/SUBTLEX-US.csv --limit 10000
"""

import argparse
import re
import sys
from pathlib import Path

# Optional: pandas is convenient for CSV; if missing and CSV requested, we error nicely.
try:
    import pandas as pd  # type: ignore
    HAVE_PANDAS = True
except Exception:
    HAVE_PANDAS = False

# wordfreq is zero-config and gives us top-N words of modern usage
try:
    from wordfreq import top_n_list  # type: ignore
    HAVE_WORDFREQ = True
except Exception:
    HAVE_WORDFREQ = False

def normalize_word(w: str) -> str:
    w = w.strip().lower()
    # keep only pure alphabetic tokens (no digits, hyphens, apostrophes)
    if not re.fullmatch(r"[a-z]+", w):
        return ""
    return w

def build_from_subtlex(csv_path: Path, limit: int) -> list[str]:
    if not HAVE_PANDAS:
        print("ERROR: pandas is required to parse SUBTLEX CSV. `pip install pandas`", file=sys.stderr)
        sys.exit(1)
    if not csv_path.exists():
        print(f"ERROR: File not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(csv_path, encoding="utf-8", engine="python")
    # Try common column names; adjust if your file differs
    candidate_word_cols = [c for c in df.columns if c.lower() in ("word", "lemma", "word_lemma", "w")]
    if not candidate_word_cols:
        # Heuristic: pick the first string-like column
        candidate_word_cols = [c for c in df.columns if df[c].dtype == "object"]
    word_col = candidate_word_cols[0]

    # Try to sort by a frequency column if present
    freq_cols = [c for c in df.columns if c.lower().startswith("freq") or c.lower().endswith("frequency")]
    if freq_cols:
        df = df.sort_values(freq_cols[0], ascending=False)

    words = []
    seen = set()
    for w in df[word_col].astype(str).tolist():
        norm = normalize_word(w)
        if not norm:
            continue
        if norm in seen:
            continue
        seen.add(norm)
        words.append(norm)
        if len(words) >= limit:
            break
    return words

def build_from_wordfreq(limit: int) -> list[str]:
    if not HAVE_WORDFREQ:
        print("ERROR: wordfreq not installed. `pip install wordfreq`", file=sys.stderr)
        sys.exit(1)

    # Get more than needed, we'll clean/dedupe down to `limit`
    raw = top_n_list("en", n=limit * 5, wordlist="best")

    # Optional lightweight stemming to reduce inflectional variants
    try:
        from nltk.stem import PorterStemmer  # no corpora needed
        stemmer = PorterStemmer()
        def stem(w: str) -> str:
            return stemmer.stem(w)
    except Exception:
        # fallback: very light singularization
        def stem(w: str) -> str:
            if w.endswith("ies") and len(w) > 3:
                return w[:-3] + "y"
            if w.endswith("es") and len(w) > 2:
                return w[:-2]
            if w.endswith("s") and len(w) > 1:
                return w[:-1]
            return w

    words = []
    seen = set()
    for w in raw:
        norm = normalize_word(w)
        if not norm:
            continue
        head = stem(norm)
        if head and head not in seen:
            seen.add(head)
            words.append(head)
            if len(words) >= limit:
                break
    return words

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=10_000, help="Number of words to keep (default 10,000)")
    ap.add_argument("--subtlex-csv", type=Path, default=None, help="Path to local SUBTLEX-US CSV (optional)")
    ap.add_argument("--out", type=Path, default=Path("top_10000.txt"), help="Output file path")
    args = ap.parse_args()

    if args.subtlex_csv:
        words = build_from_subtlex(args.subtlex_csv, args.limit)
        source = f"SUBTLEX CSV ({args.subtlex_csv})"
    else:
        words = build_from_wordfreq(args.limit)
        source = "wordfreq (SUBTLEX-like modern usage)"

    print(f"Source: {source}")
    print(f"Final word count: {len(words)}")
    args.out.write_text("\n".join(words), encoding="utf-8")
    print(f"Wrote: {args.out.resolve()}")

if __name__ == "__main__":
    main()