import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { router, Link } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import * as Animatable from "react-native-animatable";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoggedIn } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError(t("auth.fillAllFields"));
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const result = await login(identifier, password);
      
      if (!result.success) {
        setError(result.message || t("auth.loginFailed"));
      }
    } catch (error) {
      setError(t("auth.loginFailed"));
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Determine text color based on theme to ensure readability
  const textColor = theme.dark ? "#FFFFFF" : theme.colors.text;
  const inputBackgroundColor = theme.dark ? "#333333" : "#FFFFFF";
  const inputTextColor = theme.dark ? "#FFFFFF" : "#000000";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.logoContainer}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.colors.primary }]}>
            Golden Age
          </Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={300}
          style={styles.formContainer}
        >
          <Text style={[styles.welcomeText, { color: textColor }]}>
            {t("auth.welcome")}
          </Text>

          {error ? (
            <Animatable.View animation="shake" duration={500}>
              <Text style={styles.errorText}>{error}</Text>
            </Animatable.View>
          ) : null}

          <TextInput
            label={t("auth.emailOrPhone")}
            value={identifier}
            onChangeText={setIdentifier}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            placeholderTextColor={theme.dark ? "#AAAAAA" : "#999999"}
            theme={{
              colors: {
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
            textColor={inputTextColor}
          />

          <TextInput
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
                color={theme.colors.primary}
              />
            }
            textContentType="password"
            autoComplete="password"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            placeholderTextColor={theme.dark ? "#AAAAAA" : "#999999"}
            theme={{
              colors: {
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
            textColor={inputTextColor}
          />

          <Link
            href="/(auth)/forgotPassword"
            style={[styles.forgotPasswordText, { color: theme.colors.primary }]}
            asChild
          >
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text
                style={[
                  styles.forgotPasswordText,
                  { color: theme.colors.primary },
                ]}
              >
                {t("auth.forgotPasswordQuestion")}
              </Text>
            </TouchableOpacity>
          </Link>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={styles.loginButtonText}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              t("auth.loginButton")
            )}
          </Button>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: textColor }]}>
              {t("auth.noAccount")}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text
                  style={[styles.registerLink, { color: theme.colors.primary }]}
                >
                  {t("auth.register")}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    height: 56,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 16,
    marginRight: 5,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: "bold",
  },
});