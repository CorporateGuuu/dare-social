import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect, useState } from 'react';
import { AppProvider } from "./src/context/AppContext";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, loading } = useContext(AuthContext)
  const [ isAppReady, setIsAppReady ] = useState(false);


  useEffect(() => {
      async function prepare() {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.warn(e);
        } finally {
          setIsAppReady(true);
          await SplashScreen.hideAsync();
        }
      }
      prepare();
    }, []
  )

  if (!isAppReady || loading) {
    return null;
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator user={user} isLoading={loading} />
      </NavigationContainer>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
