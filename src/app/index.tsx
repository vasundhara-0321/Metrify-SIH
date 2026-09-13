import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#0E3557";
const BLUE = "#155D91";
const LIGHT_BLUE = "#EAF3F9";

export default function LoginScreen() {
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!officerId.trim() || !password.trim()) {
      Alert.alert(
        "Incomplete details",
        "Please enter your Officer ID and password."
      );
      return;
    }

    // Prototype login
    router.replace("/home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================= BRAND ================= */}

        <View style={styles.brandSection}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons
                name="shield-checkmark"
                size={38}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.logoText}>METRIFY</Text>

          <Text style={styles.tagline}>
            Smart Package Inspection
          </Text>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />

            <Text style={styles.badgeText}>
              LEGAL METROLOGY • FIELD SYSTEM
            </Text>
          </View>
        </View>

        {/* ================= LOGIN CARD ================= */}

        <View style={styles.card}>
          <Text style={styles.welcome}>
            Welcome back
          </Text>

          <Text style={styles.instruction}>
            Sign in to begin your inspection
          </Text>

          {/* OFFICER ID */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              OFFICER ID
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={21}
                color={BLUE}
                style={styles.inputIcon}
              />

              <TextInput
                value={officerId}
                onChangeText={setOfficerId}
                placeholder="Enter your officer ID"
                placeholderTextColor="#9AA9BA"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* PASSWORD */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              PASSWORD
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={BLUE}
                style={styles.inputIcon}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9AA9BA"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.eyeButton}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color={BLUE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* SIGN IN */}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              Sign In
            </Text>

            <View style={styles.arrowCircle}>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={NAVY}
              />
            </View>
          </TouchableOpacity>

          {/* SECURITY */}

          <View style={styles.securityRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={BLUE}
            />

            <Text style={styles.securityText}>
              Authorized field officer access
            </Text>
          </View>
        </View>

        {/* ================= FOOTER ================= */}

        <View style={styles.bottomSection}>
          <Text style={styles.bottomTitle}>
            Inspection made smarter.
          </Text>

          <Text style={styles.bottomText}>
            Capture • Analyze • Verify • Report
          </Text>

          <Text style={styles.version}>
            METRIFY v1.0 • SIH 2026
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F9FC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 30,
  },

  /* ================= BRAND ================= */

  brandSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoOuter: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: LIGHT_BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: NAVY,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 3,
    color: NAVY,
  },

  tagline: {
    fontSize: 14,
    color: "#60758B",
    marginTop: 5,
    fontWeight: "500",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BLUE,
    marginRight: 7,
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: "#35658D",
  },

  /* ================= CARD ================= */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 23,

    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 5,
  },

  welcome: {
    fontSize: 25,
    fontWeight: "800",
    color: NAVY,
  },

  instruction: {
    fontSize: 14,
    color: "#74879A",
    marginTop: 5,
    marginBottom: 25,
  },

  /* ================= INPUTS ================= */

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#52708D",
    marginBottom: 8,
  },

  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: "#D9E4EF",
    borderRadius: 14,
    backgroundColor: "#F9FBFD",
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    marginLeft: 16,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 15,
    color: NAVY,
  },

  eyeButton: {
    padding: 15,
  },

  /* ================= BUTTON ================= */

  loginButton: {
    height: 57,
    borderRadius: 15,
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  arrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  /* ================= SECURITY ================= */

  securityRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 19,
  },

  securityText: {
    fontSize: 11,
    color: "#71869A",
    marginLeft: 6,
  },

  /* ================= FOOTER ================= */

  bottomSection: {
    alignItems: "center",
    marginTop: 27,
  },

  bottomTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#466783",
  },

  bottomText: {
    fontSize: 12,
    color: "#8295A7",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  version: {
    fontSize: 10,
    color: "#A4B1BD",
    marginTop: 14,
  },
});