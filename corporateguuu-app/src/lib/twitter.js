import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Twitter API v2 OAuth 2.0 configuration
const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: __DEV__, // Use proxy in dev, custom scheme in production
  scheme: 'corporateguuuapp',
  path: 'auth/callback'
});

const TWITTER_DISCOVERY = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
  revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
};

const SCOPES = ['users.read', 'tweet.read', 'tweet.write', 'followers.read', 'offline.access'];

WebBrowser.maybeCompleteAuthSession();

// Generate PKCE code challenge
function generateCodeChallenge() {
  const randomBytes = require('expo-crypto').getRandomBytes(32);
  return require('expo-crypto')
    .digestStringAsync(
      require('expo-crypto').CryptoDigestAlgorithm.SHA256,
      randomBytes.reduce((acc, byte) => acc + String.fromCharCode(byte), ''),
      require('expo-crypto').CryptoEncoding.BASE64
    )
    .then(hash =>
      hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    );
}

export async function loginWithTwitter() {
  try {
    const codeChallenge = await generateCodeChallenge();

    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      scopes: SCOPES,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: REDIRECT_URI,
      prompt: AuthSession.Prompt.SelectAccount,
      extraParams: {
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      },
      usePKCE: true,
    });

    const result = await request.promptAsync(TWITTER_DISCOVERY, {
      showInRecents: true,
      windowFeatures: {
        width: 400,
        height: 600,
      },
    });

    return result;
  } catch (error) {
    console.error('Twitter login error:', error);
    throw error;
  }
}

export async function exchangeCodeForToken(code, codeVerifier) {
  try {
    const tokenRequest = new AuthSession.AccessTokenRequest({
      clientId: CLIENT_ID,
      code: code,
      codeVerifier: codeVerifier,
      redirectUri: REDIRECT_URI,
      scopes: SCOPES,
    });

    const tokenResult = await AuthSession.exchangeCodeAsync(
      tokenRequest,
      TWITTER_DISCOVERY
    );

    return tokenResult;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

export async function fetchTwitterUser(accessToken, fields = null, expansions = null) {
  try {
    const params = new URLSearchParams();
    if (fields) params.append('user.fields', fields);
    if (expansions) params.append('expansions', expansions);

    const queryString = params.toString();
    const url = queryString
      ? `https://api.twitter.com/2/users/me?${queryString}`
      : 'https://api.twitter.com/2/users/me';

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter user');
    }

    const userData = await response.json();
    return userData.data;
  } catch (error) {
    console.error('Fetch Twitter user error:', error);
    throw error;
  }
}

// Get user followers
export async function fetchFollowers(accessToken, userId, maxResults = 50) {
  try {
    const params = new URLSearchParams();
    params.append('user.fields', 'profile_image_url,username');
    params.append('max_results', maxResults.toString());

    const response = await fetch(`https://api.twitter.com/2/users/${userId}/followers?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch followers');
    }

    const followersData = await response.json();
    return followersData.data || [];
  } catch (error) {
    console.error('Fetch followers error:', error);
    throw error;
  }
}

// Get user by username
export async function fetchTwitterUserByUsername(username, accessToken, fields = null, expansions = null) {
  try {
    const params = new URLSearchParams();
    if (fields) params.append('user.fields', fields);
    if (expansions) params.append('expansions', expansions);

    const queryString = params.toString();
    const url = queryString
      ? `https://api.x.com/2/users/by/username/${username}?${queryString}`
      : `https://api.x.com/2/users/by/username/${username}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter user by username');
    }

    const userData = await response.json();
    return userData.data;
  } catch (error) {
    console.error('Fetch Twitter user by username error:', error);
    throw error;
  }
}

// Search tweets (posts) with filtering and metadata fields
export async function searchTweets(query, accessToken, options = {}) {
  try {
    const params = new URLSearchParams();
    params.append('query', query);

    // Add optional parameters
    if (options.maxResults) params.append('max_results', options.maxResults);
    if (options.nextToken) params.append('next_token', options.nextToken);
    if (options.startTime) params.append('start_time', options.startTime);
    if (options.endTime) params.append('end_time', options.endTime);
    if (options.sinceId) params.append('since_id', options.sinceId);
    if (options.untilId) params.append('until_id', options.untilId);
    if (options.sortOrder) params.append('sort_order', options.sortOrder);

    // Fields and expansions for additional metadata
    if (options.tweetFields) params.append('tweet.fields', options.tweetFields);
    if (options.expansions) params.append('expansions', options.expansions);
    if (options.userFields) params.append('user.fields', options.userFields);
    if (options.placeFields) params.append('place.fields', options.placeFields);
    if (options.pollFields) params.append('poll.fields', options.pollFields);

    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search tweets');
    }

    const tweetData = await response.json();
    return tweetData;
  } catch (error) {
    console.error('Search tweets error:', error);
    throw error;
  }
}

// Get tweet counts (post counts) with filtering
export async function getTweetCounts(query, accessToken, options = {}) {
  try {
    const params = new URLSearchParams();
    params.append('query', query);

    // Add optional parameters
    if (options.startTime) params.append('start_time', options.startTime);
    if (options.endTime) params.append('end_time', options.endTime);
    if (options.sinceId) params.append('since_id', options.sinceId);
    if (options.untilId) params.append('until_id', options.untilId);
    if (options.granularity) params.append('granularity', options.granularity);
    else params.append('granularity', 'day'); // default granularity

    const response = await fetch(`https://api.twitter.com/2/tweets/counts/recent?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get tweet counts');
    }

    const countData = await response.json();
    return countData;
  } catch (error) {
    console.error('Get tweet counts error:', error);
    throw error;
  }
}

// Post a tweet (create new post)
export async function postTweet(text, accessToken, options = {}) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Tweet text is required');
    }

    if (text.length > 280) {
      throw new Error('Tweet text exceeds 280 characters');
    }

    const payload = {
      text: text.trim(),
    };

    // Add optional parameters
    if (options.replyTo) payload.reply = { in_reply_to_tweet_id: options.replyTo };
    if (options.quoteTweetId) payload.quote_tweet_id = options.quoteTweetId;
    if (options.replySettings) payload.reply_settings = options.replySettings;

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to post tweet: ${errorData.title || response.statusText}`);
    }

    const tweetData = await response.json();
    return tweetData.data;
  } catch (error) {
    console.error('Post tweet error:', error);
    throw error;
  }
}

// Get filtered stream (requires special OAuth scopes)
export async function getFilteredStream(accessToken, options = {}) {
  try {
    const params = new URLSearchParams();

    // Fields and expansions for additional metadata
    if (options.tweetFields) params.append('tweet.fields', options.tweetFields);
    if (options.expansions) params.append('expansions', options.expansions);
    if (options.userFields) params.append('user.fields', options.userFields);
    if (options.placeFields) params.append('place.fields', options.placeFields);
    if (options.pollFields) params.append('poll.fields', options.pollFields);

    const queryString = params.toString();
    const url = queryString
      ? `https://api.twitter.com/2/tweets/search/stream?${queryString}`
      : 'https://api.twitter.com/2/tweets/search/stream';

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get filtered stream');
    }

    const streamData = await response.json();
    return streamData;
  } catch (error) {
    console.error('Get filtered stream error:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshTwitterToken(refreshToken) {
  try {
    const formData = new FormData();
    formData.append('refresh_token', refreshToken);
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', CLIENT_ID);

    const response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await response.json();

    // Store refreshed tokens
    await storeAuthTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken, // Keep old refresh token if not provided
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      tokenType: tokenData.token_type,
    });

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      tokenType: tokenData.token_type,
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}

// Check if token is expired and refresh if needed
export async function ensureValidAccessToken() {
  try {
    const tokens = await getStoredAuthTokens();

    if (!tokens) {
      throw new Error('No stored tokens');
    }

    // If token expires within 5 minutes, refresh it
    if (tokens.expiresAt && Date.now() > (tokens.expiresAt - 300000)) {
      return await refreshTwitterToken(tokens.refreshToken);
    }

    return tokens;
  } catch (error) {
    console.error('Ensure valid token error:', error);
    throw error;
  }
}

export async function storeAuthTokens(tokens) {
  try {
    await AsyncStorage.setItem('twitter_auth_tokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Storage error:', error);
    throw error;
  }
}

export async function getStoredAuthTokens() {
  try {
    const tokens = await AsyncStorage.getItem('twitter_auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Get storage error:', error);
    return null;
  }
}

export async function clearStoredAuthTokens() {
  try {
    await AsyncStorage.removeItem('twitter_auth_tokens');
  } catch (error) {
    console.error('Clear storage error:', error);
  }
}

// Complete Twitter OAuth flow
export async function completeTwitterAuth() {
  try {
    const loginResult = await loginWithTwitter();

    if (loginResult.type === 'success' && loginResult.params.code) {
      const tokenResult = await exchangeCodeForToken(
        loginResult.params.code,
        loginResult.params.codeVerifier
      );

      await storeAuthTokens(tokenResult);

      const user = await fetchTwitterUser(tokenResult.accessToken);

      return {
        success: true,
        user,
        tokens: tokenResult,
      };
    } else {
      return { success: false, canceled: true };
    }
  } catch (error) {
    console.error('Twitter auth error:', error);
    return { success: false, error };
  }
}
