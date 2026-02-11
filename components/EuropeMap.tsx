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
import { StyleSheet, View } from 'react-native';
import Svg, { G, Text as SvgText, Circle } from 'react-native-svg';

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

const EuropeMap: React.FC<EuropeMapProps> = ({
  labels = {},
  onPressLabel,
}) => {
  return (
    <View style={styles.container}>
      {/* Render the Europe SVG */}
      <EuropeSvg
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      />
      
      {/* Overlay labels with the SAME viewBox as europe.svg */}
      {Object.keys(labels).length > 0 && (
        <Svg
          viewBox="0 0 1000 684"
          preserveAspectRatio="xMidYMid meet"
          style={StyleSheet.absoluteFill}
        >
          <G>
            {Object.entries(labels).map(([countryCode, labelData]) => (
              <G key={`label-${countryCode}`}>
                {/* Invisible larger circle for easier tapping */}
                <Circle
                  cx={labelData.x}
                  cy={labelData.y}
                  r="30"
                  fill="transparent"
                  onPress={() => onPressLabel?.(countryCode, labelData.lang)}
                />
                {/* The actual text */}
                <SvgText
                  x={labelData.x}
                  y={labelData.y}
                  fontSize="16"
                  fontWeight="bold"
                  fill="#333333"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  onPress={() => onPressLabel?.(countryCode, labelData.lang)}
                >
                  {labelData.text}
                </SvgText>
              </G>
            ))}
          </G>
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1000 / 684, // match SVG viewBox ratio
    position: 'relative',
    alignSelf: 'center',
  },
});

export default EuropeMap;