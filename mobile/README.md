# EaseInventory Mobile App

React Native mobile app for EaseInventory, built with Expo.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio/Emulator

## Getting Started

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
# or
expo start
```

3. Run on device/simulator:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (tabs)/            # Main app tabs (dashboard, inventory, etc.)
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point with auth redirect
├── components/            # Reusable components
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication state (Zustand)
│   └── api.ts            # API client
├── hooks/                 # Custom React hooks
├── assets/               # Images, fonts
├── app.json              # Expo config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Features

- **Authentication**: Credentials + Biometrics (Face ID/Touch ID)
- **Barcode Scanner**: Scan products using device camera
- **Offline Support**: SQLite local database (TODO)
- **Push Notifications**: Expo Notifications (TODO)
- **Deep Linking**: Universal links for web↔app navigation

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

### Local Build

```bash
# iOS (requires Mac + Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android
```

## Environment Variables

Configure in `app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://easeinventory.com/api"
    }
  }
}
```

## Contributing

See main project README for contribution guidelines.
