import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🌙</Text>
          <View style={styles.starContainer}>
            <Text style={styles.star}>✨</Text>
          </View>
        </View>
        <Text style={styles.title}>Noor Academy</Text>
        <Text style={styles.subtitle}>Illuminate Your Path to Knowledge</Text>
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>100% Halal • Free Forever • No Ads</Text>
        </View>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Islamic E-Learning Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logo: {
    fontSize: 100,
  },
  starContainer: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  star: {
    fontSize: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#99f6e4',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  taglineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tagline: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: '#99f6e4',
  },
});
