// Google Translate API utility functions
// This module provides functions to translate text using Google Cloud Translation API

import * as Speech from 'expo-speech';
import { Alert } from 'react-native';
import {
    createCountryLanguageMap,
    createLanguageCountriesMap,
    getUniqueLanguageCodes,
    type TranslationsByCountry
} from './countriesLanguagesLoader';

// Import the country language mapping from the new data loader
export const COUNTRY_LANGUAGE_MAP = createCountryLanguageMap();
export const LANGUAGE_COUNTRIES_MAP = createLanguageCountriesMap();
export const UNIQUE_LANGUAGE_CODES = getUniqueLanguageCodes();

// Reverse mapping for language codes to language names (for backwards compatibility)
export const LANGUAGE_COUNTRY_MAP = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  en: 'English',
  pl: 'Polish',
  nl: 'Dutch',
  pt: 'Portuguese',
  el: 'Greek',
  sv: 'Swedish',
  no: 'Norwegian',
  cs: 'Czech',
  da: 'Danish',
  fi: 'Finnish',
  hu: 'Hungarian',
  ro: 'Romanian',
  sk: 'Slovak',
  sl: 'Slovenian',
  hr: 'Croatian',
  bg: 'Bulgarian',
  sr: 'Serbian',
  bs: 'Bosnian',
  lt: 'Lithuanian',
  lv: 'Latvian',
  et: 'Estonian',
} as const;

// Type definitions
export interface CountryTranslationResult {
  countryCode: string;
  languageCode: string;
  languageName: string;
  translatedText: string;
}

// Re-export TranslationsByCountry from the data loader
export type { TranslationsByCountry };

export interface TranslationResult {
  countryId: string;
  languageCode: string;
  languageName: string;
  originalText: string;
  translatedText: string;
  confidence?: number;
}

export interface TranslationError {
  countryId: string;
  languageCode: string;
  error: string;
}

export interface TranslationResponse {
  success: TranslationResult[];
  errors: TranslationError[];
}

// Google Translate API configuration
const GOOGLE_TRANSLATE_API_BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Get the Google Translate API key from environment variables
 * You need to set EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY in your .env file
 */
function getApiKey(): string | null {
  // In Expo, environment variables must be prefixed with EXPO_PUBLIC_
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    console.error('Google Translate API key not found. Please set EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY in your environment.');
    return null;
  }
  
  return apiKey;
}

/**
 * Translate a single text to a target language using Google Translate API
 */
async function translateToLanguage(
  text: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> {
  try {
    const url = `${GOOGLE_TRANSLATE_API_BASE_URL}?key=${apiKey}`;
    
    const requestBody = {
      q: text,
      target: targetLanguage,
      source: 'en', // Assuming source is always English
      format: 'text'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Translation failed'}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      return data.data.translations[0].translatedText;
    } else {
      throw new Error('No translation data received from API');
    }
  } catch (error) {
    console.error(`Translation error for language ${targetLanguage}:`, error);
    throw error;
  }
}

/**
 * New efficient translation function that translates once per language
 * Returns a map of country codes to translation data
 */
export async function translateForAllCountriesOptimized(text: string): Promise<TranslationsByCountry> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('Google Translate API key not configured');
    return {};
  }

  if (!text || text.trim().length === 0) {
    console.error('No text provided for translation');
    return {};
  }

  // Get unique languages from the new data structure
  const uniqueLanguages = getUniqueLanguageCodes();

  // Translate to each unique language once
  const languageTranslations: Record<string, string> = {};
  
  for (const languageCode of uniqueLanguages) {
    // Skip English as it's the source language
    if (languageCode === 'en') {
      languageTranslations[languageCode] = text;
      continue;
    }

    try {
      console.log(`Translating "${text}" to ${languageCode}...`);
      const translatedText = await translateToLanguage(text, languageCode, apiKey);
      languageTranslations[languageCode] = translatedText;
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to translate to ${languageCode}:`, error);
      languageTranslations[languageCode] = `[Translation failed]`;
    }
  }

  // Build the country-to-translation map using the new data structure
  const translationsByCountry: TranslationsByCountry = {};
  
  Object.entries(COUNTRY_LANGUAGE_MAP).forEach(([countryCode, countryData]) => {
    const translatedText = languageTranslations[countryData.languageCode];
    if (translatedText && !translatedText.startsWith('[Translation failed')) {
      translationsByCountry[countryCode] = {
        languageCode: countryData.languageCode,
        translationText: translatedText,
      };
    }
  });

  console.log(`Translation complete. Translated to ${Object.keys(translationsByCountry).length} countries.`);
  return translationsByCountry;
}

/**
 * Legacy translation function for backward compatibility
 */
export async function translateForAllCountries(text: string): Promise<TranslationResponse> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      success: [],
      errors: Object.keys(COUNTRY_LANGUAGE_MAP).map(countryCode => ({
        countryId: countryCode,
        languageCode: COUNTRY_LANGUAGE_MAP[countryCode].languageCode,
        error: 'Google Translate API key not configured'
      }))
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      success: [],
      errors: Object.keys(COUNTRY_LANGUAGE_MAP).map(countryCode => ({
        countryId: countryCode,
        languageCode: COUNTRY_LANGUAGE_MAP[countryCode].languageCode,
        error: 'No text provided for translation'
      }))
    };
  }

  // Use the new optimized function and convert the result
  const translationsByCountry = await translateForAllCountriesOptimized(text);
  
  const results: TranslationResult[] = [];
  const errors: TranslationError[] = [];

  Object.entries(COUNTRY_LANGUAGE_MAP).forEach(([countryCode, countryData]) => {
    const translation = translationsByCountry[countryCode];
    
    if (translation) {
      results.push({
        countryId: countryCode,
        languageCode: countryData.languageCode,
        languageName: countryData.languageName,
        originalText: text,
        translatedText: translation.translationText,
      });
    } else {
      errors.push({
        countryId: countryCode,
        languageCode: countryData.languageCode,
        error: 'Translation failed'
      });
    }
  });

  return {
    success: results,
    errors
  };
}

/**
 * Translate text to a specific language
 */
export async function translateToSpecificLanguage(
  text: string,
  targetLanguageCode: string
): Promise<TranslationResult | TranslationError> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      countryId: 'unknown',
      languageCode: targetLanguageCode,
      error: 'Google Translate API key not configured'
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      countryId: 'unknown',
      languageCode: targetLanguageCode,
      error: 'No text provided for translation'
    };
  }

  try {
    const translatedText = await translateToLanguage(text, targetLanguageCode, apiKey);
    const languageName = LANGUAGE_COUNTRY_MAP[targetLanguageCode as keyof typeof LANGUAGE_COUNTRY_MAP] || targetLanguageCode;
    
    return {
      countryId: 'custom',
      languageCode: targetLanguageCode,
      languageName,
      originalText: text,
      translatedText,
    };
  } catch (error) {
    return {
      countryId: 'custom',
      languageCode: targetLanguageCode,
      error: error instanceof Error ? error.message : 'Translation failed'
    };
  }
}

/**
 * Check if the Google Translate API is properly configured
 */
export function isTranslationConfigured(): boolean {
  return getApiKey() !== null;
}

/**
 * Show user-friendly error message for translation setup
 */
export function showTranslationSetupAlert(): void {
  Alert.alert(
    'Translation Setup Required',
    'To use the translation feature, you need to:\n\n' +
    '1. Get a Google Cloud Translation API key\n' +
    '2. Add it to your .env file as:\n' +
    'EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here\n\n' +
    'Visit Google Cloud Console to get your API key.',
    [{ text: 'OK' }]
  );
}

// Language code mapping for speech synthesis
// Maps our language codes to Speech API compatible locale codes
export const SPEECH_LANGUAGE_MAP = {
  es: 'es-ES',  // Spanish (Spain)
  fr: 'fr-FR',  // French (France)
  de: 'de-DE',  // German (Germany)
  it: 'it-IT',  // Italian (Italy)
  en: 'en-US',  // English (US)
  pl: 'pl-PL',  // Polish (Poland)
  nl: 'nl-NL',  // Dutch (Netherlands)
  pt: 'pt-PT',  // Portuguese (Portugal)
  el: 'el-GR',  // Greek (Greece)
  sv: 'sv-SE',  // Swedish (Sweden)
  no: 'no-NO',  // Norwegian (Norway)
  cs: 'cs-CZ',  // Czech (Czech Republic)
  da: 'da-DK',  // Danish (Denmark)
  fi: 'fi-FI',  // Finnish (Finland)
  hu: 'hu-HU',  // Hungarian (Hungary)
  ro: 'ro-RO',  // Romanian (Romania)
  sk: 'sk-SK',  // Slovak (Slovakia)
  sl: 'sl-SI',  // Slovenian (Slovenia)
  hr: 'hr-HR',  // Croatian (Croatia)
  bg: 'bg-BG',  // Bulgarian (Bulgaria)
  sr: 'sr-RS',  // Serbian (Serbia)
  bs: 'bs-BA',  // Bosnian (Bosnia and Herzegovina)
  lt: 'lt-LT',  // Lithuanian (Lithuania)
  lv: 'lv-LV',  // Latvian (Latvia)
  et: 'et-EE',  // Estonian (Estonia)
} as const;

/**
 * Speaks the given text in the specified language using expo-speech
 * @param text - The text to speak
 * @param langCode - The language code (e.g., 'es', 'fr', 'de')
 * @param options - Optional speech configuration
 */
export async function speak(
  text: string,
  langCode: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: any) => void;
  } = {}
): Promise<boolean> {
  try {
    if (!text || text.trim().length === 0) {
      console.warn('No text provided for speech');
      return false;
    }

    // Get the speech-compatible language code
    const speechLangCode = SPEECH_LANGUAGE_MAP[langCode as keyof typeof SPEECH_LANGUAGE_MAP] || 'en-US';
    
    const speechOptions = {
      language: speechLangCode,
      pitch: options.pitch || 1.0,
      rate: options.rate || 0.8,
      volume: options.volume || 1.0,
      onStart: () => {
        console.log(`Started speaking: "${text}" in ${speechLangCode}`);
        options.onStart?.();
      },
      onDone: () => {
        console.log(`Finished speaking: "${text}"`);
        options.onDone?.();
      },
      onStopped: () => {
        console.log(`Speech stopped: "${text}"`);
        options.onDone?.();
      },
      onError: (error: any) => {
        console.error('Speech error:', error);
        options.onError?.(error);
      },
    };

    await Speech.speak(text, speechOptions);
    return true;
  } catch (error) {
    console.error('Error in speak function:', error);
    options.onError?.(error);
    return false;
  }
}

/**
 * Stops any currently playing speech
 */
export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}

/**
 * Speaks a translated word for a specific country using the new country mapping
 * @param text - The English text to translate and speak
 * @param countryCode - The country code (e.g., 'ES', 'FR')
 * @param options - Optional speech configuration
 */
export async function speakTranslationForCountry(
  text: string,
  countryCode: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: any) => void;
  } = {}
): Promise<boolean> {
  try {
    // Get the language code for this country using the new data structure
    const countryData = COUNTRY_LANGUAGE_MAP[countryCode];
    
    if (!countryData) {
      console.error(`No language mapping found for country: ${countryCode}`);
      return false;
    }

    const languageCode = countryData.languageCode;

    // If it's English, just speak the original text
    if (languageCode === 'en') {
      return await speak(text, languageCode, options);
    }

    // Translate the text first
    const translationResult = await translateToSpecificLanguage(text, languageCode);
    
    if ('translatedText' in translationResult) {
      // Speak the translated text
      return await speak(translationResult.translatedText, languageCode, options);
    } else {
      console.error(`Translation failed for ${countryCode}:`, translationResult.error);
      options.onError?.(new Error(translationResult.error));
      return false;
    }
  } catch (error) {
    console.error(`Error in speakTranslationForCountry for ${countryCode}:`, error);
    options.onError?.(error);
    return false;
  }
}