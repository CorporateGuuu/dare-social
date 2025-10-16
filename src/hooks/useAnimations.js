import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';

export const useFadeIn = (duration = 600, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.ease),
      delay,
      useNativeDriver: true,
    }).start();
  }, [duration, delay, fadeAnim]);

  return fadeAnim;
};

export const useSlideUp = (distance = 50, duration = 600, delay = 0) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      easing: Easing.inOut(Easing.ease),
      delay,
      useNativeDriver: true,
    }).start();
  }, [distance, duration, delay, slideAnim]);

  return slideAnim;
};

export const useSpringScale = (initialValue = 1, trigger = false) => {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger, scaleAnim]);

  const triggerAnimation = () => scaleAnim.setValue(initialValue); // Reset for next trigger

  return [scaleAnim, triggerAnimation];
};

export const useModalAnimation = (isVisible) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  return { fadeAnim, scaleAnim };
};

export const useStaggeredList = (itemsLength, duration = 400, delayStep = 150) => {
  const anims = useRef([]).current;

  useEffect(() => {
    anims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * delayStep),
        Animated.parallel([
          Animated.timing(anim.fade, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(anim.slide, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [itemsLength, duration, delayStep, anims]);

  for (let i = 0; i < itemsLength; i++) {
    if (!anims[i]) {
      anims[i] = {
        fade: new Animated.Value(0),
        slide: new Animated.Value(30),
      };
    }
  }

  return anims;
};

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 100) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > threshold) {
          Animated.spring(pan, {
            toValue: { x: 300, y: 0 }, // Swipe right (e.g., accept)
            tension: 200,
            friction: 10,
            useNativeDriver: false,
          }).start(async () => {
            await Haptics.selectionAsync(); // Selection feedback for swipe right
            pan.setValue({ x: 0, y: 0 }); // Reset
            if (onSwipeRight) onSwipeRight();
          });
        } else if (gesture.dx < -threshold) {
          Animated.spring(pan, {
            toValue: { x: -300, y: 0 }, // Swipe left (e.g., reject)
            tension: 200,
            friction: 10,
            useNativeDriver: false,
          }).start(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Heavy impact for swipe left
            pan.setValue({ x: 0, y: 0 }); // Reset
            if (onSwipeLeft) onSwipeLeft();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 300,
            friction: 8,
            useNativeDriver: false,
          }).start(); // Snap back if not enough swipe
        }
      },
    })
  ).current;

  return { pan, panHandlers: panResponder.panHandlers };
};
