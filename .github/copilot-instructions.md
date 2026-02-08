# Local Lingo - GitHub Copilot Instructions

## Project Overview
Local Lingo is a React Native mobile app built with Expo SDK 54 that combines language learning with interactive maps. The app allows users to translate text to multiple European languages, hear pronunciations via text-to-speech, and interact with an SVG-based map of Europe.

## Technology Stack
- **Framework**: React Native with Expo SDK 54.0.0
- **Language**: TypeScript
- **Key Libraries**:
  - `react-native-svg` (15.12.1) - Vector graphics for interactive Europe map
  - `expo-speech` (14.0.7) - Text-to-speech functionality
  - `expo-ads-admob` (13.0.0) - Advertisement integration
- **APIs**: Google Cloud Translation API for real-time translation
- **Monetization**: AdMob banner and interstitial ads

## User Intent History & Key Features

### 1. GitHub Repository Setup
**Original Request**: "help me create a new ripo in github"
- Created GitHub repository for local-lingo project
- Set up proper project structure and version control

### 2. Core Package Installation
**Original Request**: "install react-native-svg, expo-speech, expo-ads-admob"
- Installed essential packages for SVG graphics, speech synthesis, and advertisements
- Configured project dependencies for cross-platform compatibility

### 3. Interactive Map Development
**Original Request**: "create a React Native component that uses react-native-svg to load and display the map"
- Built interactive SVG-based Europe map with clickable countries
- Implemented 12 European countries with custom SVG paths and coordinates
- Added visual feedback for country selection and hover states

### 4. Speech Integration
**Original Request**: "add a function called speak(text, langCode) that uses expo-speech"
- Integrated text-to-speech functionality with multiple language support
- Created speech utilities that work with country-specific language codes
- Implemented speech feedback when users tap countries on the map

### 5. AdMob Advertisement Integration
**Original Request**: "Integrate AdMob ads using expo-ads-admob. Show a banner ad at the bottom of the app screen. Also show an interstitial ad when the user presses the 'Translate' button."
- Configured AdMob with app ID: `ca-app-pub-1356030142961879~9940129888`
- Added banner ad unit ID: `ca-app-pub-1356030142961879/1403164312` (currently commented for testing)
- Implemented banner ads at bottom of screens
- Added interstitial ads before translation operations
- Created reusable ad components and utility functions

### 7. SimpleMaps Europe SVG Integration
**Original Request**: "Replace the current map with the SimpleMaps Europe SVG. Download the file from SimpleMaps and place it in assets/maps/europe.svg. Write a React Native component called EuropeMap. - Use react-native-svg to import the SVG. - Ensure each country path has an `id` attribute matching the ISO 3166-1 alpha-2 country code (e.g., "FR", "DE"). - Export <EuropeMap onCountryPress={(countryCode)=>{…}} labels={labelsMap} /> where labelsMap is { countryCode: translatedWord }. - Fit the SVG to full width, preserve aspect ratio. - Make each country region selectable (Touchable) so you can capture taps for pronunciation."
- Created comprehensive Europe SVG with proper ISO 3166-1 alpha-2 country codes
- Built new EuropeMap component with 29 European countries
- Implemented proper aspect ratio preservation and responsive design
- Added translation overlay support with labels prop
- Created country selection with visual feedback and hover states
- Updated both TranslationMapScreen and demo to use new standardized map
**Original Request**: "Create a simple React Native screen layout: - A text input with placeholder 'Enter word' at the top - A button labeled 'Translate' - Below it, render the Europe map (full width/height) - Overlay translated words when available - Make it look clean and responsive."
- Built `TranslationMapScreen` component with clean, responsive design
- Implemented text input with translate button at top
- Full-screen Europe map below with translation overlays
- Real-time translation results displayed on country labels
- Responsive design that works across different screen sizes

## File Structure & Components

### Core Components
- `components/TranslationMapScreen.tsx` - Main clean translation interface
- `components/FullScreenEuropeMap.tsx` - Interactive full-screen map modal
- `components/TranslationDemo.tsx` - Comprehensive translation testing interface
- `components/SpeechDemo.tsx` - Speech functionality demonstration
- `components/BannerAd.tsx` - Reusable AdMob banner ad components
- `components/AppWrapper.tsx` - App-wide wrapper with bottom banner ads

### Utility Functions
- `utils/googleTranslate.ts` - Google Translate API integration and speech functions
- `utils/adMobUtils.ts` - AdMob initialization and management utilities

### Tab Navigation
- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/map.tsx` - Clean translation map interface
- `app/(tabs)/demo.tsx` - Comprehensive feature demonstration
- `app/(tabs)/explore.tsx` - App information and examples

## Key Configuration

### Environment Variables
```
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### AdMob Configuration (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-1356030142961879~9940129888",
          "iosAppId": "ca-app-pub-1356030142961879~9940129888"
        }
      ]
    ]
  }
}
```

### Supported Languages & Countries
- **Countries**: Spain (ES), France (FR), Germany (DE), Italy (IT), United Kingdom (GB), Poland (PL), Netherlands (NL), Portugal (PT), Greece (GR), Sweden (SE), Norway (NO), Austria (AT), Switzerland (CH), Belgium (BE), Czech Republic (CZ), Denmark (DK), Finland (FI), Hungary (HU), Ireland (IE), Romania (RO), Slovakia (SK), Slovenia (SI), Croatia (HR), Bulgaria (BG), Serbia (RS), Bosnia and Herzegovina (BA), Lithuania (LT), Latvia (LV), Estonia (EE)
- **Languages**: Spanish (es), French (fr), German (de), Italian (it), English (en), Polish (pl), Dutch (nl), Portuguese (pt), Greek (el), Swedish (sv), Norwegian (no), Czech (cs), Danish (da), Finnish (fi), Hungarian (hu), Romanian (ro), Slovak (sk), Slovenian (sl), Croatian (hr), Bulgarian (bg), Serbian (sr), Bosnian (bs), Lithuanian (lt), Latvian (lv), Estonian (et)
- **ISO Codes**: All countries use proper ISO 3166-1 alpha-2 country codes for consistency

## Design Principles

### UI/UX Guidelines
- **Clean & Responsive**: All interfaces should be clean, intuitive, and work across different screen sizes
- **Color-Coded Feedback**: Use consistent color schemes for different states (selected, translated, etc.)
- **Typography**: Clear, readable fonts with proper hierarchy
- **Accessibility**: Support for screen readers and touch accessibility

### Code Standards
- **TypeScript**: Strict typing for all components and utilities
- **Error Handling**: Comprehensive error handling for API calls and user interactions
- **Performance**: Optimized for smooth interactions and fast loading
- **Modularity**: Reusable components and utility functions

## Monetization Strategy
- **Banner Ads**: Fixed bottom banner ads on all screens
- **Interstitial Ads**: Strategic placement before translation operations
- **Test Mode**: Currently using test ad unit IDs for development
- **Production Ready**: Real ad unit IDs ready for deployment (commented in code)

## Future Enhancement Areas
1. **Additional Languages**: Expand beyond European languages
2. **Offline Mode**: Cache translations for offline use
3. **User Accounts**: Save favorite translations and learning progress
4. **Gamification**: Add language learning challenges and achievements
5. **Advanced Maps**: More detailed geographical representations

## Development Notes
- Always use absolute file paths when working with this project
- Test AdMob functionality on physical devices (ads don't show in simulator)
- Ensure Google Translate API key is configured before testing translation features
- Use TypeScript strict mode for all new code
- Follow React Native best practices for performance optimization

### Production Build Requirements
- **Always use local Gradle builds** for production (not EAS builds due to plan limits)
- **Version management is critical**: Update app.json, package.json, AND build.gradle
- **Version codes must increment**: Google Play rejects duplicate version codes
- **Keystore signing**: Production keystore automatically applied via build.gradle
- **Build troubleshooting**: If react-native-reanimated fails, use `npx expo run:android --variant release`
- **File size**: Expect ~80MB AAB for production builds with all assets
- **Large file exclusions**: Marketing videos and build artifacts excluded from git

### Deployment Checklist
1. Increment version in all three files
2. Clean build: `./gradlew clean`
3. Build AAB: `./gradlew bundleRelease`
4. Verify version in manifest
5. Check keystore signature
6. Upload to Google Play Console

## Common Commands
```bash
# Development
npx expo start
npx expo start --web
npx tsc --noEmit

# Production Build (LOCAL GRADLE - REQUIRED)
cd android && ./gradlew clean
cd android && ./gradlew bundleRelease

# Alternative if gradle fails
npx expo run:android --variant release --no-build-cache

# Verify build
ls -la android/app/build/outputs/bundle/release/
keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab

# Production Build Automation
# Use: /make-prod-build (see docs/prompts/make-prod-build.md)
```

## Critical Production Information
- **Current Production Version**: 1.1.0 (Version Code: 22)
- **Keystore SHA1**: 04:D9:81:D0:DB:7C:81:7C:68:27:7D:F9:DB:CF:20:B6:84:12:FA:4C
- **Google Play Package**: com.anonymous.locallingo
- **AdMob App ID**: ca-app-pub-1356030142961879~9940129888
- **TikTok App ID**: 7604098905004867601
- **Build Output**: android/app/build/outputs/bundle/release/app-release.aab (~80MB)