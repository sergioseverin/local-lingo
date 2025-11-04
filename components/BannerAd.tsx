// TODO: Replace with react-native-google-mobile-ads
// import { AdMobBanner } from 'expo-ads-admob';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAdUnitId, initializeAdMob } from '../utils/adMobUtils';

interface BannerAdProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBannerPortrait' | 'smartBannerLandscape';
  style?: any;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

/**
 * Reusable Banner Ad Component
 */
export function BannerAd({ 
  size = 'banner', 
  style, 
  onError, 
  onLoad 
}: BannerAdProps) {
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const success = await initializeAdMob();
      setIsInitialized(success);
    };
    init();
  }, []);

  const handleBannerError = (error: string) => {
    console.error('❌ Banner ad failed to load:', error);
    console.error('Ad Unit ID:', getAdUnitId());
    
    // Provide guidance for device testing
    if (error.includes('No ad to show') || error.includes('INTERNAL_ERROR')) {
      console.warn('⚠️  POSSIBLE DEVICE HASH ISSUE:');
      console.warn('If testing on a real device, you may need to add your device hash.');
      console.warn('Look for AdMob debug output containing your device advertising ID.');
      console.warn('Then update setTestDeviceIDAsync("YOUR_DEVICE_HASH") in app/_layout.tsx');
    }
    
    setBannerError(error);
    onError?.(error);
  };

  const handleBannerLoad = () => {
    console.log('✅ Banner ad loaded successfully');
    console.log('Ad Unit ID:', getAdUnitId());
    
    // Log device hash information for real-device testing
    console.log('📱 DEVICE TESTING INFO:');
    console.log('For real device testing, look for your device hash in AdMob debug output above.');
    console.log('If you see a message like "Use AdMobBanner.addTestDeviceID("XXXXXXXX")" in the logs,');
    console.log('add that hash to setTestDeviceIDAsync("XXXXXXXX") in app/_layout.tsx');
    console.log('Current test device setting: "EMULATOR" (works for simulators only)');
    console.warn('⚠️  If testing on a real device and seeing live ads, add your device hash to setTestDeviceIDAsync()');
    
    setBannerError(null);
    onLoad?.();
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <View style={[styles.bannerContainer, style]}>
      {/* TODO: Replace with react-native-google-mobile-ads banner */}
      <View style={styles.placeholderBanner}>
        <Text style={styles.placeholderText}>Ad Banner Placeholder</Text>
        <Text style={styles.placeholderSubtext}>Waiting for react-native-google-mobile-ads migration</Text>
        <Text style={styles.placeholderSubtext}>Ad Unit: {getAdUnitId()}</Text>
      </View>
      
      {/* 
      <AdMobBanner
        bannerSize={size}
        adUnitID={getAdUnitId()}
        servePersonalizedAds={false}
        onDidFailToReceiveAdWithError={handleBannerError}
        onAdViewDidReceiveAd={handleBannerLoad}
        style={styles.banner}
      />
      */}
      
      {bannerError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad failed to load</Text>
        </View>
      )}
    </View>
  );
}

interface BottomBannerAdProps {
  visible?: boolean;
}

/**
 * Fixed bottom banner ad component
 */
export function BottomBannerAd({ visible = true }: BottomBannerAdProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.bottomBannerContainer}>
      <BannerAd 
        size="banner"
        style={styles.bottomBanner}
        onError={(error) => console.log('❌ Bottom banner ad failed:', error)}
        onLoad={() => console.log('✅ Bottom banner ad loaded successfully')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  banner: {
    backgroundColor: 'transparent',
  },
  bottomBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    zIndex: 1000,
  },
  bottomBanner: {
    backgroundColor: 'transparent',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    margin: 5,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    textAlign: 'center',
  },
  placeholderBanner: {
    height: 50,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#1976d2',
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    minWidth: 320,
  },
  placeholderText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#1976d2',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});