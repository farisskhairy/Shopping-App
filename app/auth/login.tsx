import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, exchangeCodeAsync } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '817998367509-lvnpikddm7553hnc2u6l8nusis66ha9f.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: makeRedirectUri({
        scheme: 'com.myapp',
      }),
      scopes: ['profile', 'email'],
      responseType: 'code',
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      handleGoogleLogin(response.params.code);
    }
  }, [response]);

  const handleGoogleLogin = async (authCode: string) => {
    try {
      setLoading(true);

      const tokenResult = await exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code: authCode,
          redirectUri: makeRedirectUri({ scheme: 'com.myapp' }),
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
        },
        discovery
      );

      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await userInfoResponse.json();

      await SecureStore.setItemAsync('accessToken', tokenResult.accessToken ?? '');
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));

      Alert.alert('Success', `Logged in as ${userInfo.name}`);
      router.replace('/');

    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = async () => {
    await promptAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Shopping App will change the way you shop
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLoginPress}
        disabled={!request || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#984063',
  },
  loginButton: {
    backgroundColor: '#41436A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
