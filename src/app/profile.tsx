import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>O</Text>
          </View>

          <Text style={styles.name}>Officer</Text>
          <Text style={styles.role}>Legal Metrology Officer</Text>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Inspection Officer</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>System</Text>
            <Text style={styles.infoValue}>METRIFY</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={styles.infoValue}>Offline Ready</Text>
          </View>
        </View>

        {/* App Information */}
        <Text style={styles.sectionTitle}>App Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rule Set</Text>
            <Text style={styles.infoValue}>
              PCR 2011 + Amendments
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>METRIFY</Text>
          <Text style={styles.footerText}>
            Smart inspection assistance for packaged commodities.
          </Text>

          <Text style={styles.disclaimer}>
            Automated results are inspection aids. Final legal
            determination requires officer verification.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F9FC",
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#0E3557",
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0E3557",
  },

  headerSpacer: {
    width: 42,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 28,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0E3557",
  },

  role: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0E3557",
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  infoRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0E3557",
    textAlign: "right",
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#EAF3F9",
  },

  footer: {
    alignItems: "center",
    paddingTop: 8,
  },

  footerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#155D91",
  },

  footerText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 5,
  },

  disclaimer: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 16,
    paddingHorizontal: 15,
  },
});