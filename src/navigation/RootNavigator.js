import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AchievementsScreen from '../screens/AchievementsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ChatScreen from '../screens/ChatScreen';
import CompleteDareScreen from '../screens/CompleteDareScreen';
import Create_Challenge_Home from '../screens/CreateChallengeScreen';
import CreateChallengeFormScreen from '../screens/CreateChallengeFormScreen';
import DareDetailsScreen from '../screens/DareDetailsScreen';
import Frame_Market from '../screens/FrameMarketScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import Current_User_Account from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import TrackerScreen from '../screens/TrackerScreen';
import VoteScreen from '../screens/VoteScreen';
import WinnerScreen from '../screens/WinnerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeFeed') {
            return <MaterialIcons name="camera" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Create_Challenge_Home') {
            return <MaterialIcons name="enhanced-encryption" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Profile') {
            return <MaterialIcons name="person" size={size ?? 20} color={color ?? "#333"} />;
          }
          if (route.name === 'Search') {
            return <Ionicons name="search" size={size ?? 20} color={color ?? "#333"} />;
          }
          const map = {
            Leaderboard: "trophy-outline",
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
      <Tab.Screen name="HomeFeed" component={HomeFeedScreen} options={{ tabBarLabel: "feed" }} />
      <Tab.Screen name="Create_Challenge_Home" component={Create_Challenge_Home} options={{ tabBarLabel: "Create" }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: "Ranks" }} />
      <Tab.Screen name="Profile" component={Current_User_Account} options={{ tabBarLabel: "Profile" }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: "Search" }} />
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
      <Stack.Screen name="CreateChallenge" component={Create_Challenge_Home} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="VoteScreen" component={VoteScreen} />
      <Stack.Screen name="Frame_Market" component={Frame_Market} />
      <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} />
      <Stack.Screen name="WinnerScreen" component={WinnerScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="CreateChallengeForm" component={CreateChallengeFormScreen} />
      <Stack.Screen name="Tracker" component={TrackerScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
