import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import ChallengesScreen from "./src/screens/ChallengesScreen";
import CreateChallengeFormScreen from "./src/screens/CreateChallengeFormScreen";
import LoginScreen from "./src/screens/LoginScreen";
// Import other screens: AchievementsScreen, ChallengesScreen, etc.

const Stack = createStackNavigator();

// Define notification categories and actions for interactive notifications
const notificationCategories = [
  {
    identifier: 'VOTING_ALERT',
    actions: [
      {
        identifier: 'ACCEPT_VOTE',
        title: 'Accept Vote',
        buttonTitle: 'Accept',
        options: { isAuthenticationRequired: false }
      },
      {
        identifier: 'VIEW_CHALLENGE',
        title: 'View Challenge',
        options: { isAuthenticationRequired: false }
      },
    ],
    options: {
      allowInCarPlay: true,
      allowAnnouncement: true,
    },
  },
  {
    identifier: 'CHALLENGE_RESULT',
    actions: [
      {
        identifier: 'VIEW_WINNER',
        title: 'View Winner',
        options: { isAuthenticationRequired: false }
      },
      {
        identifier: 'CREATE_NEW',
        title: 'Create New Challenge',
        options: { isAuthenticationRequired: false }
      },
    ],
    options: {
      allowInCarPlay: true,
      allowAnnouncement: true,
    },
  },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register notification categories on app start
Notifications.setNotificationCategoryAsync('VOTING_ALERT', notificationCategories[0]);
Notifications.setNotificationCategoryAsync('CHALLENGE_RESULT', notificationCategories[1]);

function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      console.log('Push Token:', token);
      // Send token to backend (mock)
      // firebase.firestore().collection('users').doc(user.id).update({ pushToken: token });
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Update UI (e.g., badge)
    });

    // Handle notification taps and actions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification, actionIdentifier } = response;
      const { data } = notification.request.content;

      console.log('Notification response:', { actionIdentifier, data });

      // Handle different actions
      if (actionIdentifier === 'ACCEPT_VOTE') {
        console.log('User accepted the vote from notification');
        // Handle vote acceptance (could automatically vote yes or open voting modal)
        // navigation.navigate('Challenges', { focusChallenge: data.dareId });
      } else if (actionIdentifier === 'VIEW_CHALLENGE') {
        console.log('User wants to view challenge from notification');
        // navigation.navigate('Challenges', { focusChallenge: data.dareId });
      } else if (actionIdentifier === 'VIEW_WINNER') {
        console.log('User wants to view winner from notification');
        // navigation.navigate('Challenges', { focusChallenge: data.dareId, showWinner: true });
      } else if (actionIdentifier === 'CREATE_NEW') {
        console.log('User wants to create new challenge from notification');
        // navigation.navigate('CreateChallengeForm');
      } else {
        // Default tap - navigate to Challenges screen
        // navigation.navigate('Challenges');
        console.log('Notification tapped - navigate to challenges');
      }
    });

    return () => {
      // Cleanup not needed - Expo notifications auto-cleanup subscriptions
      // Modern versions handle cleanup automatically
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user, isLoading }) => {
          if (isLoading) return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Loading...</Text>
            </View>
          );

          return (
            <NavigationContainer>
              <Stack.Navigator>
                {user ? (
                  <>
                    <Stack.Screen name="Achievements" component={AchievementsScreen} />
                    <Stack.Screen name="Challenges" component={ChallengesScreen} />
                    <Stack.Screen name="CreateChallengeForm" component={CreateChallengeFormScreen} />
                    {/* Add other screens */}
                  </>
                ) : (
                  <Stack.Screen name="Login" component={LoginScreen} />
                )}
              </Stack.Navigator>
            </NavigationContainer>
          );
        }}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}

export default App;
