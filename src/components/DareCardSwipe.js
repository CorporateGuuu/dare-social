import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Animated, Alert } from 'react-native';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = width;
const SWIPE_THRESHOLD = 100;
const PARTICLE_COUNT = 10;

const Particle = ({ x, y, color, opacity }) => (
  <Animated.View
    style={{
      position: 'absolute',
      width: 5,
      height: 5,
      backgroundColor: color,
      borderRadius: 2.5,
      opacity: opacity,
    }}
  />
);

const DareCard = ({ title, user1, user2, icons, result, action, resultColor, onSwipeOff }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const shadowElevation = useRef(new Animated.Value(5)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { dx, moveX, moveY } = gestureState;
        pan.setValue({ x: dx, y: 0 });
        // Rotation with quadratic sensitivity
        const rotateValue = dx * Math.abs(dx) / 5000;
        rotate.setValue(dx < 0 ? -Math.min(15, rotateValue) : Math.min(15, rotateValue));
        // Scale animation
        const scaleValue = 1 + Math.abs(dx) / 700;
        scale.setValue(Math.min(1.2, scaleValue));
        // Opacity fade
        const opacityValue = 1 - Math.abs(dx) / 400;
        opacity.setValue(Math.max(0.3, opacityValue));
        // Shadow elevation
        const shadowValue = 5 + Math.abs(dx) / 50;
        shadowElevation.setValue(Math.min(15, shadowValue));
        // Glow intensity
        const glowValue = Math.abs(dx) / 30;
        glowIntensity.setValue(Math.min(15, glowValue));
        // Particle effect
        if (Math.abs(dx) % 10 === 0) { // Emit particles periodically
          const newParticles = Array.from({ length: PARTICLE_COUNT }, () => ({
            id: Date.now() + Math.random(),
            x: moveX - 175, // Center relative to card (350/2)
            y: moveY - 75,  // Center relative to card (150/2)
            opacity: new Animated.Value(1),
            color: resultColor,
          }));
          setParticles((prev) => [...prev, ...newParticles]);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const direction = dx > SWIPE_THRESHOLD ? 'right' : dx < -SWIPE_THRESHOLD ? 'left' : null;

        if (direction) {
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: direction === 'right' ? 15 : -15,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(shadowElevation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false, // Elevation not natively animatable
            }),
            Animated.timing(glowIntensity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start(() => {
            onSwipeOff();
            setParticles([]); // Clear particles on swipe off
          });
          Alert.alert('Action', `Dare ${direction === 'right' ? 'Approved' : 'Declined'}!`);
        } else {
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1.0,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1.0,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(shadowElevation, {
              toValue: 5,
              friction: 5,
              useNativeDriver: false,
            }),
            Animated.spring(glowIntensity, {
              toValue: 0,
              friction: 5,
              useNativeDriver: false,
            }),
          ]).start(() => setParticles([])); // Clear particles on reset
        }
      },
    }),
  );

  useEffect(() => {
    particles.forEach((particle) => {
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particle.id));
      });
    });
  }, [particles]);

  const panStyle = {
    transform: [
      { translateX: pan.x },
      { rotate: rotate.interpolate({ inputRange: [-15, 15], outputRange: ['-15deg', '15deg'] }) },
      { scaleX: scale },
      { scaleY: scale },
    ],
    opacity: opacity,
    elevation: shadowElevation,
    backgroundColor: glowIntensity.interpolate({
      inputRange: [0, 15],
      outputRange: ['#222222', `rgba(0, 212, 170, ${glowIntensity / 15})`],
    }),
  };

  return (
    <Animated.View style={[styles.card, panStyle]} {...panResponder.panHandlers}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.userRow}>
        <Text style={styles.username}>{user1}</Text>
        <View style={styles.avatar} />
        <View style={styles.avatar} />
        <Text style={styles.username}>{user2}</Text>
      </View>
      <View style={styles.iconsRow}>
        {icons && icons.split('').map((icon, index) => (
          <Text key={index} style={styles.icon}>{icon}</Text>
        ))}
      </View>
      <Text style={[styles.result, { color: resultColor }]}>{result}</Text>
      <Text style={[styles.action, { backgroundColor: resultColor }]}>{action}</Text>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          opacity={particle.opacity}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 350,
    height: 150,
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'absolute',
  },
  title: { fontSize: 16, color: '#FFFFFF', fontFamily: 'Montserrat' },
  userRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 5 },
  username: { color: '#D3D3D3', marginHorizontal: 5 },
  avatar: { width: 20, height: 20, backgroundColor: '#333333', borderRadius: 10 },
  iconsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 5 },
  icon: { fontSize: 18, color: '#FFFFFF', marginHorizontal: 5 },
  result: { fontSize: 14, textAlign: 'center', marginVertical: 5, fontFamily: 'Montserrat' },
  action: { fontSize: 14, color: '#000000', textAlign: 'center', padding: 5, borderRadius: 10 },
});

export default DareCard;
