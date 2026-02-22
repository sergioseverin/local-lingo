/**
 * Offline dictionary utilities for Local Lingo
 * Loads and provides access to pre-translated word dictionaries
 */

import { EU_LABEL_POS } from '../data/eu_label_positions';

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
    };

    const dictionaryData = dictionaryFileMap[dictionaryFile];
    if (!dictionaryData) {
      throw new Error(`Dictionary file not found: ${dictionaryFile}`);
    }

    dictionaries[languageCode] = dictionaryData; // Store the dictionary in memory

    const wordCount = Object.keys(dictionaryData).length;
    const firstWord = Object.keys(dictionaryData)[0];
    const languageCount = firstWord ? Object.keys(dictionaryData[firstWord]).length : 0;

    console.log(`✅ Dictionary for ${languageCode} loaded successfully: ${wordCount} words in ${languageCount} languages`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to load dictionary for ${languageCode}:`, error);
    return false;
  } finally {
    isLoading = false;
  }
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

  if (!dictionaryEntry) {
    console.log(`Word "${word}" not found in offline dictionary for ${languageCode}`);
    return null;
  }

  const englishTranslation = dictionaryEntry['en']; // Retrieve the English translation

  const result: Record<string, string> = {}; // Initialize result to store translations

  Object.entries(EU_LABEL_POS).forEach(([countryCode, labelData]) => {
    const baseLang = labelData.lang.split('-')[0];

    // Always show the English translation for GB and IE
    if ((countryCode === 'GB' || countryCode === 'IE') && englishTranslation) {
      result[countryCode] = englishTranslation;
      return;
    }

    let translation = dictionaryEntry[baseLang];

    // For Croatian (HR), Bosnian (BA), Serbian (RS), use Serbo-Croatian (sh/SB) if their own translation is missing
    if (!translation && (countryCode === 'HR' || countryCode === 'BA' || countryCode === 'RS')) {
      translation = dictionaryEntry['sh'] || dictionaryEntry['sb'];
    }

    if (translation) {
      result[countryCode] = translation;
    }
  });

  console.log(`📖 Local translation for "${word}" in ${languageCode}: ${Object.keys(result).length} countries translated`);
  return result;
}

/**
 * Check if dictionary is ready
 */
export function isDictionaryReady(): boolean {
  return Object.keys(dictionaries).length > 0;
}

/**
 * Get dictionary statistics
 */
export function getDictionaryStats(): { wordCount: number; languageCount: number } | null {
  if (!dictionaries) return null;

  const words = Object.keys(dictionaries);
  const wordCount = words.length;
  const languageCount = words.length > 0 ? Object.keys(dictionaries[words[0]]).length : 0;

  return { wordCount, languageCount };
}