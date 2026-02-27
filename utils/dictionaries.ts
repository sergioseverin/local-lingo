/**
 * Offline dictionary utilities for Local Lingo
 * Loads and provides access to pre-translated word dictionaries
 */

import { EU_LABEL_POS } from '../data/eu_label_positions';

interface ReverseIndexCandidate {
  fr: string;
  n: number;
}

type ReverseIndex = Record<string, ReverseIndexCandidate[]>;

// French reverse indexes (loaded on demand)
let frReverseIndexEs: ReverseIndex | null = null;
let frReverseIndexIt: ReverseIndex | null = null;

// Type definitions
interface DictionaryEntry {
  [languageCode: string]: string;
}

interface Dictionary {
  [word: string]: DictionaryEntry;
}

// Global dictionary storage (keyed by language code)
let dictionaries: Record<string, Dictionary> = {};
let isLoading = false;

/**
 * Load the offline dictionary for a specific language
 * @param dictionaryFile The file name of the dictionary to load
 * @param languageCode The language code (e.g., EN, DE)
 */
export async function loadDictionary(dictionaryFile: string, languageCode: string): Promise<boolean> {
  if (dictionaries[languageCode]) {
    console.log(`Dictionary for ${languageCode} already loaded`);
    return true;
  }

  if (isLoading) {
    console.log('A dictionary is already being loaded');
    return false;
  }

  try {
    isLoading = true;
    console.log(`Loading offline dictionary for ${languageCode} from ${dictionaryFile}...`);

    // Static mapping of dictionary files to their imports
    const dictionaryFileMap: Record<string, any> = {
      'eu_en_dictionary.json': require('../app/data/eu_en_dictionary.json'),
      'eu_de_dictionary.json': require('../app/data/eu_de_dictionary.json'),
      'eu_es_dictionary.json': require('../app/data/eu_es_dictionary.json'),
      'eu_fr_dictionary.json': require('../app/data/eu_fr_dictionary.json'),
      'eu_it_dictionary.json': require('../app/data/eu_it_dictionary.json'),

      // NEW: reverse indexes (pick .json or .json.gz depending on what you shipped)
      // If you generated .json.gz, you cannot require() it directly. See note below.
      'fr_reverse_index_es.json': require('../app/data/fr_reverse_index_es.json'),
      'fr_reverse_index_it.json': require('../app/data/fr_reverse_index_it.json'),
    };

    const dictionaryData = dictionaryFileMap[dictionaryFile];
    if (!dictionaryData) {
      throw new Error(`Dictionary file not found: ${dictionaryFile}`);
    }

    dictionaries[languageCode] = dictionaryData;

    const wordCount = Object.keys(dictionaryData).length;
    const firstWord = Object.keys(dictionaryData)[0];
    const languageCount = firstWord ? Object.keys(dictionaryData[firstWord]).length : 0;

    console.log(`✅ Dictionary for ${languageCode} loaded successfully: ${wordCount} words in ${languageCount} languages`);

    // ---------------------------
    // NEW: If ES/IT, also load FR dict + reverse index
    // ---------------------------
    const lc = languageCode.toUpperCase();

    if (lc === 'ES' || lc === 'IT') {
      // Ensure French dictionary is loaded
      if (!dictionaries['FR']) {
        console.log('Loading French dictionary for fallback...');
        const frData = dictionaryFileMap['eu_fr_dictionary.json'];
        if (!frData) throw new Error('French dictionary not found in dictionaryFileMap');
        dictionaries['FR'] = frData;

        const frCount = Object.keys(frData).length;
        console.log(`✅ French dictionary loaded for fallback: ${frCount} words`);
      }

      // Load correct reverse index
      if (lc === 'ES' && !frReverseIndexEs) {
        console.log('Loading fr_reverse_index_es for fallback...');
        const idx = dictionaryFileMap['fr_reverse_index_es.json'];
        if (!idx) throw new Error('fr_reverse_index_es.json not found in dictionaryFileMap');
        frReverseIndexEs = idx as ReverseIndex;
        console.log(`✅ fr_reverse_index_es loaded: ${Object.keys(frReverseIndexEs).length} keys`);
      }

      if (lc === 'IT' && !frReverseIndexIt) {
        console.log('Loading fr_reverse_index_it for fallback...');
        const idx = dictionaryFileMap['fr_reverse_index_it.json'];
        if (!idx) throw new Error('fr_reverse_index_it.json not found in dictionaryFileMap');
        frReverseIndexIt = idx as ReverseIndex;
        console.log(`✅ fr_reverse_index_it loaded: ${Object.keys(frReverseIndexIt).length} keys`);
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to load dictionary for ${languageCode}:`, error);
    return false;
  } finally {
    isLoading = false;
  }
}

// ---------------------------
// NEW: French triangulation helpers (ES/IT fallback)
// ---------------------------

function pickBestFrenchCandidate(candidates: ReverseIndexCandidate[]): string | null {
  if (!candidates || candidates.length === 0) return null;

  // Prefer higher "n" (coverage score from build step)
  let best = candidates[0];
  for (const c of candidates) {
    if (c.n > best.n) best = c;
  }
  return best.fr || null;
}

function getFrenchFallbackEntry(normalizedWord: string, languageCode: string): DictionaryEntry | null {
  const lc = languageCode.toUpperCase();
  if (lc !== 'ES' && lc !== 'IT') return null;

  const frDict = getFrenchDictionary();
  const rev = getFrenchReverseIndexFor(lc);
  if (!frDict || !rev) return null;

  const candidates = rev[normalizedWord];
  if (!candidates || candidates.length === 0) return null;

  const frKey = pickBestFrenchCandidate(candidates);
  if (!frKey) return null;

  return frDict[frKey] || null;
}

export function getFrenchDictionary(): Dictionary | null {
  return dictionaries['FR'] || null;
}

export function getFrenchReverseIndexFor(langCode: string): ReverseIndex | null {
  const lc = langCode.toUpperCase();
  if (lc === 'ES') return frReverseIndexEs;
  if (lc === 'IT') return frReverseIndexIt;
  return null;
}

/**
 * Get local translation for a word in the specified language
 * @param word The word to translate
 * @param languageCode The language code (e.g., EN, DE)
 * @returns Record<string, string> mapping country codes to translations, or null if word not found
 */
export function getLocalTranslation(word: string, languageCode: string): Record<string, string> | null {
  const dictionary = dictionaries[languageCode]; // Retrieve the dictionary for the specified language
  if (!dictionary) {
    console.warn(`Dictionary for ${languageCode} not loaded yet. Call loadDictionary() first.`);
    return null;
  }

  const normalizedWord = word.toLowerCase().trim();
  const dictionaryEntry = dictionary[normalizedWord];

  // NEW: Triangulation fallback entry (only for ES/IT)
  const lc = languageCode.toUpperCase();
  const fallbackEntry = (lc === 'ES' || lc === 'IT')
    ? getFrenchFallbackEntry(normalizedWord, lc)
    : null;

  // If the word is missing in the source dictionary AND we have no fallback, return null
  if (!dictionaryEntry && !fallbackEntry) {
    console.log(`Word "${word}" not found in offline dictionary for ${languageCode}`);
    return null;
  }

  // Prefer English translation from primary entry, else fallback
  const englishTranslation = dictionaryEntry?.['en'] || fallbackEntry?.['en'];

  const result: Record<string, string> = {}; // Initialize result to store translations

  Object.entries(EU_LABEL_POS).forEach(([countryCode, labelData]) => {
    const baseLang = labelData.lang.split('-')[0];

    // Always show the English translation for GB and IE
    if ((countryCode === 'GB' || countryCode === 'IE') && englishTranslation) {
      result[countryCode] = englishTranslation;
      return;
    }

    // Primary translation from source dictionary (if present)
    let translation = dictionaryEntry?.[baseLang];

    // For Croatian (HR), Bosnian (BA), Serbian (RS), use Serbo-Croatian (sh/SB) if their own translation is missing
    if (!translation && (countryCode === 'HR' || countryCode === 'BA' || countryCode === 'RS')) {
      translation = dictionaryEntry?.['sh'] || dictionaryEntry?.['sb'];
    }

    // NEW: If missing, fill via French triangulation fallback
    if (!translation && fallbackEntry) {
      translation = fallbackEntry[baseLang];

      // Keep your HR/BA/RS fallback logic for FR entry too
      if (!translation && (countryCode === 'HR' || countryCode === 'BA' || countryCode === 'RS')) {
        translation = fallbackEntry['sh'] || fallbackEntry['sb'];
      }
    }

    if (translation) {
      result[countryCode] = translation;
    }
  });

  console.log(`📖 Local translation for "${word}" in ${languageCode}: ${Object.keys(result).length} countries translated`);
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Check if dictionary is ready
 */
export function isDictionaryReady(): boolean {
  return Object.keys(dictionaries).length > 0;
}

/**
 * Get dictionary statistics
 * @param languageCode Optional language code (e.g. "EN"). If omitted, returns stats for all loaded dictionaries.
 */
export function getDictionaryStats(
  languageCode?: string
): { languageCode: string; wordCount: number; languageCount: number } | { totalLoaded: number; perLanguage: Array<{ languageCode: string; wordCount: number; languageCount: number }> } | null {
  if (!dictionaries) return null;

  // If a specific dictionary is requested
  if (languageCode) {
    const dict = dictionaries[languageCode];
    if (!dict) return null;

    const words = Object.keys(dict);
    const wordCount = words.length;
    const languageCount = wordCount > 0 ? Object.keys(dict[words[0]]).length : 0;

    return { languageCode, wordCount, languageCount };
  }

  // Otherwise return stats for all loaded dictionaries
  const loadedLangs = Object.keys(dictionaries);
  const perLanguage = loadedLangs.map((lc) => {
    const dict = dictionaries[lc];
    const words = Object.keys(dict);
    const wordCount = words.length;
    const languageCount = wordCount > 0 ? Object.keys(dict[words[0]]).length : 0;
    return { languageCode: lc, wordCount, languageCount };
  });

  return {
    totalLoaded: loadedLangs.length,
    perLanguage,
  };
}