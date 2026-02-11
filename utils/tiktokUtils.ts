import { initializeSdk, TikTokEventName, trackCustomEvent, trackEvent } from 'react-native-tiktok-business-sdk';

const TIKTOK_APP_ID = '7604098905004867601';

// Global TikTok initialization flag
let isTikTokInitialized = false;

/**
 * Initialize TikTok Business SDK
 */
export const initializeTikTok = async (): Promise<boolean> => {
  if (isTikTokInitialized) {
    return true;
  }

  try {
    // initializeSdk(appId, ttAppId, accessToken, debug)
    await initializeSdk(TIKTOK_APP_ID, TIKTOK_APP_ID, '', false);
    
    console.log('✅ TikTok Business SDK initialized successfully');
    console.log('📱 TikTok App ID:', TIKTOK_APP_ID);
    
    isTikTokInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize TikTok Business SDK:', error);
    return false;
  }
};

/**
 * Track app installation event
 */
export const trackInstall = async () => {
  try {
    await trackEvent(TikTokEventName.APP_INSTALL);
    console.log('✅ TikTok: InstallApp event tracked');
  } catch (error) {
    console.error('❌ TikTok: Failed to track InstallApp event:', error);
  }
};

/**
 * Track app launch event
 */
export const trackLaunch = async () => {
  try {
    await trackEvent(TikTokEventName.LAUNCH_APP);
    console.log('✅ TikTok: LaunchApp event tracked');
  } catch (error) {
    console.error('❌ TikTok: Failed to track LaunchApp event:', error);
  }
};

/**
 * Track translation event (custom event)
 */
export const trackTranslation = async (word: string, languagesCount: number) => {
  try {
    await trackCustomEvent('Translation', {
      word,
      languages_count: languagesCount,
    });
    console.log(`✅ TikTok: Translation event tracked - ${word} (${languagesCount} languages)`);
  } catch (error) {
    console.error('❌ TikTok: Failed to track Translation event:', error);
  }
};

/**
 * Track ad click event
 */
export const trackAdClick = async () => {
  try {
    await trackCustomEvent('AdClick', {
      button_name: 'ad_click',
    });
    console.log('✅ TikTok: Ad click event tracked');
  } catch (error) {
    console.error('❌ TikTok: Failed to track ad click event:', error);
  }
};
