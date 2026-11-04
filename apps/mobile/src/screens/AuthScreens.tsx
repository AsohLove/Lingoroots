
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type PublicHomeProps = NativeStackScreenProps<
  RootStackParamList,
  'PublicHome'
>;

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
type RegisterProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
type VerifyProps = NativeStackScreenProps<
  RootStackParamList,
  'VerifyEmail'
>;

function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: React.PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>LingoRoots</Text>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        style={styles.input}
      />
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.primaryButton,
        (disabled || loading) && styles.disabledButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
}

export function PublicHomeScreen({ navigation }: PublicHomeProps) {
  return (
    <AuthLayout
      eyebrow="LEARN LANGUAGES. CONNECT CULTURES."
      title="Discover the languages around you."
      subtitle="Learn vocabulary, expressions and everyday conversations, starting with languages that deserve to be heard."
    >
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>Learn at your own pace</Text>
        <Text style={styles.featureText}>
          Follow structured lessons, explore new words and build your
          confidence one step at a time.
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>Rooted in real languages</Text>
        <Text style={styles.featureText}>
          Explore languages and the knowledge carried by the people who
          speak them.
        </Text>
      </View>

      <PrimaryButton
        label="Create an account"
        onPress={() => navigation.navigate('Register')}
      />

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.secondaryButtonText}>
          Already have an account? Sign in
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

export function LoginScreen({ navigation }: LoginProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      // Auth state changes automatically and opens the learning app.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      subtitle="Continue where your language-learning journey left off."
    >
      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
      />

      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
      />

      <ErrorMessage message={error} />

      <PrimaryButton
        label="Sign in"
        onPress={() => void handleLogin()}
        loading={loading}
      />

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.secondaryButtonText}>
          New to LingoRoots? Create an account
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

export function RegisterScreen({ navigation }: RegisterProps) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Complete all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      await register(name.trim(), normalizedEmail, password);

      navigation.navigate('VerifyEmail', {
        email: normalizedEmail,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create your account.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create your account"
      subtitle="Join LingoRoots and start exploring languages."
    >
      <Field
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        autoCapitalize="words"
      />

      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
      />

      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
      />

      <Field
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Enter your password again"
        secureTextEntry
      />

      <ErrorMessage message={error} />

      <PrimaryButton
        label="Create account"
        onPress={() => void handleRegister()}
        loading={loading}
      />

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.secondaryButtonText}>
          Already registered? Sign in
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

export function VerifyEmailScreen({ route }: VerifyProps) {
  const { verifyEmail, resendVerification } = useAuth();

  const { email } = route.params;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    setError('');
    setNotice('');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await verifyEmail(email, code);
      // Verification saves the session and switches to authenticated navigation.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to verify your email.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setNotice('');

    try {
      setResending(true);
      await resendVerification(email);
      setNotice('If your account is eligible, a new code has been sent.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to resend the code.',
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="ONE MORE STEP"
      title="Verify your email"
      subtitle={`Enter the six-digit code sent to ${email}.`}
    >
      <Field
        label="Verification code"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
      />

      <ErrorMessage message={error} />

      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <PrimaryButton
        label="Verify email and continue"
        onPress={() => void handleVerify()}
        loading={loading}
      />

      <Pressable
        style={styles.secondaryButton}
        disabled={resending}
        onPress={() => void handleResend()}
      >
        <Text style={styles.secondaryButtonText}>
          {resending ? 'Sending…' : 'Resend verification code'}
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  brand: {
    color: colors.forest,
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 42,
  },
  eyebrow: {
    color: colors.forestLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 25,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  featureText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 7,
  },
  field: {
    marginBottom: 17,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 19,
  },
  secondaryButtonText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  notice: {
    color: colors.forest,
    fontSize: 13,
    marginTop: 8,
  },
});
