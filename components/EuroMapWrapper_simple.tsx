// Simple working version with native ScrollView zoom
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
      showsHorizontalScrollIndicator={true}
      maximumZoomScale={3}
      minimumZoomScale={0.5}
      zoomScale={1}
      bouncesZoom={true}
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