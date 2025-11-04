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

// Global dictionary storage
let dictionary: Dictionary | null = null;
let isLoading = false;

/**
 * Load the offline dictionary from base.json
 * This should be called once when the app starts
 */
export async function loadDictionary(): Promise<boolean> {
  if (dictionary !== null) {
    console.log('Dictionary already loaded');
    return true;
  }

  if (isLoading) {
    console.log('Dictionary is already being loaded');
    return false;
  }

  try {
    isLoading = true;
    console.log('Loading offline dictionary...');
    
    // Import the dictionary file
    const dictionaryData = require('../base.json');
    dictionary = dictionaryData;
    
    const wordCount = Object.keys(dictionary!).length;
    const firstWord = Object.keys(dictionary!)[0];
    const languageCount = firstWord ? Object.keys(dictionary![firstWord]).length : 0;
    
    console.log(`✅ Dictionary loaded successfully: ${wordCount} words in ${languageCount} languages`);
    return true;
  } catch (error) {
    console.error('❌ Failed to load dictionary:', error);
    dictionary = null;
    return false;
  } finally {
    isLoading = false;
  }
}

/**
 * Get local translation for a word
 * Returns a map of country codes to translated words
 * @param word The English word to translate
 * @returns Record<string, string> mapping country codes to translations, or null if word not found
 */
export function getLocalTranslation(word: string): Record<string, string> | null {
  if (!dictionary) {
    console.warn('Dictionary not loaded yet. Call loadDictionary() first.');
    return null;
  }

  const normalizedWord = word.toLowerCase().trim();
  const dictionaryEntry = dictionary[normalizedWord];
  
  if (!dictionaryEntry) {
    console.log(`Word "${word}" not found in offline dictionary`);
    return null;
  }

  // Map language codes to country codes using EU_LABEL_POS
  const result: Record<string, string> = {};
  
  Object.entries(EU_LABEL_POS).forEach(([countryCode, labelData]) => {
    // Extract base language code (e.g., "en" from "en-GB")
    const baseLang = labelData.lang.split('-')[0];
    
    // Get translation for this language
    const translation = dictionaryEntry[baseLang];
    
    if (translation) {
      result[countryCode] = translation;
    } else {
      // Fallback to English if translation not available
      result[countryCode] = word;
    }
  });

  console.log(`📖 Local translation for "${word}": ${Object.keys(result).length} countries translated`);
  return result;
}

/**
 * Check if dictionary is ready
 */
export function isDictionaryReady(): boolean {
  return dictionary !== null;
}

/**
 * Get dictionary statistics
 */
export function getDictionaryStats(): { wordCount: number; languageCount: number } | null {
  if (!dictionary) return null;
  
  const words = Object.keys(dictionary);
  const wordCount = words.length;
  const languageCount = words.length > 0 ? Object.keys(dictionary[words[0]]).length : 0;
  
  return { wordCount, languageCount };
}