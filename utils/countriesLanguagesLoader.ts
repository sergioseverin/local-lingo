// Utility functions for loading and working with countries and languages data
import countriesLanguagesData from '../data/countries_languages.json';

// Type definitions
export interface CountryLanguageData {
  countryCode: string;
  languageCode: string;
  countryName: string;
  languageName: string;
  flag: string;
}

export interface CountryLanguageMap {
  [countryCode: string]: CountryLanguageData;
}

export interface LanguageCountriesMap {
  [languageCode: string]: CountryLanguageData[];
}

export interface TranslationsByCountry {
  [countryCode: string]: {
    languageCode: string;
    translationText: string;
  };
}

/**
 * Load the countries and languages data from JSON file
 * @returns Array of country language data
 */
export function loadCountriesLanguagesData(): CountryLanguageData[] {
  return countriesLanguagesData as CountryLanguageData[];
}

/**
 * Create a map of country codes to country data for quick lookup
 * @returns Object mapping country codes to country data
 */
export function createCountryLanguageMap(): CountryLanguageMap {
  const data = loadCountriesLanguagesData();
  const map: CountryLanguageMap = {};
  
  data.forEach(country => {
    map[country.countryCode] = country;
  });
  
  return map;
}

/**
 * Create a map of language codes to arrays of countries that use that language
 * Useful for efficient translation - translate once per language, apply to multiple countries
 * @returns Object mapping language codes to arrays of countries
 */
export function createLanguageCountriesMap(): LanguageCountriesMap {
  const data = loadCountriesLanguagesData();
  const map: LanguageCountriesMap = {};
  
  data.forEach(country => {
    if (!map[country.languageCode]) {
      map[country.languageCode] = [];
    }
    map[country.languageCode].push(country);
  });
  
  return map;
}

/**
 * Get all unique language codes from the data
 * @returns Array of unique language codes
 */
export function getUniqueLanguageCodes(): string[] {
  const data = loadCountriesLanguagesData();
  const languages = new Set<string>();
  
  data.forEach(country => {
    languages.add(country.languageCode);
  });
  
  return Array.from(languages).sort();
}

/**
 * Get country data by country code
 * @param countryCode - ISO country code (e.g., 'FR', 'DE')
 * @returns Country data or null if not found
 */
export function getCountryByCode(countryCode: string): CountryLanguageData | null {
  const map = createCountryLanguageMap();
  return map[countryCode] || null;
}

/**
 * Get all countries that use a specific language
 * @param languageCode - Language code (e.g., 'de', 'en')
 * @returns Array of countries that use the language
 */
export function getCountriesByLanguage(languageCode: string): CountryLanguageData[] {
  const map = createLanguageCountriesMap();
  return map[languageCode] || [];
}

/**
 * Create labels map for map overlay from translations data
 * @param translationsByCountry - Translation results from API
 * @returns Object mapping country codes to translation text for display
 */
export function createLabelsMapFromTranslations(
  translationsByCountry: TranslationsByCountry
): Record<string, string> {
  const labelsMap: Record<string, string> = {};
  
  Object.entries(translationsByCountry).forEach(([countryCode, translation]) => {
    labelsMap[countryCode] = translation.translationText;
  });
  
  return labelsMap;
}

/**
 * Get translation statistics
 * @param translationsByCountry - Translation results from API
 * @returns Statistics about translations
 */
export function getTranslationStats(translationsByCountry: TranslationsByCountry) {
  const totalCountries = loadCountriesLanguagesData().length;
  const translatedCountries = Object.keys(translationsByCountry).length;
  const uniqueLanguages = getUniqueLanguageCodes();
  
  // Count how many unique languages have translations
  const translatedLanguages = new Set<string>();
  Object.values(translationsByCountry).forEach(translation => {
    translatedLanguages.add(translation.languageCode);
  });
  
  return {
    totalCountries,
    translatedCountries,
    totalLanguages: uniqueLanguages.length,
    translatedLanguages: translatedLanguages.size,
    translationPercentage: Math.round((translatedCountries / totalCountries) * 100),
    languagePercentage: Math.round((translatedLanguages.size / uniqueLanguages.length) * 100)
  };
}

/**
 * Validate that a country code exists in our data
 * @param countryCode - Country code to validate
 * @returns True if country code exists
 */
export function isValidCountryCode(countryCode: string): boolean {
  const country = getCountryByCode(countryCode);
  return country !== null;
}

/**
 * Validate that a language code exists in our data
 * @param languageCode - Language code to validate
 * @returns True if language code exists
 */
export function isValidLanguageCode(languageCode: string): boolean {
  const uniqueLanguages = getUniqueLanguageCodes();
  return uniqueLanguages.includes(languageCode);
}

/**
 * Get a formatted string describing the country and language
 * @param countryCode - Country code
 * @returns Formatted string like "France (French)" or null if not found
 */
export function getCountryLanguageDescription(countryCode: string): string | null {
  const country = getCountryByCode(countryCode);
  if (!country) return null;
  
  return `${country.countryName} (${country.languageName})`;
}

/**
 * Create a summary of all supported countries and languages
 * @returns Object with arrays of countries and languages
 */
export function getSupportedCountriesAndLanguages() {
  const data = loadCountriesLanguagesData();
  const languageMap = createLanguageCountriesMap();
  
  const countries = data.map(country => ({
    code: country.countryCode,
    name: country.countryName,
    flag: country.flag
  }));
  
  const languages = Object.entries(languageMap).map(([code, countries]) => ({
    code,
    name: countries[0].languageName, // All countries with same language code have same language name
    countriesCount: countries.length,
    countries: countries.map(c => c.countryName)
  }));
  
  return {
    countries: countries.sort((a, b) => a.name.localeCompare(b.name)),
    languages: languages.sort((a, b) => a.name.localeCompare(b.name)),
    totalCountries: countries.length,
    totalLanguages: languages.length
  };
}

// Export the raw data as well for backwards compatibility
export { countriesLanguagesData };

// Default export for easy importing
export default {
  loadCountriesLanguagesData,
  createCountryLanguageMap,
  createLanguageCountriesMap,
  getUniqueLanguageCodes,
  getCountryByCode,
  getCountriesByLanguage,
  createLabelsMapFromTranslations,
  getTranslationStats,
  isValidCountryCode,
  isValidLanguageCode,
  getCountryLanguageDescription,
  getSupportedCountriesAndLanguages
};