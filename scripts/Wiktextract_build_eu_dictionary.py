import gzip
import json
from collections import defaultdict
from pathlib import Path

# Input: huge Wiktextract dump (all languages)
INPUT_PATH = Path("data/wiktextract/raw-wiktextract-data.jsonl.gz")
# Output: compact dictionary for your app
OUTPUT_PATH = Path("app/data/eu_dictionary.json")

# Target languages for Euro Lingo (Wiktextract uses ISO codes)
EU_LANG_CODES = {
    "fr", "es", "de", "it", "sv", "no", "da", "fi", "nl", "pt",
    "pl", "cs", "sk", "sl", "hu", "ro", "bg", "hr", "sr", "bs",
    "el", "lt", "lv", "et", "tr", "ru", "uk", "ga", "is", "mk",
}

def main():
    if not INPUT_PATH.exists():
        raise SystemExit(f"Input file not found: {INPUT_PATH}")

    # english_word -> lang_code -> translation
    translations = defaultdict(dict)
    seen_entries = 0

    def process_translations(word: str, trans_list):
        for t in trans_list:
            code = t.get("code")
            target_word = t.get("word")
            if not code or not target_word:
                continue
            if code not in EU_LANG_CODES:
                continue
            # Only keep the first translation per language for now
            if code not in translations[word]:
                translations[word][code] = target_word

    print(f"Reading {INPUT_PATH} ...")
    with gzip.open(INPUT_PATH, "rt", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            # We only care about English headwords
            if obj.get("lang") != "English":
                continue

            word = obj.get("word")
            if not word:
                continue

            # Normalize the key for your app
            word = word.lower()

            # Top-level translations
            if "translations" in obj:
                process_translations(word, obj["translations"])

            # Sense-level translations
            for sense in obj.get("senses", []):
                if "translations" in sense:
                    process_translations(word, sense["translations"])

            seen_entries += 1
            if seen_entries % 100000 == 0:
                print(
                    f"Processed {seen_entries} English entries, "
                    f"{len(translations)} words with EU translations so far..."
                )

    print(f"Done. Total English words with EU translations: {len(translations)}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as out:
        json.dump(translations, out, ensure_ascii=False)

    print(f"Written dictionary to {OUTPUT_PATH.resolve()}")

if __name__ == "__main__":
    main()