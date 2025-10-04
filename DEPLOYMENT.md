# Ditch App - Mobile Deployment Guide

## Prerequisites

Before deploying to iOS or Android, ensure you have:

### For iOS:
- macOS with Xcode 14+ installed
- Apple Developer Account ($99/year)
- CocoaPods installed: `sudo gem install cocoapods`

### For Android:
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 17+

### General:
- Node.js 18+ and npm installed
- Capacitor dependencies installed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Initialize Capacitor (First Time Only)

The project is already configured with `capacitor.config.ts`. If needed:

```bash
npm run capacitor:init
```

### 4. Add Mobile Platforms

#### For iOS:
```bash
npm run capacitor:add:ios
```

#### For Android:
```bash
npm run capacitor:add:android
```

### 5. Sync Web Assets to Native Projects

After any web code changes:

```bash
npm run mobile:build
```

Or manually:
```bash
npm run build
npm run capacitor:sync
```

## iOS Deployment

### 1. Open in Xcode

```bash
npm run capacitor:open:ios
```

### 2. Configure App Settings

In Xcode:
- Select the project in the navigator
- Update **Bundle Identifier**: `com.ditch.app` (or your custom domain)
- Select your **Development Team**
- Update **Display Name**: `Ditch`
- Configure **Version** and **Build** numbers

### 3. Configure App Icons and Splash Screen

- Add app icons to: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Icon sizes needed: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024 (all @1x, @2x, @3x)
- Splash screen is configured via Capacitor config

### 4. Configure Capabilities

In Xcode > Signing & Capabilities:
- Enable **Push Notifications** (if needed)
- Configure **Background Modes** (if needed)

### 5. Build and Test

- Select a simulator or connected device
- Click the Play button or press `Cmd + R`
- Test all features thoroughly

### 6. Submit to App Store

1. Archive the app: Product > Archive
2. Validate the archive
3. Upload to App Store Connect
4. Fill in app metadata, screenshots, and descriptions
5. Submit for review

## Android Deployment

### 1. Open in Android Studio

```bash
npm run capacitor:open:android
```

### 2. Configure App Settings

In `android/app/build.gradle`:
- Update `applicationId`: `com.ditch.app`
- Update `versionCode` and `versionName`
- Update `compileSdk` and `targetSdk` if needed

In `android/app/src/main/res/values/strings.xml`:
- Update `<string name="app_name">Ditch</string>`

### 3. Configure App Icons

Replace default icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

Icon sizes needed:
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

### 4. Generate Signing Key

```bash
keytool -genkey -v -keystore ditch-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ditch
```

Store the keystore file securely and remember the passwords.

### 5. Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=ditch
storeFile=../ditch-release-key.jks
```

### 6. Build Release APK/AAB

In Android Studio:
- Build > Generate Signed Bundle / APK
- Select Android App Bundle (AAB) for Play Store
- Select your keystore and enter passwords
- Choose release build variant

Or via command line:
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 7. Test the Release Build

```bash
cd android
./gradlew installRelease
```

### 8. Submit to Google Play

1. Create a Google Play Developer account ($25 one-time fee)
2. Go to Google Play Console
3. Create a new app
4. Upload the AAB file
5. Fill in store listing, screenshots, and content rating
6. Submit for review

## Environment Variables for Mobile

Ensure your `.env` file is properly configured:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_SUBSCRIPTION_PLAN_ID=your_plan_id
```

Note: Vite exposes only variables prefixed with `VITE_` to the client.

## Payment Integration (Square)

The app uses Square for payment processing. Required environment variables:

### Edge Function Environment Variables:
- `SQUARE_ACCESS_TOKEN`: Your Square access token
- `SQUARE_LOCATION_ID`: Your Square location ID
- `SQUARE_SUBSCRIPTION_PLAN_ID`: Your subscription plan ID
- `SQUARE_WEBHOOK_SIGNATURE_KEY`: For webhook verification

### Setup Square:
1. Create a Square developer account
2. Create an application
3. Get your access token from the dashboard
4. Create a subscription plan
5. Configure webhook endpoints

## Updating the App

When you make changes to the web code:

```bash
npm run mobile:build
```

Then rebuild in Xcode or Android Studio.

## Common Issues

### iOS Build Fails
- Run `pod install` in the `ios/App` directory
- Clean build folder: Product > Clean Build Folder
- Update Xcode if needed

### Android Build Fails
- Sync Gradle files
- Invalidate caches: File > Invalidate Caches / Restart
- Update Android Studio and SDK tools

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Rebuild the web app: `npm run build`
- Sync with native projects: `npm run capacitor:sync`

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Google Play Guidelines](https://play.google.com/about/developer-content-policy/)
- [Square Payments API](https://developer.squareup.com/docs/payments-api/overview)
