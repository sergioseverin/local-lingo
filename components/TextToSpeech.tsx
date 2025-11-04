import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TextToSpeechProps {
  text?: string;
}

export default function TextToSpeech({ text = "Hello! Welcome to Local Lingo" }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);

  // Get available voices
  const getVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
      console.log('Available voices:', voices);
    } catch (error) {
      console.error('Error getting voices:', error);
    }
  };

  // Speak text with options
  const speakText = async (textToSpeak: string, language?: string) => {
    try {
      setIsSpeaking(true);
      
      const options: Speech.SpeechOptions = {
        language: language || 'en-US', // Default to English
        pitch: 1.0,
        rate: 0.8,
        voice: undefined, // You can specify a specific voice here
        volume: 1.0,
        onStart: () => {
          console.log('Speech started');
        },
        onDone: () => {
          console.log('Speech finished');
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('Speech stopped');
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          Alert.alert('Speech Error', 'Failed to speak text');
        },
      };

      await Speech.speak(textToSpeak, options);
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to speak text');
    }
  };

  // Stop speaking
  const stopSpeaking = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  // Language-specific examples
  const languageExamples = [
    { text: "Hello, how are you?", language: "en-US", flag: "🇺🇸", label: "English" },
    { text: "Hola, ¿cómo estás?", language: "es-ES", flag: "🇪🇸", label: "Spanish" },
    { text: "Bonjour, comment allez-vous?", language: "fr-FR", flag: "🇫🇷", label: "French" },
    { text: "Hallo, wie geht es dir?", language: "de-DE", flag: "🇩🇪", label: "German" },
    { text: "Ciao, come stai?", language: "it-IT", flag: "🇮🇹", label: "Italian" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text-to-Speech Demo</Text>
      
      {/* Main text to speak */}
      <View style={styles.mainSection}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.speakButton]}
            onPress={() => speakText(text)}
            disabled={isSpeaking}
          >
            <Text style={styles.buttonText}>
              {isSpeaking ? "Speaking..." : "🔊 Speak"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopSpeaking}
            disabled={!isSpeaking}
          >
            <Text style={styles.buttonText}>⏹️ Stop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language examples */}
      <Text style={styles.subtitle}>Try Different Languages:</Text>
      {languageExamples.map((example, index) => (
        <TouchableOpacity
          key={index}
          style={styles.languageButton}
          onPress={() => speakText(example.text, example.language)}
          disabled={isSpeaking}
        >
          <Text style={styles.languageText}>
            {example.flag} {example.label}
          </Text>
          <Text style={styles.exampleText}>{example.text}</Text>
        </TouchableOpacity>
      ))}

      {/* Get voices button */}
      <TouchableOpacity
        style={[styles.button, styles.voicesButton]}
        onPress={getVoices}
      >
        <Text style={styles.buttonText}>Get Available Voices</Text>
      </TouchableOpacity>

      {/* Show available voices count */}
      {availableVoices.length > 0 && (
        <Text style={styles.voicesInfo}>
          Found {availableVoices.length} available voices
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  mainSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 100,
  },
  speakButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  voicesButton: {
    backgroundColor: '#2196F3',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  languageButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  languageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  voicesInfo: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 12,
  },
});