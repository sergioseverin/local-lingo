# /run - Start Development Server

Start the Expo development server for testing the app on emulator.

## Steps

1. Navigate to project directory
2. Start Expo development server
3. Inform user to press 'a' for Android or 'i' for iOS

## Commands

```bash
cd "/Users/sergioseverin/Google Drive/Projects/local-lingo"
npx expo start
```

Run this as a background process so the terminal remains interactive.

## User Action

Tell the user: "Expo is running. Press 'a' to open Android emulator or 'i' for iOS simulator."

## Notes

- This starts the Metro bundler for development
- User can press 'a' for Android, 'i' for iOS, or 'w' for web
- To stop: Use Ctrl+C in the terminal or pkill the process
