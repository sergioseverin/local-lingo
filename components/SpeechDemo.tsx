import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COUNTRY_LANGUAGE_MAP, speakTranslationForCountry } from '../utils/googleTranslate';

const countryFlags = {
  ES: '🇪🇸',
  FR: '🇫🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  GB: '🇬🇧',
  PL: '🇵🇱',
  NL: '🇳🇱',
  PT: '🇵🇹',
  GR: '🇬🇷',
  SE: '🇸🇪',
  NO: '🇳🇴',
  AT: '🇦🇹',
  CH: '🇨🇭',
  BE: '🇧🇪',
  CZ: '🇨🇿',
  DK: '🇩🇰',
  FI: '🇫🇮',
  HU: '🇭🇺',
  IE: '🇮🇪',
  RO: '🇷🇴',
};

export default function SpeechDemo() {
  const [speechText, setSpeechText] = useState('Hello, how are you?');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingCountry, setCurrentSpeakingCountry] = useState<string | null>(null);

  const handleCountrySpeak = async (countryCode: string) => {
    if (!speechText.trim()) {
      Alert.alert('Error', 'Please enter some text to speak');
      return;
    }

    setIsSpeaking(true);
    setCurrentSpeakingCountry(countryCode);

    try {
      const success = await speakTranslationForCountry(speechText, countryCode, {
        onStart: () => {
          console.log(`Speaking in ${countryCode}`);
        },
        onDone: () => {
          setIsSpeaking(false);
          setCurrentSpeakingCountry(null);
        },
        onError: (error) => {
          setIsSpeaking(false);
          setCurrentSpeakingCountry(null);
          Alert.alert(
            'Speech Error',
            `Could not speak in ${countryCode}. ${error.message || 'Please check your settings.'}`
          );
        }
      });

      if (!success) {
        setIsSpeaking(false);
        setCurrentSpeakingCountry(null);
      }
    } catch (error) {
      setIsSpeaking(false);
      setCurrentSpeakingCountry(null);
      console.error('Speech error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔊 Speech Demo</Text>
      <Text style={styles.subtitle}>
        Tap a country to hear your text spoken in that language
      </Text>

      {/* Text Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Enter text to speak:</Text>
        <TextInput
          style={styles.textInput}
          value={speechText}
          onChangeText={setSpeechText}
          placeholder="e.g., Hello, how are you?"
          multiline
          numberOfLines={2}
          editable={!isSpeaking}
        />
      </View>

      {/* Country Buttons */}
      <View style={styles.countriesSection}>
        <Text style={styles.sectionTitle}>Select a Country:</Text>
        <View style={styles.countryGrid}>
          {Object.entries(COUNTRY_LANGUAGE_MAP).map(([countryCode, countryInfo]) => {
            const isCurrentlySpeaking = currentSpeakingCountry === countryCode;
            
            return (
              <TouchableOpacity
                key={countryCode}
                style={[
                  styles.countryButton,
                  isCurrentlySpeaking && styles.speakingCountryButton,
                  isSpeaking && !isCurrentlySpeaking && styles.disabledCountryButton
                ]}
                onPress={() => handleCountrySpeak(countryCode)}
                disabled={isSpeaking}
              >
                <Text style={styles.countryFlag}>
                  {countryFlags[countryCode as keyof typeof countryFlags] || '🏳️'}
                </Text>
                <Text style={[
                  styles.countryName,
                  isCurrentlySpeaking && styles.speakingCountryText
                ]}>
                  {countryInfo.countryName}
                </Text>
                <Text style={[
                  styles.languageCode,
                  isCurrentlySpeaking && styles.speakingCountryText
                ]}>
                  ({countryInfo.languageCode})
                </Text>
                {isCurrentlySpeaking && (
                  <ActivityIndicator 
                    size="small" 
                    color="white" 
                    style={styles.speakingIndicator}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Status */}
      {isSpeaking && (
        <View style={styles.statusSection}>
          <Text style={styles.statusText}>
            🔊 Speaking "{speechText}" in {COUNTRY_LANGUAGE_MAP[currentSpeakingCountry as keyof typeof COUNTRY_LANGUAGE_MAP]?.countryName}...
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          1. Enter text in English in the input field{'\n'}
          2. Tap any country flag to hear it spoken in that language{'\n'}
          3. The text is automatically translated and spoken using native pronunciation{'\n'}
          4. Requires Google Translate API to be configured for translation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F8F9FA',
  },
  countriesSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  countryButton: {
    width: '48%',
    backgroundColor: '#ECF0F1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speakingCountryButton: {
    backgroundColor: '#27AE60',
    borderColor: '#229954',
  },
  disabledCountryButton: {
    backgroundColor: '#D5DBDB',
    opacity: 0.6,
  },
  countryFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  countryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  languageCode: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  speakingCountryText: {
    color: 'white',
  },
  speakingIndicator: {
    marginTop: 4,
  },
  statusSection: {
    backgroundColor: '#D5F4E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  statusText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionsSection: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  instructionText: {
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 18,
  },
});