import Constants from 'expo-constants';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { EU_LABEL_POS } from '../data/eu_label_positions';
import { getLocalTranslation, loadDictionary } from '../utils/dictionaries';
import { BannerAd } from './BannerAd';
import EuropeMapWrapper from './EuroMapWrapper';

// Import version from package.json
const packageJson = require('../package.json');

// ✅ NEW: centralized banner height used for spacing + scroll padding
const BANNER_HEIGHT = 60;

// Language code to human-readable name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  'sv': 'Swedish',
  'fr': 'French', 
  'es': 'Spanish',
  'de': 'German',
  'it': 'Italian',
  'en': 'English',
  'pl': 'Polish',
  'nl': 'Dutch',
  'pt': 'Portuguese',
  'el': 'Greek',
  'no': 'Norwegian',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'et': 'Estonian',
  'tr': 'Turkish',
  'ru': 'Russian',
  'uk': 'Ukrainian',
  'ga': 'Irish',
  'is': 'Icelandic',
  'mk': 'Macedonian'
};

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [dictionaryReady, setDictionaryReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
  const [sourceLang, setSourceLang] = useState<string>('EN');
  const sourceLangOptions = [
    { code: 'EN', label: 'English' },
    { code: 'IT', label: 'Italian' },
    { code: 'DE', label: 'German' },
    { code: 'ES', label: 'Spanish' },
    { code: 'FR', label: 'French' },
  ];
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility
  const [isLoading, setIsLoading] = useState(false); // State to manage loading dialog visibility

  // Load dictionary on component mount
  useEffect(() => {
    console.log('Package.json:', JSON.stringify(packageJson, null, 2));
    console.log('Constants:', JSON.stringify(Constants, null, 2));

    const initializeDictionary = async () => {
      try {
        const selectedLanguageLabel = sourceLangOptions.find(opt => opt.code === sourceLang)?.label || 'English';
        console.log(`Loading ${selectedLanguageLabel} dictionary...`);
        setStatusMessage(`Loading ${selectedLanguageLabel} dictionary...`); // Set dynamic loading message
        setIsLoading(true); // Ensure loading state is set to true

        // Map sourceLang to dictionary file names
        const dictionaryFileMap: Record<string, string> = {
          EN: 'eu_en_dictionary.json',
          DE: 'eu_de_dictionary.json',
          ES: 'eu_es_dictionary.json',
          FR: 'eu_fr_dictionary.json',
          IT: 'eu_it_dictionary.json',
        };

        const dictionaryFile = dictionaryFileMap[sourceLang];
        if (!dictionaryFile) {
          throw new Error(`No dictionary file found for language code: ${sourceLang}`);
        }

        // Force immediate state update before proceeding
        await new Promise(resolve => setTimeout(resolve, 0));

        await loadDictionary(dictionaryFile, sourceLang); // Pass the language code explicitly
        setDictionaryReady(true);
        console.log(`${selectedLanguageLabel} dictionary loaded successfully`);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        Alert.alert('Dictionary Error', 'Failed to load offline dictionary. Some features may not work.');
      } finally {
        setIsLoading(false); // Ensure loading state is set to false in case of error or success
        setStatusMessage(''); // Clear the loading message
      }
    };

    initializeDictionary();
  }, [sourceLang]); // Trigger whenever sourceLang changes

  const handleTranslate = async () => {
    if (!dictionaryReady) {
      Alert.alert('Please wait', 'Dictionary is still loading...');
      return;
    }

    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a word to translate');
      return;
    }

    setIsTranslating(true);
    setTranslations({});

    try {
      const word = inputText.trim().toLowerCase();
      console.log('Starting offline translation for:', word);
      
      const result = getLocalTranslation(word, sourceLang);
      
      if (!result) {
        setTranslations({});
        setStatusMessage('Word not found in dictionary');
        return;
      }
      
      setTranslations(result);
      setStatusMessage(`Translations: ${Object.keys(result).length} countries`);

    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        'Translation Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (countryCode: string, languageCode?: string) => {
    const labels = buildLabels();
    const t = labels[countryCode]?.text;
    const lang = EU_LABEL_POS[countryCode]?.lang ?? "en";
    
    if (t) {
      Speech.speak(t, { language: lang });
      if (languageCode) {
        const baseLang = languageCode.split('-')[0];
        const languageName = LANGUAGE_NAMES[baseLang] || baseLang;
        const count = Object.keys(translations).length;
        setStatusMessage(`Translations: ${count} countries – ${languageName}`);
      }
    }
  };

  const buildLabels = () => {
    const labels: Record<string, { text: string; x: number; y: number; lang: string }> = {};
    
    Object.entries(EU_LABEL_POS).forEach(([countryCode, posData]) => {
      const translatedText = translations[countryCode];
      if (translatedText) {
        labels[countryCode] = {
          text: translatedText,
          x: posData.x,
          y: posData.y,
          lang: posData.lang,
        };
      }
    });
    
    return labels;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading dialog */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading} // Ensure modal visibility is tied to isLoading state
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.modalText}>{statusMessage || 'Loading dictionary, please wait...'}</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image 
            source={require('../assets/images/eu-flag-icon.png')} 
            style={styles.flagIcon}
          />
          <Text style={styles.title}>Euro Lingo</Text>
        </View>
        <Text style={styles.subtitle}>Translate words and hear them spoken across Europe</Text>
        <Text style={styles.versionText}>
          v{packageJson.version}
        </Text>
      </View>

      <View style={styles.inputSection}>
        {/* Dropdown for selecting source language */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setDropdownVisible(!dropdownVisible)} // Toggle visibility
          >
            <Text style={styles.dropdownOptionText}>{sourceLang}</Text>
          </TouchableOpacity>
          {dropdownVisible && (
            <View style={styles.dropdownOptions}>
              {sourceLangOptions.map(opt => (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.dropdownOption, sourceLang === opt.code && styles.dropdownSelected]}
                  onPress={() => {
                    setSourceLang(opt.code);
                    setDropdownVisible(false); // Close dropdown after selection
                  }}
                >
                  <Text
                    style={styles.dropdownOptionText}
                    numberOfLines={1} // Prevent text wrapping
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Text input for entering word */}
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter word"
          placeholderTextColor="#999"
          editable={!isTranslating}
          returnKeyType="done"
          onSubmitEditing={handleTranslate}
        />

        <TouchableOpacity
          style={[styles.translateButton, isTranslating && styles.disabledButton]}
          onPress={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.translateButtonText}>Translate</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map area takes remaining space - removed ScrollView to fix zoom gestures */}
      <View style={[
        styles.mapContainer,
        // Only reserve space if status bar is NOT showing. 
        // If status bar shows, it handles the spacing/background itself.
        statusMessage !== '' ? { marginBottom: 0 } : {}
      ]}>
        <EuropeMapWrapper
          labels={buildLabels()}
          onPressLabel={handleSpeak}
        />
      </View>

      {/* ✅ FIX: Full-width status bar now rendered ABOVE banner, never hidden */}
      {statusMessage !== '' && (
        <View style={styles.statusBar}>
          <Text style={styles.translationCount}>{statusMessage}</Text>
        </View>
      )}

      {/* ✅ Banner stays fixed at bottom, but no longer overlaps content */}
      <View style={styles.bottomBannerContainer}>
        <BannerAd 
          size="banner"
          style={styles.bottomBanner}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10, // Ensure header stays above map
    elevation: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  flagIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  versionText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    zIndex: 10, // Ensure input stays above map
    elevation: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
    color: '#2C3E50',
  },
  translateButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  translateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  mapContainer: {
    flex: 1, // Take all remaining space
    backgroundColor: '#FFFFFF',
    marginBottom: BANNER_HEIGHT, // Reserve space for banner (default, overridden in JSX)
    zIndex: 1,
    overflow: 'hidden', // Ensure map doesn't bleed out
  },

  // ✅ NEW: status bar now full width
  statusBar: {
    backgroundColor: '#34495E',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: BANNER_HEIGHT + 12, // Extend behind banner + padding
    alignItems: 'center',
    width: '100%',
  },
  translationCount: {
    color: '#F39C12',
    fontSize: 14,
    fontWeight: 'bold',
  },

  bottomBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    zIndex: 0, // Visual fix: prevent banner from blocking map interaction if overlap occurs
  },
  bottomBanner: {
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 10,
    },
    dropdownLabel: {
      fontSize: 12,
      color: '#888',
      marginBottom: 2,
    },
    dropdownBox: {
      flexDirection: 'row',
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      paddingHorizontal: 8, // Increased padding for better spacing
      paddingVertical: 4, // Adjusted padding for better appearance
      marginBottom: 2,
      width: '100%', // Set width to 100% to make it wider
      minWidth: 40, // Set a minimum width to accommodate longer text
    },
    dropdownOption: {
      paddingHorizontal: 12, // Increased padding for better spacing
      paddingVertical: 6, // Adjusted padding for better appearance
      borderRadius: 6,
      marginHorizontal: 2,
      backgroundColor: '#F8F9FA',
      width: '100%', // Ensure options take full width of the dropdown
      minWidth: 100, // Ensure options take enough width for the text
    },
    dropdownSelected: {
      backgroundColor: '#D6EAF8',
      borderColor: '#3498DB',
      borderWidth: 1,
    },
    dropdownOptionText: {
      fontSize: 16, // Keep font size for readability
      color: '#2C3E50',
      fontWeight: '500',
      textAlign: 'center', // Center align text
      whiteSpace: 'nowrap', // Prevent text wrapping
      overflow: 'hidden', // Ensure text does not overflow
    },
    dropdownOptions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      zIndex: 20, // Ensure it appears above other elements
    },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
});
