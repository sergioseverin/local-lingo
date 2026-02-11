// Working pinch-to-zoom implementation
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
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
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Pinch gesture for zooming with focal point
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      savedScale.value = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = Math.max(1, Math.min(savedScale.value * event.scale, 4));
      scale.value = newScale;
      
      // Adjust translation to zoom towards focal point
      const deltaScale = newScale - savedScale.value;
      translateX.value = savedTranslateX.value - (event.focalX - focalX.value) * deltaScale * 0.5;
      translateY.value = savedTranslateY.value - (event.focalY - focalY.value) * deltaScale * 0.5;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pan gesture for moving when zoomed
  const panGesture = Gesture.Pan()
    .minDistance(10)
    .enabled(true)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to reset
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 300 });
      translateX.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Combined gestures - pinch and pan work together, double tap separate
  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.wrapper}>
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            <View style={styles.mapContainer}>
              <EuropeMap
                labels={labels}
                onPressLabel={onPressLabel}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
});

export default EuropeMapWrapper;
