import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import AppWrapper from '../../components/AppWrapper';
import TranslationMapScreen from '../../components/TranslationMapScreen';

export default function MapScreen() {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'translation' | 'country' | 'instruction'>('translation');

  return (
    <AppWrapper statusMessage={statusMessage} statusType={statusType}>
      <StatusBar style="auto" />
      <TranslationMapScreen 
        onStatusChange={(message, type) => {
          setStatusMessage(message || '');
          setStatusType(type || 'translation');
        }}
      />
    </AppWrapper>
  );
}