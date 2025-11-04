// ✅ COPILOT UPDATE:
// Replace direct <EuropeMap /> rendering with <EuropeMapWrapper />.
// The wrapper handles scroll behavior and preserves aspect ratio.
// Do NOT keep the old flex:1 container.
// The screen should contain:
//
//  <EuropeMapWrapper
//      labels={labels}
//      onPressLabel={handleSpeak}
//  />
//
// Keep the input + button UI exactly as-is.


import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { speakTranslationForCountry } from '../utils/googleTranslate';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Country data with real SVG paths (simplified) and coordinates for labels
interface Country {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  color: string;
}

const europeanCountries: Country[] = [
  {
    id: 'spain',
    name: 'Spain',
    path: 'M158 298 L126 290 L120 278 L108 268 L92 270 L88 258 L100 248 L108 238 L124 238 L136 228 L148 228 L158 238 L168 248 L178 258 L188 268 L198 278 L188 288 L178 298 Z',
    labelX: 143,
    labelY: 268,
    color: '#FF6B6B'
  },
  {
    id: 'france',
    name: 'France',
    path: 'M168 248 L158 238 L148 228 L158 218 L168 208 L178 208 L188 218 L198 228 L208 238 L208 248 L198 258 L188 268 L178 258 Z',
    labelX: 178,
    labelY: 238,
    color: '#4ECDC4'
  },
  {
    id: 'germany',
    name: 'Germany',
    path: 'M208 238 L198 228 L208 218 L218 208 L228 208 L238 218 L248 228 L248 238 L238 248 L228 258 L218 248 L208 248 Z',
    labelX: 228,
    labelY: 228,
    color: '#45B7D1'
  },
  {
    id: 'italy',
    name: 'Italy',
    path: 'M208 248 L218 248 L228 258 L228 268 L238 278 L238 288 L228 298 L218 308 L208 318 L198 308 L188 298 L188 288 L198 278 L208 268 Z',
    labelX: 218,
    labelY: 278,
    color: '#96CEB4'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    path: 'M148 208 L138 198 L128 188 L138 178 L148 168 L158 178 L168 188 L158 198 Z',
    labelX: 148,
    labelY: 188,
    color: '#FFEAA7'
  },
  {
    id: 'poland',
    name: 'Poland',
    path: 'M248 228 L238 218 L248 208 L258 198 L268 208 L278 218 L278 228 L268 238 L258 248 L248 238 Z',
    labelX: 258,
    labelY: 218,
    color: '#DDA0DD'
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    path: 'M198 208 L188 198 L198 188 L208 188 L218 198 L218 208 L208 218 Z',
    labelX: 208,
    labelY: 198,
    color: '#74B9FF'
  },
  {
    id: 'portugal',
    name: 'Portugal',
    path: 'M108 268 L98 258 L88 248 L88 238 L98 228 L108 238 L118 248 L118 258 Z',
    labelX: 103,
    labelY: 248,
    color: '#FD79A8'
  },
  {
    id: 'greece',
    name: 'Greece',
    path: 'M278 278 L268 268 L278 258 L288 268 L298 278 L288 288 L278 298 L268 288 Z',
    labelX: 278,
    labelY: 278,
    color: '#FDCB6E'
  },
  {
    id: 'sweden',
    name: 'Sweden',
    path: 'M248 158 L238 148 L248 138 L258 128 L268 138 L278 148 L278 158 L268 168 L258 178 L248 168 Z',
    labelX: 258,
    labelY: 158,
    color: '#55A3FF'
  },
  {
    id: 'norway',
    name: 'Norway',
    path: 'M238 148 L228 138 L238 128 L248 118 L258 108 L268 118 L268 128 L258 138 L248 148 Z',
    labelX: 248,
    labelY: 138,
    color: '#6C5CE7'
  },
  {
    id: 'austria',
    name: 'Austria',
    path: 'M228 258 L218 248 L228 238 L238 248 L248 258 L238 268 Z',
    labelX: 233,
    labelY: 253,
    color: '#A29BFE'
  }
];

// Translation overlays for different languages
interface Translation {
  countryId: string;
  text: string;
  language: string;
}

interface FullScreenEuropeMapProps {
  visible: boolean;
  onClose: () => void;
  translations?: Translation[];
  selectedLanguage?: string;
  onCountryPress?: (countryId: string, countryName: string) => void;
  enableSpeech?: boolean;
  speechText?: string;
}

export default function FullScreenEuropeMap({
  visible,
  onClose,
  translations = [],
  selectedLanguage = 'en',
  onCountryPress,
  enableSpeech = true,
  speechText = 'Hello'
}: FullScreenEuropeMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCountryPress = async (country: Country) => {
    setSelectedCountry(country.id);
    onCountryPress?.(country.id, country.name);

    // If speech is enabled, speak the text in the country's language
    if (enableSpeech && speechText) {
      setIsSpeaking(true);
      
      try {
        const success = await speakTranslationForCountry(speechText, country.id, {
          onStart: () => {
            console.log(`Speaking "${speechText}" in ${country.name}`);
          },
          onDone: () => {
            setIsSpeaking(false);
          },
          onError: (error) => {
            setIsSpeaking(false);
            Alert.alert(
              'Speech Error',
              `Could not speak in ${country.name}. ${error.message || 'Please check your internet connection and translation settings.'}`
            );
          }
        });

        if (!success) {
          setIsSpeaking(false);
        }
      } catch (error) {
        setIsSpeaking(false);
        console.error('Speech error:', error);
      }
    }
  };

  const getTranslationForCountry = (countryId: string): string | null => {
    const translation = translations.find(
      t => t.countryId === countryId && t.language === selectedLanguage
    );
    return translation?.text || null;
  };

  const getCountryFillColor = (country: Country): string => {
    if (selectedCountry === country.id) {
      return '#2ECC71'; // Bright green for selected
    }
    return country.color;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Europe Interactive Map</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, showLabels && styles.activeControl]}
            onPress={() => setShowLabels(!showLabels)}
          >
            <Text style={styles.controlText}>
              {showLabels ? '🏷️ Hide Labels' : '🏷️ Show Labels'}
            </Text>
          </TouchableOpacity>
          
          {enableSpeech && (
            <TouchableOpacity
              style={[styles.controlButton, isSpeaking && styles.speakingControl]}
              disabled={isSpeaking}
            >
              <Text style={styles.controlText}>
                {isSpeaking ? '🔊 Speaking...' : '🔊 Speech On'}
              </Text>
            </TouchableOpacity>
          )}
          
          {selectedCountry && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedCountry(null)}
            >
              <Text style={styles.controlText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Map Container */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          maximumZoomScale={3}
          minimumZoomScale={0.5}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mapContainer}>
            <Svg
              width={screenWidth}
              height={screenHeight * 0.7}
              viewBox="0 0 400 400"
              style={styles.svg}
            >
              {/* Map background */}
              <Path
                d="M80 120 L320 120 L320 320 L80 320 Z"
                fill="#E8F4FD"
                stroke="#3498DB"
                strokeWidth="2"
                opacity={0.3}
              />

              {/* Countries */}
              {europeanCountries.map((country) => (
                <G key={country.id}>
                  {/* Country path */}
                  <Path
                    d={country.path}
                    fill={getCountryFillColor(country)}
                    stroke="#2C3E50"
                    strokeWidth="1.5"
                    opacity={selectedCountry === country.id ? 1 : 0.8}
                    onPress={() => handleCountryPress(country)}
                  />

                  {/* Country name labels */}
                  {showLabels && (
                    <SvgText
                      x={country.labelX}
                      y={country.labelY}
                      fontSize="12"
                      fill="#2C3E50"
                      fontWeight="bold"
                      textAnchor="middle"
                      onPress={() => handleCountryPress(country)}
                    >
                      {country.name}
                    </SvgText>
                  )}

                  {/* Translation overlays */}
                  {translations.length > 0 && (
                    (() => {
                      const translation = getTranslationForCountry(country.id);
                      if (translation) {
                        return (
                          <SvgText
                            x={country.labelX}
                            y={country.labelY + 15}
                            fontSize="10"
                            fill="#E74C3C"
                            fontWeight="bold"
                            textAnchor="middle"
                            onPress={() => handleCountryPress(country)}
                          >
                            {translation}
                          </SvgText>
                        );
                      }
                      return null;
                    })()
                  )}
                </G>
              ))}
            </Svg>
          </View>
        </ScrollView>

        {/* Selected Country Info */}
        {selectedCountry && (
          <View style={styles.selectedCountryInfo}>
            <Text style={styles.selectedCountryText}>
              Selected: {europeanCountries.find(c => c.id === selectedCountry)?.name}
            </Text>
            {(() => {
              const translation = getTranslationForCountry(selectedCountry);
              if (translation) {
                return (
                  <Text style={styles.translationText}>
                    Translation: {translation}
                  </Text>
                );
              }
              return null;
            })()}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <Text style={styles.legendItem}>• Tap countries to select them</Text>
          <Text style={styles.legendItem}>• Pinch to zoom in/out</Text>
          <Text style={styles.legendItem}>• Scroll to navigate</Text>
          {translations.length > 0 && (
            <Text style={styles.legendItem}>• Red text shows translations</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#34495E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#34495E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
  },
  controlButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#7F8C8D',
  },
  activeControl: {
    backgroundColor: '#3498DB',
  },
  speakingControl: {
    backgroundColor: '#FF9800',
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#E74C3C',
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  selectedCountryInfo: {
    backgroundColor: '#34495E',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  selectedCountryText: {
    color: '#ECF0F1',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  translationText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
  legend: {
    backgroundColor: '#34495E',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  legendTitle: {
    color: '#ECF0F1',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendItem: {
    color: '#BDC3C7',
    fontSize: 12,
    marginVertical: 2,
  },
});