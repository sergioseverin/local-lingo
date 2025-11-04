import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import FullScreenEuropeMap from './FullScreenEuropeMap';

// Sample translations for demonstration
const sampleTranslations = [
  // Spanish translations
  { countryId: 'spain', text: 'España', language: 'es' },
  { countryId: 'france', text: 'Francia', language: 'es' },
  { countryId: 'germany', text: 'Alemania', language: 'es' },
  { countryId: 'italy', text: 'Italia', language: 'es' },
  { countryId: 'uk', text: 'Reino Unido', language: 'es' },
  { countryId: 'poland', text: 'Polonia', language: 'es' },
  { countryId: 'netherlands', text: 'Países Bajos', language: 'es' },
  { countryId: 'portugal', text: 'Portugal', language: 'es' },
  { countryId: 'greece', text: 'Grecia', language: 'es' },
  { countryId: 'sweden', text: 'Suecia', language: 'es' },
  { countryId: 'norway', text: 'Noruega', language: 'es' },
  { countryId: 'austria', text: 'Austria', language: 'es' },

  // French translations
  { countryId: 'spain', text: 'Espagne', language: 'fr' },
  { countryId: 'france', text: 'France', language: 'fr' },
  { countryId: 'germany', text: 'Allemagne', language: 'fr' },
  { countryId: 'italy', text: 'Italie', language: 'fr' },
  { countryId: 'uk', text: 'Royaume-Uni', language: 'fr' },
  { countryId: 'poland', text: 'Pologne', language: 'fr' },
  { countryId: 'netherlands', text: 'Pays-Bas', language: 'fr' },
  { countryId: 'portugal', text: 'Portugal', language: 'fr' },
  { countryId: 'greece', text: 'Grèce', language: 'fr' },
  { countryId: 'sweden', text: 'Suède', language: 'fr' },
  { countryId: 'norway', text: 'Norvège', language: 'fr' },
  { countryId: 'austria', text: 'Autriche', language: 'fr' },

  // German translations
  { countryId: 'spain', text: 'Spanien', language: 'de' },
  { countryId: 'france', text: 'Frankreich', language: 'de' },
  { countryId: 'germany', text: 'Deutschland', language: 'de' },
  { countryId: 'italy', text: 'Italien', language: 'de' },
  { countryId: 'uk', text: 'Vereinigtes Königreich', language: 'de' },
  { countryId: 'poland', text: 'Polen', language: 'de' },
  { countryId: 'netherlands', text: 'Niederlande', language: 'de' },
  { countryId: 'portugal', text: 'Portugal', language: 'de' },
  { countryId: 'greece', text: 'Griechenland', language: 'de' },
  { countryId: 'sweden', text: 'Schweden', language: 'de' },
  { countryId: 'norway', text: 'Norwegen', language: 'de' },
  { countryId: 'austria', text: 'Österreich', language: 'de' },

  // Italian translations
  { countryId: 'spain', text: 'Spagna', language: 'it' },
  { countryId: 'france', text: 'Francia', language: 'it' },
  { countryId: 'germany', text: 'Germania', language: 'it' },
  { countryId: 'italy', text: 'Italia', language: 'it' },
  { countryId: 'uk', text: 'Regno Unito', language: 'it' },
  { countryId: 'poland', text: 'Polonia', language: 'it' },
  { countryId: 'netherlands', text: 'Paesi Bassi', language: 'it' },
  { countryId: 'portugal', text: 'Portogallo', language: 'it' },
  { countryId: 'greece', text: 'Grecia', language: 'it' },
  { countryId: 'sweden', text: 'Svezia', language: 'it' },
  { countryId: 'norway', text: 'Norvegia', language: 'it' },
  { countryId: 'austria', text: 'Austria', language: 'it' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];

export default function InteractiveMapDemo() {
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [speechText, setSpeechText] = useState('Hello');
  const [enableSpeech, setEnableSpeech] = useState(true);
  const [lastSelectedCountry, setLastSelectedCountry] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCountryPress = (countryId: string, countryName: string) => {
    setLastSelectedCountry({ id: countryId, name: countryName });
    
    // Find the translation for the selected country and language
    const translation = sampleTranslations.find(
      t => t.countryId === countryId && t.language === selectedLanguage
    );

    if (translation) {
      Alert.alert(
        `Country Selected: ${countryName}`,
        `Translation in ${languages.find(l => l.code === selectedLanguage)?.name}: ${translation.text}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        `Country Selected: ${countryName}`,
        'No translation available for this language.',
        [{ text: 'OK' }]
      );
    }
  };

  const openMap = () => {
    setMapVisible(true);
  };

  const closeMap = () => {
    setMapVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Interactive Europe Map</Text>
        <Text style={styles.subtitle}>
          Full-screen map with clickable countries and translation overlays
        </Text>
      </View>

      {/* Speech Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Speech Configuration:</Text>
        
        <View style={styles.speechControls}>
          <TouchableOpacity
            style={[
              styles.speechToggle,
              { backgroundColor: enableSpeech ? '#27AE60' : '#BDC3C7' }
            ]}
            onPress={() => setEnableSpeech(!enableSpeech)}
          >
            <Text style={styles.speechToggleText}>
              {enableSpeech ? '🔊 Speech Enabled' : '🔇 Speech Disabled'}
            </Text>
          </TouchableOpacity>
        </View>

        {enableSpeech && (
          <View style={styles.speechTextSection}>
            <Text style={styles.speechTextLabel}>Text to speak when countries are tapped:</Text>
            <TextInput
              style={styles.speechTextInput}
              value={speechText}
              onChangeText={setSpeechText}
              placeholder="Enter text to speak..."
              multiline
            />
            <Text style={styles.speechHint}>
              💡 This text will be translated and spoken in each country's language
            </Text>
          </View>
        )}
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Translation Language:</Text>
        <View style={styles.languageGrid}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                selectedLanguage === language.code && styles.selectedLanguageButton
              ]}
              onPress={() => setSelectedLanguage(language.code)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={[
                styles.languageText,
                selectedLanguage === language.code && styles.selectedLanguageText
              ]}>
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map Controls */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.openMapButton} onPress={openMap}>
          <Text style={styles.openMapButtonText}>🌍 Open Full-Screen Map</Text>
        </TouchableOpacity>
        
        {lastSelectedCountry && (
          <View style={styles.lastSelection}>
            <Text style={styles.lastSelectionTitle}>Last Selected:</Text>
            <Text style={styles.lastSelectionText}>
              {lastSelectedCountry.name} ({lastSelectedCountry.id})
            </Text>
            {(() => {
              const translation = sampleTranslations.find(
                t => t.countryId === lastSelectedCountry.id && t.language === selectedLanguage
              );
              if (translation) {
                return (
                  <Text style={styles.translationPreview}>
                    {languages.find(l => l.code === selectedLanguage)?.flag} {translation.text}
                  </Text>
                );
              }
              return null;
            })()}
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features:</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✨ Full-screen interactive map</Text>
          <Text style={styles.featureItem}>🎯 Clickable countries with feedback</Text>
          <Text style={styles.featureItem}>🔊 Text-to-speech in native languages when countries are tapped</Text>
          <Text style={styles.featureItem}>🏷️ Toggle-able country labels</Text>
          <Text style={styles.featureItem}>🔍 Pinch to zoom and scroll navigation</Text>
          <Text style={styles.featureItem}>🌐 Multi-language translation overlays</Text>
          <Text style={styles.featureItem}>🎨 Color-coded countries with selection highlighting</Text>
          <Text style={styles.featureItem}>📱 Responsive design for all screen sizes</Text>
        </View>
      </View>

      {/* Implementation Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Implementation Notes:</Text>
        <View style={styles.notesList}>
          <Text style={styles.noteItem}>
            • Uses react-native-svg for vector graphics
          </Text>
          <Text style={styles.noteItem}>
            • SVG paths are simplified representations
          </Text>
          <Text style={styles.noteItem}>
            • Coordinates can be easily customized
          </Text>
          <Text style={styles.noteItem}>
            • Supports dynamic translation overlays
          </Text>
          <Text style={styles.noteItem}>
            • Modal presentation for full-screen experience
          </Text>
          <Text style={styles.noteItem}>
            • ScrollView with zoom support for navigation
          </Text>
        </View>
      </View>

      {/* Full-Screen Map Component */}
      <FullScreenEuropeMap
        visible={mapVisible}
        onClose={closeMap}
        translations={sampleTranslations}
        selectedLanguage={selectedLanguage}
        onCountryPress={handleCountryPress}
        enableSpeech={enableSpeech}
        speechText={speechText}
      />
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
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageButton: {
    backgroundColor: '#3498DB',
    borderColor: '#2980B9',
  },
  languageFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedLanguageText: {
    color: 'white',
  },
  openMapButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  openMapButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastSelection: {
    backgroundColor: '#E8F6F3',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  lastSelectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  lastSelectionText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '600',
  },
  translationPreview: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
    marginTop: 4,
  },
  featureList: {
    marginLeft: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 20,
  },
  notesList: {
    marginLeft: 10,
  },
  noteItem: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    lineHeight: 18,
  },
  speechControls: {
    alignItems: 'center',
    marginBottom: 15,
  },
  speechToggle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  speechToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  speechTextSection: {
    marginTop: 15,
  },
  speechTextLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  speechTextInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  speechHint: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});