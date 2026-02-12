import Constants from 'expo-constants';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { EU_LABEL_POS } from '../data/eu_label_positions';
import { useAdMob } from '../utils/adMobUtils';
import { getLocalTranslation, isDictionaryReady, loadDictionary } from '../utils/dictionaries';
import {
  COUNTRY_LANGUAGE_MAP,
  type TranslationsByCountry
} from '../utils/googleTranslate';
import EuropeMapWrapper from './EuroMapWrapper';

// Import version from package.json
const packageJson = require('../package.json');
const appJson = require('../app.json');

// Constants
const BANNER_HEIGHT = 80; // Height of the bottom banner ad + padding

interface TranslationMapScreenProps {
  onStatusChange?: (message: string | null, type?: 'translation' | 'country' | 'instruction') => void;
}

export default function TranslationMapScreen({ onStatusChange }: TranslationMapScreenProps) {
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationsByCountry, setTranslationsByCountry] = useState<TranslationsByCountry>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  // Safe version access  
  const getVersionDisplay = () => {
    try {
      const version = Constants.nativeAppVersion || packageJson.version;
      return `v${version}`;
    } catch (error) {
      return `v${packageJson.version}`;
    }
  };

  // AdMob integration
  const { isInitialized: adMobInitialized, interstitialReady, showInterstitial } = useAdMob();

  // Load dictionary on component mount
  useEffect(() => {
    loadDictionary();
  }, []);

  // Show instruction message when translations are available
  useEffect(() => {
    const translationCount = Object.keys(translationsByCountry).length;
    if (translationCount > 0 && inputText.trim() && selectedCountry === null) {
      const message = `💡 Tap on any country to hear "${inputText}" spoken in that language`;
      onStatusChange?.(message, 'instruction');
    }
  }, [translationsByCountry, inputText, selectedCountry, onStatusChange]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a word to translate');
      return;
    }

    if (!isDictionaryReady()) {
      Alert.alert('Error', 'Dictionary is not ready yet. Please wait a moment and try again.');
      return;
    }

    // Show interstitial ad before translation
    if (adMobInitialized && interstitialReady) {
      console.log('Showing interstitial ad before translation');
      await showInterstitial();
    }

    setIsTranslating(true);
    setTranslationsByCountry({});
    onStatusChange?.(null); // Clear any previous messages

    try {
      console.log('Starting offline translation for:', inputText);
      const result = getLocalTranslation(inputText.trim());
      
      if (result) {
        // Convert the offline translation result to match the expected format
        const formattedResult: TranslationsByCountry = {};
        
        Object.entries(result).forEach(([countryCode, translatedText]) => {
          const countryInfo = COUNTRY_LANGUAGE_MAP[countryCode as keyof typeof COUNTRY_LANGUAGE_MAP];
          if (countryInfo && translatedText && typeof translatedText === 'string' && translatedText.trim()) {
            formattedResult[countryCode] = {
              languageCode: countryInfo.languageCode,
              translationText: translatedText.trim(),
            };
          }
        });
        
        console.log('Translation results:', formattedResult);
        setTranslationsByCountry(formattedResult);

        const translatedCount = Object.keys(formattedResult).length;
        const message = `Translated "${inputText}" into ${translatedCount} languages`;
        onStatusChange?.(message, 'translation');
        
        if (translatedCount > 0) {
          console.log(`✅ Successfully translated "${inputText}" into ${translatedCount} languages!`);
        } else {
          Alert.alert('Translation Failed', 'Word not found in offline dictionary. Try a different word.');
        }
      } else {
        Alert.alert('Translation Failed', 'Word not found in offline dictionary. Try a different word.');
        onStatusChange?.(null);
      }
    } catch (error) {
      console.error('Translation error:', error);
      onStatusChange?.(null);
      Alert.alert(
        'Translation Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCountryPress = (countryCode: keyof typeof EU_LABEL_POS) => {
    setSelectedCountry(countryCode);

    // Get country info and translation  
    const countryInfo = COUNTRY_LANGUAGE_MAP[countryCode as keyof typeof COUNTRY_LANGUAGE_MAP];
    const translation = translationsByCountry[countryCode];
    
    if (translation && countryInfo) {
      const languageName = countryInfo.languageName;
      const translatedText = translation.translationText;
      
      setSelectedLanguage(languageName);
      const message = `"${translatedText}" in ${languageName}`;
      onStatusChange?.(message, 'country');
      
      console.log(`Selected: ${translatedText} in ${languageName}`);
      
      // Speak the translation
      Speech.speak(translatedText, { language: countryInfo.languageCode });
    } else {
      onStatusChange?.(null);
    }

    console.log(`Country pressed: ${EU_LABEL_POS[countryCode].name}`);
  };

  // Create labels map for the EuropeMapWrapper component
  const createLabelsMap = (): Record<string, { text: string; x: number; y: number; lang: string }> => {
    const labelsMap: Record<string, { text: string; x: number; y: number; lang: string }> = {};
    
    Object.entries(translationsByCountry).forEach(([countryCode, translation]) => {
      const position = EU_LABEL_POS[countryCode];
      if (position && translation && translation.translationText && translation.translationText.trim()) {
        labelsMap[countryCode] = {
          text: translation.translationText.trim(),
          x: position.x,
          y: position.y,
          lang: position.lang,
        };
      }
    });
    
    return labelsMap;
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
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
          {getVersionDisplay()}
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
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

      {/* Scrollable Map Section - takes remaining space */}
      <ScrollView style={styles.mapScrollView} contentContainerStyle={styles.mapScrollContent}>
        <View style={styles.mapSection}>
          <EuropeMapWrapper
            labels={createLabelsMap()}
            onPressLabel={handleCountryPress}
          />
        </View>
      </ScrollView>
    </View>
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
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapScrollView: {
    flex: 1,
    marginBottom: 60, // Reserve space for status section (approximate height)
  },
  mapScrollContent: {
    flexGrow: 1,
    paddingBottom: BANNER_HEIGHT, // Ensure content doesn't scroll behind banner
  },
  mapSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5.46,
    elevation: 9,
    overflow: 'hidden',
    minHeight: 400, // Ensure map has minimum height
  },
  statusSection: {
    position: 'absolute',
    bottom: 60, // Position 60px from bottom of screen (above banner)
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FA',
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 1500, // Higher than banner zIndex (1000) to ensure it's above
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
    shadowColor: '#3498DB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  translateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});