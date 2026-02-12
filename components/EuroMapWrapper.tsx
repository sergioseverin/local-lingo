import React from 'react';
import { StyleSheet, View } from 'react-native';
import EuropeMap from './EuropeMap';
import { ZoomableView } from './ZoomableView';

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
  return (
    <View style={styles.container}>
      <ZoomableView maxZoom={5} minZoom={1}>
        <EuropeMap
          labels={labels}
          onPressLabel={onPressLabel}
        />
      </ZoomableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default EuropeMapWrapper;
