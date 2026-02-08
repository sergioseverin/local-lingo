# Production Build Generator

Use this prompt to create a new production AAB build ready for Google Play Store upload.

## Command: /make-prod-build

## Instructions

**Task**: Create a new production Android App Bundle (AAB) with incremented version numbers and production signing.

### Steps Required:

1. **Update Version Numbers** - Increment both version name and version code:
   - In `app.json`: Update `version` (semantic version) and `android.versionCode` (integer)
   - In `package.json`: Update `version` to match app.json
   - In `android/app/build.gradle`: Update `versionCode` and `versionName` in defaultConfig block

2. **Version Increment Rules**:
   - **Version Name**: Follow semantic versioning (e.g., 1.1.0 → 1.2.0 for minor updates, or 1.1.0 → 1.1.1 for patches)
   - **Version Code**: Always increment by 1 from current highest value (must be higher than any previous Google Play uploads)

3. **Build Production AAB**:
   - Clean previous builds: `cd android && ./gradlew clean`
   - Build signed release AAB: `cd android && ./gradlew bundleRelease`
   - Verify AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Verification Steps**:
   - Check AAB file size and timestamp
   - Verify version code in generated manifest: `android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml`
   - Confirm production signing certificate fingerprint matches: SHA1 `04:D9:81:D0:DB:7C:81:7C:68:27:7D:F9:DB:CF:20:B6:84:12:FA:4C`

### Current Version Tracking:
- **Last Production Version**: 1.1.0 (Version Code: 22)
- **Next Version Should Be**: 1.2.0 (Version Code: 23) or higher

### Files to Update:
- `/app.json` - Update `expo.version` and `expo.android.versionCode`
- `/package.json` - Update `version`
- `/android/app/build.gradle` - Update `versionCode` and `versionName` in defaultConfig

### Expected Output:
- New AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
- File size: ~80MB
- Ready for Google Play Console upload
- Signed with production keystore

### Notes:
- Always use local Gradle builds (`./gradlew bundleRelease`) instead of EAS builds
- The AAB will be signed automatically with the production keystore configured in build.gradle
- Ensure version code is always higher than any previously uploaded version to Google Play
- All three files (app.json, package.json, build.gradle) must have matching version information

### Usage Example:
```
/make-prod-build
```

**Expected Response**: Execute all version updates, build the AAB, verify signing, and provide the final file path for Google Play upload.