// ✅ COPILOT INSTRUCTION:
// The Europe map must NOT stretch to full screen height.
// It should scale based on its natural aspect ratio (1774 / 1532).
// The component MUST NOT use "height: 100%" or "flex: 1" on the SVG.
// Instead, this file only renders the map and overlay labels.
// The parent screen will control width/height and scrolling.
// Do NOT wrap in ScrollView here — that goes in the screen wrapper, not this file.

/**
 * ⚠️ IMPORTANT COPILOT GUIDELINES FOR THIS FILE
 *
 * ✅ This map MUST always be rendered using the real SVG file:
 *      import EuropeSvg from "@/assets/maps/europe.svg";
 *
 * ✅ The translated labels MUST be rendered in a separate overlay <Svg> that:
 *      1. Uses the SAME viewBox as europe.svg ("0 0 1000 684")
 *      2. Uses style={StyleSheet.absoluteFill} to align with the map
 *      3. Uses preserveAspectRatio="xMidYMid meet" so scaling stays correct
 *
 * ✅ Coordinates for text labels are based on SVG coordinate space, NOT screen pixels.
 *
 * ❌ DO NOT:
 *      - Generate a polygon map or placeholder shapes
 *      - Use width/height for label overlay (must use viewBox)
 *      - Replace EuropeSvg with an <Image> or <SvgUri>
 *
 * To modify or extend this component, ALWAYS keep:
 *
 *    <EuropeSvg ... />
 *    <Svg viewBox="0 0 1000 684" style={StyleSheet.absoluteFill}>
 *        <SvgText ...>{text}</SvgText>
 *    </Svg>
 *
 * If adding new countries or labels, update /data/eu_label_positions.ts
 */

import EuropeSvg from '@/assets/maps/europe.svg';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LabelData {
  text: string;
  x: number;
  y: number;
  lang: string;
}

interface EuropeMapProps {
  labels?: Record<string, LabelData>;
  onPressLabel?: (countryCode: string, languageCode?: string) => void;
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 684;

const EuropeMap: React.FC<EuropeMapProps> = ({
  labels = {},
  onPressLabel,
}) => {
  return (
    // Container enforces aspect ratio to match SVG coordinate system
    <View style={styles.container}>
      {/* Background Map */}
      <View style={StyleSheet.absoluteFill}>
        <EuropeSvg
          width="100%"
          height="100%"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </View>
      
      {/* Interactive Overlay Layers */}
      {Object.entries(labels).map(([countryCode, labelData]) => (
        <TouchableOpacity
          key={`label-${countryCode}`}
          style={[
            styles.touchTarget,
            {
              left: `${(labelData.x / MAP_WIDTH) * 100}%`,
              top: `${(labelData.y / MAP_HEIGHT) * 100}%`,
            }
          ]}
          onPress={() => {
            console.log(`[EuropeMap] Tapped ${countryCode}`);
            onPressLabel?.(countryCode, labelData.lang)
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.labelText}>
            {labelData.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: MAP_WIDTH / MAP_HEIGHT,
    position: 'relative',
  },
  touchTarget: {
    position: 'absolute',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 2, // Minimal padding for touch target
  },
  labelText: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 7, 
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default EuropeMap;