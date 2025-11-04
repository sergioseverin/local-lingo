import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { EU_LABEL_POS } from '../data/eu_label_positions';
import { getLocalTranslation, loadDictionary } from '../utils/dictionaries';
import { BannerAd } from './BannerAd';
import EuropeMapWrapper from './EuroMapWrapper';

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

  // Load dictionary on component mount
  useEffect(() => {
    const initializeDictionary = async () => {
      try {
        console.log('Loading offline dictionary...');
        await loadDictionary();
        setDictionaryReady(true);
        console.log('Dictionary loaded successfully');
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        Alert.alert('Dictionary Error', 'Failed to load offline dictionary. Some features may not work.');
      }
    };

    initializeDictionary();
  }, []);

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
      
      const result = getLocalTranslation(word);
      
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
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Local Lingo</Text>
        <Text style={styles.subtitle}>Translate words and hear them spoken across Europe</Text>
      </View>

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

      {/* ✅ FIX: ScrollView now applies bottom padding so map never scrolls behind banner */}
      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={{ paddingBottom: BANNER_HEIGHT + 20 }}
      >
        <View style={styles.mapSection}>
          <EuropeMapWrapper
            labels={buildLabels()}
            onPressLabel={handleSpeak}
          />
        </View>
      </ScrollView>

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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
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

  // ✅ FIX: map scroll lives inside ScrollView, not flex:1
  mapScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  mapSection: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },

  // ✅ NEW: status bar now full width
statusBar: {
  backgroundColor: '#34495E',
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 70, // ✅ allow space above the banner
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
    zIndex: 1000,
  },
  bottomBanner: {
    backgroundColor: 'transparent',
  },
});
