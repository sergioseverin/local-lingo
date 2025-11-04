import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppWrapper from '../../components/AppWrapper';

export default function DemoScreen() {
  return (
    <AppWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🗺️ Local Lingo Demo</Text>
        <Text style={styles.subtitle}>
          Interactive language learning with maps, speech, and ads
        </Text>

        {/* Demo placeholder content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Demo Features</Text>
          <Text style={styles.featureText}>
            This demo section will showcase translation and speech features
          </Text>
        </View>

        {/* Feature Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>✨ Features Demonstrated:</Text>
          <Text style={styles.featureText}>
            🌐 <Text style={styles.bold}>Offline Translation</Text>: Real-time translation to multiple languages{'\n'}
            🔊 <Text style={styles.bold}>Speech Integration</Text>: Tap countries to hear translated text spoken{'\n'}
            🗺️ <Text style={styles.bold}>react-native-svg</Text>: Interactive SVG map of Europe{'\n'}
            🎤 <Text style={styles.bold}>expo-speech</Text>: Text-to-speech in multiple languages{'\n'}
            📱 <Text style={styles.bold}>AdMob</Text>: Banner ads (migration in progress)
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