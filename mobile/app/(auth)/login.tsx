import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithBiometrics, hasBiometrics } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, workspace);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to EaseInventory',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        await loginWithBiometrics();
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Biometric Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Ease</Text>
          <Text style={styles.logoAccent}>Inventory</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Workspace (optional)"
            placeholderTextColor="#666"
            value={workspace}
            onChangeText={setWorkspace}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {hasBiometrics && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.biometricText}>Use Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkAccent}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030407',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FAF8F3',
  },
  logoAccent: {
    fontSize: 32,
    fontWeight: '900',
    color: '#65A30D',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FAF8F3',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#111318',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#222',
  },
  button: {
    backgroundColor: '#65A30D',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricButton: {
    padding: 16,
    alignItems: 'center',
  },
  biometricText: {
    color: '#65A30D',
    fontSize: 14,
    fontWeight: '600',
  },
  linkText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  linkAccent: {
    color: '#65A30D',
    fontWeight: '600',
  },
});
