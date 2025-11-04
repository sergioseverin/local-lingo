import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TranslationStatusProps {
  message?: string;
  type?: 'translation' | 'country' | 'instruction';
}

export default function TranslationStatus({ message, type = 'translation' }: TranslationStatusProps) {
  if (!message || !message.trim()) {
    return null;
  }

  const getStatusStyle = () => {
    switch (type) {
      case 'country':
        return styles.footerMessage;
      case 'instruction':
        return styles.instructionsBar;
      default:
        return styles.statusBar;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'country':
        return styles.footerMessageText;
      case 'instruction':
        return styles.instructionText;
      default:
        return styles.translationCount;
    }
  };

  return (
    <View style={getStatusStyle()}>
      <Text style={getTextStyle()}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: '#34495E',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  translationCount: {
    color: '#F39C12',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerMessage: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 70,
    alignItems: 'center',
  },
  footerMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionsBar: {
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 70,
    borderTopWidth: 1,
    borderTopColor: '#D5F4E6',
  },
  instructionText: {
    color: '#27AE60',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});