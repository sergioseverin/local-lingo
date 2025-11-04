import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppWrapper from '../../components/AppWrapper';
import EuropeMap, { COUNTRY_INFO } from '../../components/EuropeMap';
import InteractiveMapDemo from '../../components/InteractiveMapDemo';
import SpeechDemo from '../../components/SpeechDemo';
import TextToSpeech from '../../components/TextToSpeech';
import TranslationDemo from '../../components/TranslationDemo';

const countryPhrases = {
  ES: "¡Hola! Bienvenido a España",
  FR: "Bonjour! Bienvenue en France", 
  DE: "Hallo! Willkommen in Deutschland",
  IT: "Ciao! Benvenuto in Italia",
  GB: "Hello! Welcome to the United Kingdom",
  PL: "Cześć! Witamy w Polsce",
  NL: "Hallo! Welkom in Nederland",
  PT: "Olá! Bem-vindo a Portugal",
  GR: "Γεια σας! Καλώς ήρθατε στην Ελλάδα",
  SE: "Hej! Välkommen till Sverige",
  NO: "Hei! Velkommen til Norge",
  AT: "Hallo! Willkommen in Österreich",
};

const countryLanguages = {
  ES: "es-ES",
  FR: "fr-FR", 
  DE: "de-DE",
  IT: "it-IT",
  GB: "en-GB",
  PL: "pl-PL",
  NL: "nl-NL",
  PT: "pt-PT",
  GR: "el-GR",
  SE: "sv-SE",
  NO: "no-NO",
  AT: "de-AT",
};

export default function DemoScreen() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [currentPhrase, setCurrentPhrase] = useState<string>('Select a country on the map to hear a greeting!');

  const handleCountryPress = (countryCode: keyof typeof COUNTRY_INFO) => {
    setSelectedCountry(countryCode);
    const phrase = countryPhrases[countryCode as keyof typeof countryPhrases];
    if (phrase) {
      setCurrentPhrase(phrase);
      Alert.alert('Country Selected', `You selected ${COUNTRY_INFO[countryCode].name}! Listen to the greeting.`);
    }
  };

  return (
    <AppWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🗺️ Local Lingo Demo</Text>
        <Text style={styles.subtitle}>
          Interactive language learning with maps, speech, and ads
        </Text>

      {/* Google Translate API Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Google Translate API</Text>
        <TranslationDemo />
      </View>

      {/* Speech Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Country Speech Demo</Text>
        <SpeechDemo />
      </View>

      {/* Interactive Full-Screen Map Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Full-Screen Interactive Map</Text>
        <InteractiveMapDemo />
      </View>

      {/* Europe Map Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Select a Country</Text>
        <EuropeMap
          onCountryPress={handleCountryPress}
          selectedCountry={selectedCountry}
          showCountryNames={true}
        />
        {selectedCountry && (
          <Text style={styles.selectedCountry}>
            Selected: {COUNTRY_INFO[selectedCountry as keyof typeof COUNTRY_INFO]?.name}
          </Text>
        )}
      </View>

      {/* Text-to-Speech Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Hear the Language</Text>
        <TextToSpeech text={currentPhrase} />
      </View>

      {/* AdMob Ads Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Advertisement Demo</Text>
        <Text style={styles.selectedCountry}>Ad Banner Placeholder - Migration to react-native-google-mobile-ads pending</Text>
      </View>

      {/* Feature Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>✨ Features Demonstrated:</Text>
        <Text style={styles.featureText}>
          🌐 <Text style={styles.bold}>Google Translate API</Text>: Real-time translation to multiple languages{'\n'}
          🔊 <Text style={styles.bold}>Speech Integration</Text>: Tap countries to hear translated text spoken{'\n'}
          � <Text style={styles.bold}>Full-Screen Map</Text>: Interactive SVG map with translations{'\n'}
          🗺️ <Text style={styles.bold}>react-native-svg</Text>: Interactive SVG map of Europe{'\n'}
          🎤 <Text style={styles.bold}>expo-speech</Text>: Text-to-speech in multiple languages{'\n'}
          📱 <Text style={styles.bold}>AdMob</Text>: Banner, interstitial, and rewarded ads (migration pending)
        </Text>
      </View>
    </ScrollView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
    textAlign: 'center',
  },
  selectedCountry: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    color: '#27ae60',
    backgroundColor: '#d5f4e6',
    padding: 8,
    borderRadius: 6,
  },
  infoSection: {
    backgroundColor: '#ecf0f1',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  featureText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34495e',
  },
  bold: {
    fontWeight: 'bold',
    color: '#3498db',
  },
});