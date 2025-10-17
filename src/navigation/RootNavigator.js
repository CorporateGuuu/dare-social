import Icon from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AchievementsScreen from '../screens/AchievementsScreen';
import ActivityFeedScreen from '../screens/ActivityFeedScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ChatListScreen from '../screens/ChatListScreen';
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
import PostsScreen from '../screens/PostsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralScreen from '../screens/ReferralScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import TrackerScreen from '../screens/TrackerScreen';
import VoteScreen from '../screens/VoteScreen';
import WalletScreen from '../screens/WalletScreen';
import WinnerScreen from '../screens/WinnerScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <MaterialIcons name="home" size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Posts') {
            return <Icon name={focused ? 'create' : 'create-outline'} size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Challenges') {
            return <MaterialIcons name="whatshot" size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Messages') {
            return <Icon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Profile') {
            return <Icon name={focused ? 'person' : 'person-outline'} size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          // Fallback icon for undefined routes
          return <MaterialIcons name="help" size={size ?? 20} color={color ?? "#cccccc"} />;
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Posts" component={PostsScreen} options={{ tabBarLabel: "Posts" }} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ tabBarLabel: "Challenges" }} />
      <Tab.Screen name="Messages" component={ChatListScreen} options={{ tabBarLabel: "Messages" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
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
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="VoteScreen" component={VoteScreen} />
      <Stack.Screen name="Frame_Market" component={Frame_Market} />
      <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} />
      <Stack.Screen name="WinnerScreen" component={WinnerScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CreateChallengeForm" component={CreateChallengeFormScreen} />
      <Stack.Screen name="Tracker" component={TrackerScreen} />
      <Stack.Screen name="Posts" component={PostsScreen} />
      <Stack.Screen name="Referrals" component={ReferralScreen} />
      <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacySecurityScreen} />
      <Stack.Screen name="Help" component={HelpSupportScreen} />
      <Stack.Screen name="MyDares" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
