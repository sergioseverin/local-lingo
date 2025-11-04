import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomBannerAd } from './BannerAd';
import TranslationStatus from './TranslationStatus';

interface AppWrapperProps {
  children: React.ReactNode;
  showBottomAd?: boolean;
  statusMessage?: string;
  statusType?: 'translation' | 'country' | 'instruction';
}

export default function AppWrapper({ 
  children, 
  showBottomAd = true, 
  statusMessage, 
  statusType = 'translation' 
}: AppWrapperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      {statusMessage && (
        <TranslationStatus message={statusMessage} type={statusType} />
      )}
      {showBottomAd && <BottomBannerAd />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 60, // Add padding for banner ad
  },
});