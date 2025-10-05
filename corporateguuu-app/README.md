# Dare Social 👋

Dare Social is a cross-platform mobile app built with React Native and Expo, empowering users to create, accept, and complete social dares for fun, fame, and rewards. Compete on leaderboards, earn virtual stones, and challenge friends in increasingly outrageous challenges!

This is a post-MVP advanced app project with core features implemented, including Firebase backend integration for real-time updates, Twitter/X OAuth authentication, and comprehensive challenge management system.

## Features

- **Create Dares**: Users can create custom dare challenges with rewards and descriptions.
- **Challenge Types**: Support for stones challenges, payout punishments, and general group challenges.
- **Leaderboard**: Real-time global ranking based on stones balance.
- **Voting System**: Community voting on dare completions.
- **Authentication**: Twitter OAuth integration for social sign-in.
- **Rewards System**: Earn and spend virtual stones for challenges.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Testing

This project includes Jest setup for unit and integration testing.

### Running Tests

```bash
npm test
```

### Running Linting

```bash
npm run lint
```

## Deployment

Using Expo Application Services (EAS) for building and distributing the app.

### Prerequisites

1. Install EAS CLI globally: `npm install -g @expo/eas-cli`
2. Login to your Expo account: `eas login`

### Building for Production

- Build for all platforms: `eas build --platform all`
- Android only: `eas build --platform android`
- iOS only: `eas build --platform ios`

See `eas.json` for build profiles and environment configurations.

### Submitting to App Stores

After building, submit to Google Play and App Store using:

```bash
eas submit --platform android
eas submit --platform ios
```

For more information, refer to [EAS Build documentation](https://docs.expo.dev/build/introduction/).

## API References

### Firebase Collections

- **users**: User profiles with stoneBalance, rankings, etc.
- **dares**: Available dares for completion.
- **challenges**: User-created challenges.
- **votes**: Votes on dare completions.

### Key Hooks

- `useDares()`: Fetches available dares.
- `useLeaderboard()`: Fetches leaderboard data.
- `useRealtimeLeaderboard()`: Real-time leaderboard subscription.
- `useAuth()`: Authentication state.

Refer to source code in `src/hooks/` and `corporateguuu-app/src/` for implementation details.

## Authentication Setup

### Twitter/X OAuth 2.0 Setup

1. Create a Twitter Developer Account at [https://developer.twitter.com](https://developer.twitter.com)
2. Create a new app/project in the Twitter Developer Portal
3. Configure OAuth 2.0 settings:
   - **App permissions**: Read access (or write as needed)
   - **OAuth 2.0 settings**: Enable OAuth 2.0
   - **Type of App**: Native app
   - **Callback URLs / Redirect URLs**:

     ```text
     https://auth.expo.io/@yourusername/corporateguuu-app
     corporateguuuapp://auth
     corporationtabapp://redirect
     ```

     Replace `@yourusername` with your actual Expo username
   - **Website URL**: Your app's website or a placeholder
4. Note your **Client ID** (public) - you'll add this to your environment variables

### Firebase Console Configuration

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication service and configure your sign-in methods
3. Add the following redirect URIs in Firebase Console:

   **Authentication** → **Sign-in method** → **OAuth redirect domains**

   - **For Expo Go development:**

     ```text
     https://auth.expo.io/@yourusername/corporateguuu-app
     ```

     Replace `@yourusername` with your Expo account username.

   - **For custom builds:**

     ```text
     corporateguuuapp://redirect
     ```

4. Copy your Firebase config from **Project Settings** → **General** → **Your apps** → **SDK setup & config**

### Twitter API Functions

The app includes these Twitter API integration functions:

```javascript
import {
  completeTwitterAuth,
  fetchTwitterUserByUsername,
  refreshTwitterToken,
  ensureValidAccessToken
} from '@/src/lib/twitter';

// Complete OAuth flow
const result = await completeTwitterAuth();

// Get user by username
const user = await fetchTwitterUserByUsername('username', accessToken);

// Refresh expired tokens
const newTokens = await refreshTwitterToken(refreshToken);

// Ensure valid access token (auto-refresh if needed)
const validTokens = await ensureValidAccessToken();
```

### Environment Variables

Create a `.env.local` file in the project root with your authentication configuration:

```env
# Twitter OAuth 2.0 Configuration
TWITTER_CLIENT_ID=your_twitter_client_id_here

# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### EAS Build Configuration

For EAS production builds, update the package/bundle identifiers and redirect URIs:

1. Update `eas.json` with your actual package/bundle IDs:
   - Android: Replace `com.yourcompany.corporateguuuapp` with your desired Android package name
   - iOS: Replace `com.yourcompany.corporateguuuapp` with your desired bundle identifier

2. In Firebase Console, add the custom build redirect URI:

   ```bash
   corporateguuuapp://redirect
   ```

The app uses anonymous authentication by default with Firebase Auth and supports both Expo Go development and custom EAS builds.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
