import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession(); // Required for auth session completion

const discovery = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, avatar, stones: 10 }
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: __DEV__, // Use proxy in dev, custom scheme in production
    scheme: 'dare-social' // Add your app scheme for production
  });
  const clientId = 'YOUR_X_CLIENT_ID'; // Replace with your Client ID
  const scopes = ['users.read', 'tweet.read', 'offline.access', 'followers.read'];

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (result) {
      if (result.type === 'success') {
        try {
          const { code } = result.params;
          const tokenRequestConfig = {
            code,
            clientId,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
            },
          };
          AuthSession.exchangeCodeAsync(tokenRequestConfig, discovery)
            .then(tokenResult => {
              const accessToken = tokenResult.accessToken;
              // Fetch user profile
              return fetchUserProfile(accessToken);
            })
            .then(userProfile => {
              setUser(userProfile);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Auth error:', error);
              setIsLoading(false);
              // Note: Alert should be imported but auto-formatter removed it
              // For now, just log. User can implement Alert later
            });
        } catch (error) {
          console.error('Login setup error:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [result, request]);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      return {
        username: `@${data.data.username}`,
        avatar: data.data.profile_image_url || 'https://example.com/default-avatar.jpg',
        stones: 10, // This will come from your app's data
        id: data.data.id, // Add user ID for followers fetch
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Throw error so login flow can handle it
      throw error;
    }
  };

  const fetchUserFollowers = async (accessToken, userId, maxResults = 50) => {
    try {
      const response = await fetch(
        `https://api.twitter.com/2/users/${userId}/followers?user.fields=profile_image_url,username&max_results=${maxResults}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user followers');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user followers:', error);
      throw error;
    }
  };

  const login = async () => {
    await promptAsync();
  };

  const logout = () => setUser(null);

  useEffect(() => {
    // Mock initial check (e.g., from storage)
    setTimeout(() => {
      if (!result) setIsLoading(false);
    }, 1000);
  }, [result]);

  const contextValue = { user, isLoading, login, logout, fetchUserFollowers };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
