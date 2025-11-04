// TODO: Replace with react-native-google-mobile-ads imports
// AdMob functionality temporarily disabled for migration
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// AdMob Ad Unit IDs
export const AD_UNIT_IDS = {
  banner: Platform.select({
    // PRODUCTION USE ONLY - Uncomment for production builds:
    // ios: 'ca-app-pub-1356030142961879/1403164312', // Production banner ad unit ID
    // android: 'ca-app-pub-1356030142961879/1403164312', // Production banner ad unit ID
    
    // Development/Test banner ad unit ID:
    ios: 'ca-app-pub-3940256099942544/6300978111', // Google test banner
    android: 'ca-app-pub-3940256099942544/6300978111', // Google test banner
    default: 'ca-app-pub-3940256099942544/6300978111', // Google test banner fallback
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910', // Test interstitial ad unit ID for iOS
    android: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit ID for Android
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313', // Test rewarded ad unit ID for iOS
    android: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ad unit ID for Android
  }),
};

/**
 * Get the appropriate banner ad unit ID based on environment
 * Returns test ID in development, production ID in production
 */
export const getAdUnitId = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production banner ad unit IDs
    const productionId = Platform.select({
      ios: 'ca-app-pub-1356030142961879/1403164312',
      android: 'ca-app-pub-1356030142961879/1403164312',
      default: 'ca-app-pub-1356030142961879/1403164312',
    }) || 'ca-app-pub-1356030142961879/1403164312';
    
    console.log('🚀 Using PRODUCTION ad unit ID:', productionId);
    return productionId;
  } else {
    // Development/Test banner ad unit ID
    const testId = 'ca-app-pub-3940256099942544/6300978111';
    console.log('🧪 Using DEVELOPMENT/TEST ad unit ID:', testId);
    return testId;
  }
};

// Global AdMob initialization flag
let isAdMobInitialized = false;

/**
 * Initialize AdMob with permissions and test device
 * TODO: Replace with react-native-google-mobile-ads initialization
 */
export const initializeAdMob = async (): Promise<boolean> => {
  if (isAdMobInitialized) {
    return true;
  }

  try {
    // TODO: Replace with react-native-google-mobile-ads APIs
    /*
    // Request permissions (required for iOS 14+)
    const { status } = await requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Ad tracking permission denied');
    }

    // Set test device ID for development
    await setTestDeviceIDAsync('EMULATOR');
    */
    
    console.log('⚠️ AdMob initialization disabled - waiting for react-native-google-mobile-ads migration');
    console.log('📱 DEVICE TESTING SETUP:');
    console.log('Current test device: "EMULATOR" (works for simulators)');
    console.log('For real device testing:');
    console.log('1. Run the app on your physical device');
    console.log('2. Look for AdMob debug output in console containing your device hash');
    console.log('3. Update setTestDeviceIDAsync("YOUR_DEVICE_HASH") in app/_layout.tsx');
    console.log('4. Restart the app to see test ads on your device');
    
    isAdMobInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing AdMob:', error);
    return false;
  }
};

/**
 * Setup and load interstitial ad
 * TODO: Replace with react-native-google-mobile-ads
 */
export const setupInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      console.log('⚠️ Interstitial ads disabled - waiting for react-native-google-mobile-ads migration');
      resolve(false);
      
      // TODO: Replace with react-native-google-mobile-ads APIs
      /*
      // Clear any existing event listeners
      AdMobInterstitial.removeAllListeners();

      // Set up event listeners
      AdMobInterstitial.addEventListener('interstitialDidLoad', () => {
        console.log('Interstitial ad loaded');
        resolve(true);
      });

      AdMobInterstitial.addEventListener('interstitialDidFailToLoad', (error) => {
        console.error('Interstitial ad failed to load:', error);
        resolve(false);
      });

      AdMobInterstitial.addEventListener('interstitialDidOpen', () => {
        console.log('Interstitial ad opened');
      });

      AdMobInterstitial.addEventListener('interstitialDidClose', () => {
        console.log('Interstitial ad closed');
        // Preload the next interstitial ad
        loadInterstitialAd();
      });

      // Load the first interstitial ad
      loadInterstitialAd();
      */
    } catch (error) {
      console.error('Error setting up interstitial ad:', error);
      resolve(false);
    }
  });
};

/**
 * Load interstitial ad
 * TODO: Replace with react-native-google-mobile-ads
 */
export const loadInterstitialAd = async (): Promise<void> => {
  try {
    console.log('⚠️ Interstitial ad loading disabled - waiting for react-native-google-mobile-ads migration');
    
    // TODO: Replace with react-native-google-mobile-ads APIs
    /*
    if (AD_UNIT_IDS.interstitial) {
      await AdMobInterstitial.setAdUnitID(AD_UNIT_IDS.interstitial);
      await AdMobInterstitial.requestAdAsync();
    }
    */
  } catch (error) {
    console.error('Error loading interstitial ad:', error);
  }
};

/**
 * Show interstitial ad if loaded
 * TODO: Replace with react-native-google-mobile-ads
 */
export const showInterstitialAd = async (): Promise<boolean> => {
  try {
    console.log('⚠️ Interstitial ad showing disabled - waiting for react-native-google-mobile-ads migration');
    return false;
    
    // TODO: Replace with react-native-google-mobile-ads APIs
    /*
    const isReady = await AdMobInterstitial.getIsReadyAsync();
    if (isReady) {
      await AdMobInterstitial.showAdAsync();
      return true;
    } else {
      console.log('Interstitial ad not ready');
      return false;
    }
    */
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    return false;
  }
};

/**
 * AdMob Manager Hook
 */
export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);

  useEffect(() => {
    const initAds = async () => {
      const success = await initializeAdMob();
      setIsInitialized(success);
      
      if (success) {
        const interstitialSuccess = await setupInterstitialAd();
        setInterstitialReady(interstitialSuccess);
      }
    };

    initAds();
  }, []);

  const showInterstitial = async () => {
    if (!interstitialReady) {
      console.log('Interstitial ad not ready');
      return false;
    }

    const success = await showInterstitialAd();
    if (success) {
      setInterstitialReady(false); // Will be reset when new ad loads
    }
    return success;
  };

  return {
    isInitialized,
    interstitialReady,
    showInterstitial,
  };
};