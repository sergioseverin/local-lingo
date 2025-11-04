// ✅ COPILOT TASK:
// Create a component called EuropeMapWrapper that solves the clipping issue.
// Behavior:
//  - The map should always scale to full screen width.
//  - Height = width / (1000 / 684) so the full SVG stays visible.
//  - If the map height is taller than the viewport, enable vertical scrolling.
//  - Works on React Native and React Native Web (macbook browser).
//
// Implementation rules:
//  - Use useWindowDimensions() to read screen width
//  - Compute height using aspect ratio
//  - Wrap the map in a <ScrollView> with style={{ flex: 1, overflow: 'auto' }}
//  - Inside ScrollView, center the map using contentContainerStyle
//  - Inside the sized container, render <EuropeMap labels={...} onPressLabel={...} />
//
// After generating, do NOT modify EuropeMap.tsx — it should only render the SVG + labels.

import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import EuropeMap from './EuropeMap';

interface LabelData {
  text: string;
  x: number;
  y: number;
  lang: string;
}

interface EuropeMapWrapperProps {
  labels?: Record<string, LabelData>;
  onPressLabel?: (countryCode: string, languageCode?: string) => void;
}

const EuropeMapWrapper: React.FC<EuropeMapWrapperProps> = ({
  labels = {},
  onPressLabel,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Calculate map height based on SVG aspect ratio (1000/684)
  const mapWidth = screenWidth;
  const mapHeight = mapWidth * (684 / 1000);
  
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={[
        styles.contentContainer,
        { minHeight: Math.max(mapHeight, screenHeight) }
      ]}
      showsVerticalScrollIndicator={true}
    >
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        <EuropeMap
          labels={labels}
          onPressLabel={onPressLabel}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mapContainer: {
    position: 'relative',
  },
});

export default EuropeMapWrapper;
