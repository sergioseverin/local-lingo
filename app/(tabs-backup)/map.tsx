import { StatusBar } from 'expo-status-bar';
import React from 'react';
import AppWrapper from '../../components/AppWrapper';
import TranslationMapScreen from '../../components/TranslationMapScreen';

export default function MapScreen() {
  return (
    <AppWrapper>
      <StatusBar style="auto" />
      <TranslationMapScreen />
    </AppWrapper>
  );
}