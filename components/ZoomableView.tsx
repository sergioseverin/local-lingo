import React from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface ZoomableViewProps {
  children: React.ReactNode;
  maxZoom?: number;
  minZoom?: number;
}

export const ZoomableView: React.FC<ZoomableViewProps> = ({
  children,
  maxZoom = 4,
  minZoom = 1,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const contentWidth = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const onLayoutContainer = (e: LayoutChangeEvent) => {
    containerWidth.value = e.nativeEvent.layout.width;
    containerHeight.value = e.nativeEvent.layout.height;
  };

  const onLayoutContent = (e: LayoutChangeEvent) => {
    contentWidth.value = e.nativeEvent.layout.width;
    contentHeight.value = e.nativeEvent.layout.height;
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      cancelAnimation(scale);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(minZoom, Math.min(savedScale.value * e.scale, maxZoom));
    })
    .onEnd(() => {
      if (scale.value < minZoom) {
        scale.value = withTiming(minZoom);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      // Simple bounds check could be added here, but for now allow free pan to avoid "stuck" issues
      // To strictly bound: calculate max offset based on (scale * size - containerSize) / 2
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > minZoom) {
        scale.value = withTiming(minZoom);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        scale.value = withTiming(maxZoom / 2);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutContainer}>
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.contentContainer}>
          <Animated.View
            style={[animatedStyle, styles.content]}
            onLayout={onLayoutContent}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    // We let the content determine its size, but centered
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
