import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAdMob } from '../utils/adMobUtils';
import {
    isTranslationConfigured,
    LANGUAGE_COUNTRY_MAP,
    showTranslationSetupAlert,
    translateForAllCountries,
    translateToSpecificLanguage,
    type TranslationError,
    type TranslationResult
} from '../utils/googleTranslate';
import { BannerAd } from './BannerAd';

export default function TranslationDemo() {
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [errors, setErrors] = useState<TranslationError[]>([]);
  const [lastTranslatedText, setLastTranslatedText] = useState('');
  
  // AdMob integration
  const { isInitialized: adMobInitialized, interstitialReady, showInterstitial } = useAdMob();

  const handleTranslateAll = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    if (!isTranslationConfigured()) {
      showTranslationSetupAlert();
      return;
    }

    // Show interstitial ad before translation
    if (adMobInitialized && interstitialReady) {
      console.log('Showing interstitial ad before translation');
      await showInterstitial();
    }

    setIsTranslating(true);
    setTranslations([]);
    setErrors([]);

    try {
      console.log('Starting translation for:', inputText);
      const result = await translateForAllCountries(inputText.trim());
      
      console.log('Translation results:', result);
      setTranslations(result.success);
      setErrors(result.errors);
      setLastTranslatedText(inputText.trim());

      if (result.success.length > 0) {
        Alert.alert(
          'Translation Complete',
          `Successfully translated "${inputText}" into ${result.success.length} languages!`
        );
      } else {
        Alert.alert('Translation Failed', 'No translations could be completed. Check your API key and internet connection.');
      }
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

  const handleSingleTranslation = async (languageCode: string) => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    if (!isTranslationConfigured()) {
      showTranslationSetupAlert();
      return;
    }

    // Show interstitial ad for single translations too (occasionally)
    if (adMobInitialized && interstitialReady && Math.random() > 0.7) {
      console.log('Showing interstitial ad before single translation');
      await showInterstitial();
    }

    setIsTranslating(true);

    try {
      const result = await translateToSpecificLanguage(inputText.trim(), languageCode);
      
      if ('translatedText' in result) {
        Alert.alert(
          `Translation to ${result.languageName}`,
          `"${result.originalText}" → "${result.translatedText}"`
        );
      } else {
        Alert.alert('Translation Error', result.error);
      }
    } catch (error) {
      console.error('Single translation error:', error);
      Alert.alert('Translation Error', 'Failed to translate text');
    } finally {
      setIsTranslating(false);
    }
  };

  const clearResults = () => {
    setTranslations([]);
    setErrors([]);
    setLastTranslatedText('');
  };

  const getCountryNameFromId = (countryId: string): string => {
    return countryId.charAt(0).toUpperCase() + countryId.slice(1);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌐 Google Translate API Demo</Text>
        <Text style={styles.subtitle}>
          Translate text into multiple European languages
        </Text>
      </View>

      {/* Banner Ad */}
      {adMobInitialized && (
        <BannerAd 
          size="banner"
          style={styles.bannerAd}
          onError={(error) => console.log('Translation demo banner ad error:', error)}
        />
      )}

      {/* API Status */}
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>API Status:</Text>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: isTranslationConfigured() ? '#27AE60' : '#E74C3C' }
        ]}>
          <Text style={styles.statusText}>
            {isTranslationConfigured() ? '✅ Configured' : '❌ Not Configured'}
          </Text>
        </View>
        {!isTranslationConfigured() && (
          <TouchableOpacity
            style={styles.setupButton}
            onPress={showTranslationSetupAlert}
          >
            <Text style={styles.setupButtonText}>Setup Instructions</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Enter English text to translate:</Text>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="e.g., Hello, how are you?"
          multiline
          numberOfLines={3}
          editable={!isTranslating}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.translateButton, isTranslating && styles.disabledButton]}
            onPress={handleTranslateAll}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.translateButtonText}>🌍 Translate to All Languages</Text>
            )}
          </TouchableOpacity>

          {translations.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
              <Text style={styles.clearButtonText}>Clear Results</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Language Selection */}
      <View style={styles.quickTranslateSection}>
        <Text style={styles.sectionTitle}>Quick Translate to Specific Language:</Text>
        <View style={styles.languageGrid}>
          {Object.entries(LANGUAGE_COUNTRY_MAP).map(([code, name]) => (
            <TouchableOpacity
              key={code}
              style={[styles.languageQuickButton, isTranslating && styles.disabledButton]}
              onPress={() => handleSingleTranslation(code)}
              disabled={isTranslating}
            >
              <Text style={styles.languageQuickButtonText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Section */}
      {(translations.length > 0 || errors.length > 0) && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            Translation Results for: "{lastTranslatedText}"
          </Text>

          {/* Successful Translations */}
          {translations.length > 0 && (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>✅ Successful Translations ({translations.length}):</Text>
              {translations.map((result, index) => (
                <View key={index} style={styles.translationItem}>
                  <View style={styles.translationHeader}>
                    <Text style={styles.countryName}>
                      {getCountryNameFromId(result.countryId)}
                    </Text>
                    <Text style={styles.languageName}>({result.languageName})</Text>
                  </View>
                  <Text style={styles.translationText}>"{result.translatedText}"</Text>
                </View>
              ))}
            </View>
          )}

          {/* Translation Errors */}
          {errors.length > 0 && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>❌ Translation Errors ({errors.length}):</Text>
              {errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Text style={styles.errorCountry}>
                    {getCountryNameFromId(error.countryId)} ({error.languageCode})
                  </Text>
                  <Text style={styles.errorMessage}>{error.error}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Usage Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.instructionsTitle}>📋 Setup Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Get a Google Cloud Translation API key from Google Cloud Console{'\n'}
          2. Enable the Cloud Translation API for your project{'\n'}
          3. Create a .env file and add: EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_key{'\n'}
          4. Restart your Expo development server{'\n'}
          5. Test the translation functionality
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 8,
  },
  statusSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  statusIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  setupButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  setupButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  translateButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  translateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickTranslateSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageQuickButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  languageQuickButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  resultsSection: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  successSection: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#27AE60',
  },
  translationItem: {
    backgroundColor: '#D5F4E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  countryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  languageName: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  translationText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '600',
  },
  errorSection: {
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#E74C3C',
  },
  errorItem: {
    backgroundColor: '#FADBD8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorCountry: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 12,
    color: '#E74C3C',
  },
  instructionsSection: {
    backgroundColor: '#E8F6F3',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  instructionText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  bannerAd: {
    marginVertical: 10,
  },
});