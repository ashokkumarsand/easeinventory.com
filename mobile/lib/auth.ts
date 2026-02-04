import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://easeinventory.com/api';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  tenantId: string;
  tenantSlug: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBiometrics: boolean;

  // Actions
  login: (email: string, password: string, workspace?: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
}

// Secure storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const BIOMETRICS_ENABLED_KEY = 'biometrics_enabled';
const CREDENTIALS_KEY = 'saved_credentials';

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  hasBiometrics: false,

  login: async (email: string, password: string, workspace?: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/auth/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, workspace }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      // Store token and user
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));

      // Store credentials for biometric login (encrypted)
      const credentials = JSON.stringify({ email, password, workspace });
      await SecureStore.setItemAsync(CREDENTIALS_KEY, credentials);

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithBiometrics: async () => {
    set({ isLoading: true });

    try {
      // Check if biometrics is enabled
      const biometricsEnabled = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
      if (biometricsEnabled !== 'true') {
        throw new Error('Biometric login is not enabled');
      }

      // Get saved credentials
      const credentialsJson = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!credentialsJson) {
        throw new Error('No saved credentials found');
      }

      const { email, password, workspace } = JSON.parse(credentialsJson);

      // Login with saved credentials
      await get().login(email, password, workspace);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      // Check for biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      set({ hasBiometrics: hasHardware && isEnrolled });

      // Check for stored token
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson);

        // Optionally verify token with server
        // const isValid = await verifyToken(token);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isLoading: false });
    }
  },

  enableBiometrics: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication is not available');
      }

      // Authenticate to confirm
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Enable biometrics error:', error);
      return false;
    }
  },

  disableBiometrics: async () => {
    await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  },
}));

// Initialize auth check on app load
useAuth.getState().checkAuth();
