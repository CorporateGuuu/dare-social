import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Now includes { ..., followers: [] }
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: __DEV__ });
  const clientId = 'YOUR_X_CLIENT_ID'; // Replace
  const scopes = ['users.read', 'tweet.read', 'offline.access', 'followers.read'];

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    { clientId, scopes, redirectUri, usePKCE: true },
    discovery
  );

  const login = async () => {
    await promptAsync();

    if (response?.type === 'success') {
      const { code } = response.params;
      const tokenRequestConfig = {
        code,
        clientId,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier },
      };
      const tokenResult = await AuthSession.exchangeCodeAsync(tokenRequestConfig, discovery);
      const accessToken = tokenResult.accessToken;

      // Fetch user profile and followers
      const userProfile = await fetchUserProfile(accessToken);
      setUser(userProfile);
    }
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      // Step 1: Get authenticated user's ID
      const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userData = await userRes.json();
      const userId = userData.data?.id;

      // Step 2: Fetch followers (first page, limited to 20)
      const followersRes = await fetch(
        `https://api.twitter.com/2/users/${userId}/followers?max_results=20&user.fields=username,profile_image_url,name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!followersRes.ok) throw new Error('Failed to fetch followers');
      const followersData = await followersRes.json();
      const followers = followersData.data || [];

      return {
        id: userId,
        username: `@${userData.data?.username}`,
        name: userData.data?.name,
        avatar: userData.data?.profile_image_url || 'https://example.com/default-avatar.jpg',
        stones: 10, // Mock; fetch from backend later
        followers, // Array: [{username: '@friend1', name: 'Friend One', profile_image_url: '...'}]
      };
    } catch (error) {
      console.error('API Error:', error);
      // Mock fallback for dev
      return {
        id: 'mock-id',
        username: '@willsamrick',
        name: 'Will Samrick',
        avatar: 'https://example.com/avatar.jpg',
        stones: 10,
        followers: [
          { username: '@frankvecchie', name: 'Frank Vecchie', profile_image_url: 'https://example.com/frank.jpg' },
          { username: '@mattbraun', name: 'Matt Braun', profile_image_url: 'https://example.com/matt.jpg' },
          { username: '@brendengroess', name: 'Brenden Groess', profile_image_url: 'https://example.com/brenden.jpg' },
          { username: '@haydnthurman', name: 'Haydn Thurman', profile_image_url: 'https://example.com/haydn.jpg' },
        ],
      };
    }
  };

  const logout = () => setUser(null);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
