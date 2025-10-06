import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ChallengesScreen from '../screens/ChallengesScreen';
import CompleteDareScreen from '../screens/CompleteDareScreen';
import Create_Challenge_Home from '../screens/CreateChallengeScreen';
import DareDetailsScreen from '../screens/DareDetailsScreen';
import Frame_Market from '../screens/FrameMarketScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import Current_User_Account from '../screens/ProfileScreen';
import TrackerScreen from '../screens/TrackerScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Frames') {
            return <MaterialIcons name="document-scanner" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'HomeFeed') {
            return <MaterialIcons name="camera" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Tracker') {
            return <MaterialIcons name="tune" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Create_Challenge_Home') {
            return <MaterialIcons name="enhanced-encryption" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Profile') {
            return <MaterialIcons name="person" size={size ?? 20} color={color ?? "#333"} />;
          }
          const map = {
            Leaderboard: "trophy-outline",
            Wallet: "wallet-outline",
          };
          const iconName = map[route.name];
          if (iconName) {
            return <Ionicons name={iconName} size={size ?? 20} color={color ?? "#333"} />;
          }
          // Fallback icon for undefined routes
          return <MaterialIcons name="help" size={size ?? 20} color={color ?? "#333"} />;
        },
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",
      })}
    >
      <Tab.Screen name="Frames" component={Frame_Market} options={{ tabBarLabel: "Frames" }} />
      <Tab.Screen name="HomeFeed" component={HomeFeedScreen} options={{ tabBarLabel: "feed" }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: "Ranks" }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ tabBarLabel: "Wallet" }} />
      <Tab.Screen name="Tracker" component={TrackerScreen} options={{ tabBarLabel: "Tracker" }} />
      <Tab.Screen name="Profile" component={Current_User_Account} options={{ tabBarLabel: "Profile" }} />
      <Tab.Screen name="Create_Challenge_Home" component={Create_Challenge_Home} options={{ tabBarLabel: "Create" }} />
    </Tab.Navigator>
  );
}

const RootNavigator = ({ user }) => {
  return (
    <Stack.Navigator initialRouteName={user ? "Main" : "Onboarding"}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DareDetails" component={DareDetailsScreen} />
      <Stack.Screen name="CompleteDare" component={CompleteDareScreen} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
