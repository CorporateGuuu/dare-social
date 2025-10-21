import Icon from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { View } from 'react-native';

// Screens
import AchievementScreen from '../screens/AchievementScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ActivityFeedScreen from '../screens/ActivityFeedScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import CompleteDareScreen from '../screens/CompleteDareScreen';
import CreateChallengeFormScreen from '../screens/CreateChallengeFormScreen';
import Create_Challenge_Home from '../screens/CreateChallengeScreen';
import DareDetailsScreen from '../screens/DareDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import Frame_Market from '../screens/FrameMarketScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import PostsScreen from '../screens/PostsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralScreen from '../screens/ReferralScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import TrackerScreen from '../screens/TrackerScreen';
import VoteScreen from '../screens/VoteScreen';
import WalletScreen from '../screens/WalletScreen';
import WinnerScreen from '../screens/WinnerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create header component
function HeaderRight() {
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 10 }}>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <MaterialIcons name="home" size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Challenges') {
            return <MaterialIcons name="whatshot" size={size ?? 20} color={color ?? "#cccccc"} />;
          }
          if (route.name === 'Frames') {
            return <MaterialIcons name="filter-frames" size={size ?? 20} color={color ?? "#cccccc"} />;
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
      <Tab.Screen name="Home" component={ActivityFeedScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ tabBarLabel: "Challenges" }} />
      <Tab.Screen name="Frames" component={Frame_Market} options={{ tabBarLabel: "Frames" }} />
      <Tab.Screen name="Messages" component={ChatListScreen} options={{ tabBarLabel: "Messages" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  );
}

const RootNavigator = ({ user, isLoading }) => {
  if (isLoading) {
    return null;
  }

  console.log("User:", user, "isLoading:", isLoading)
  console.log(user ? "Main" : "LoginScreen")
  return (
    <Stack.Navigator initialRouteName={user ? "Main" : "LoginScreen"}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff', headerTitle: '' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: true, headerRight: HeaderRight }} />
      <Stack.Screen name="DareDetails" component={DareDetailsScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="CompleteDare" component={CompleteDareScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="CreateChallenge" component={Create_Challenge_Home} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="VoteScreen" component={VoteScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Frame_Market" component={Frame_Market} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="AchievementScreen" component={AchievementScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="WinnerScreen" component={WinnerScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateChallengeForm" component={CreateChallengeFormScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Tracker" component={TrackerScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Posts" component={PostsScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Referrals" component={ReferralScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Privacy" component={PrivacySecurityScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="Help" component={HelpSupportScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="MyDares" component={PlaceholderScreen} options={{ headerShown: true, headerRight: HeaderRight, headerStyle: { backgroundColor: '#000000' }, headerTintColor: '#ffffff' }} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
