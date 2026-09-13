import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0E3557";
const BLUE = "#155D91";
const LIGHT_BLUE = "#EAF3F9";
const BACKGROUND = "#F6F9FC";
const TEXT = "#17324D";
const MUTED = "#718096";
const BORDER = "#E2EAF0";

const GREEN = "#27804B";
const GREEN_BG = "#EAF6EF";

const RED = "#C73B3B";
const RED_BG = "#FCECEC";

const ORANGE = "#A86600";
const ORANGE_BG = "#FFF3DF";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ================================================= */}
        {/* NAVY BRAND HEADER */}
        {/* ================================================= */}

        <View
          style={[
            styles.brandHeader,
            {
              paddingTop: insets.top + 10,
            },
          ]}
        >
          <View style={styles.headerTopRow}>

            <View>
              <Text style={styles.logo}>
                METRIFY
              </Text>

              <Text style={styles.logoSubtitle}>
                LEGAL METROLOGY
              </Text>
            </View>

            {/* PROFILE */}
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.8}
              onPress={() => {
                // Profile screen will be connected later
              }}
            >
              <View style={styles.profileHead} />
              <View style={styles.profileBody} />
            </TouchableOpacity>

          </View>
        </View>

        {/* ================================================= */}
        {/* OFFICER WELCOME - WHITE AREA */}
        {/* ================================================= */}

        <View style={styles.welcomeSection}>

          <View>
            <Text style={styles.welcomeText}>
              Welcome back
            </Text>

            <Text style={styles.officerText}>
              Field Officer
            </Text>
          </View>

          <View style={styles.readyBadge}>
            <View style={styles.readyDot} />

            <Text style={styles.readyText}>
              READY
            </Text>
          </View>

        </View>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <View style={styles.content}>

          {/* ================================================= */}
          {/* SCAN PRODUCT */}
          {/* ================================================= */}

          <View style={styles.scanCard}>

            <View style={styles.scanIconContainer}>
              <Text style={styles.scanIcon}>
                ⌕
              </Text>
            </View>

            <View style={styles.scanContent}>

              <Text style={styles.scanTitle}>
                Scan Product
              </Text>

              <Text style={styles.scanDescription}>
                Capture or select a package image to begin
                inspection
              </Text>

              {/* RECTANGULAR BUTTON */}
              <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.85}
                onPress={() => router.push("/scanner")}
              >
                <Text style={styles.startButtonText}>
                  Start New Inspection
                </Text>

                <Text style={styles.startButtonArrow}>
                  →
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* ================================================= */}
          {/* TODAY'S OVERVIEW */}
          {/* ================================================= */}

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Today's Overview
            </Text>

            <Text style={styles.dateText}>
              06 SEP 2026
            </Text>

          </View>

          <View style={styles.statsRow}>

            {/* INSPECTED */}
            <View style={styles.statCard}>

              <View
                style={[
                  styles.statIconCircle,
                  styles.inspectedCircle,
                ]}
              >
                <Text
                  style={[
                    styles.statIcon,
                    styles.inspectedIcon,
                  ]}
                >
                  ✓
                </Text>
              </View>

              <Text style={styles.statNumber}>
                12
              </Text>

              <Text style={styles.statLabel}>
                Inspected
              </Text>

            </View>

            {/* NON COMPLIANT */}
            <View style={styles.statCard}>

              <View
                style={[
                  styles.statIconCircle,
                  styles.nonCompliantCircle,
                ]}
              >
                <Text
                  style={[
                    styles.statIcon,
                    styles.nonCompliantIcon,
                  ]}
                >
                  !
                </Text>
              </View>

              <Text style={styles.statNumber}>
                03
              </Text>

              <Text style={styles.statLabel}>
                Non-Compliant
              </Text>

            </View>

            {/* COMPLIANT */}
            <View style={styles.statCard}>

              <View
                style={[
                  styles.statIconCircle,
                  styles.compliantCircle,
                ]}
              >
                <Text
                  style={[
                    styles.statIcon,
                    styles.compliantIcon,
                  ]}
                >
                  ✓
                </Text>
              </View>

              <Text style={styles.statNumber}>
                09
              </Text>

              <Text style={styles.statLabel}>
                Compliant
              </Text>

            </View>

          </View>

          {/* ================================================= */}
          {/* INSPECTION HISTORY */}
          {/* ================================================= */}

          <TouchableOpacity
            style={styles.historyCard}
            activeOpacity={0.85}
            onPress={() => {
              // History screen will be connected later
            }}
          >

            <View style={styles.historyIconContainer}>
              <Text style={styles.historyIcon}>
                ◷
              </Text>
            </View>

            <View style={styles.historyText}>

              <Text style={styles.historyTitle}>
                Inspection History
              </Text>

              <Text style={styles.historySubtitle}>
                View previous inspections and reports
              </Text>

            </View>

            <Text style={styles.historyArrow}>
              ›
            </Text>

          </TouchableOpacity>

          {/* ================================================= */}
          {/* RECENT INSPECTIONS */}
          {/* ================================================= */}

          <View style={styles.sectionHeaderRecent}>

            <Text style={styles.sectionTitle}>
              Recent Inspections
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                // History screen will be connected later
              }}
            >
              <Text style={styles.viewAll}>
                View all
              </Text>
            </TouchableOpacity>

          </View>

          {/* ================================================= */}
          {/* RECENT PRODUCT 1 */}
          {/* ================================================= */}

          <View style={styles.inspectionItem}>

            {/* IMAGE PLACEHOLDER */}
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                IMG
              </Text>
            </View>

            <View style={styles.inspectionInfo}>

              <Text style={styles.productName}>
                Packaged Food Product
              </Text>

              <Text style={styles.inspectionTime}>
                Today • 09:24 AM
              </Text>

            </View>

            <View style={styles.compliantBadge}>
              <Text style={styles.compliantText}>
                COMPLIANT
              </Text>
            </View>

          </View>

          {/* ================================================= */}
          {/* RECENT PRODUCT 2 */}
          {/* ================================================= */}

          <View style={styles.inspectionItem}>

            <View style={styles.productImagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                IMG
              </Text>
            </View>

            <View style={styles.inspectionInfo}>

              <Text style={styles.productName}>
                Household Commodity
              </Text>

              <Text style={styles.inspectionTime}>
                Today • 08:51 AM
              </Text>

            </View>

            <View style={styles.reviewBadge}>
              <Text style={styles.reviewText}>
                REVIEW
              </Text>
            </View>

          </View>

          {/* ================================================= */}
          {/* RECENT PRODUCT 3 */}
          {/* ================================================= */}

          <View style={styles.inspectionItem}>

            <View style={styles.productImagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                IMG
              </Text>
            </View>

            <View style={styles.inspectionInfo}>

              <Text style={styles.productName}>
                Imported Product
              </Text>

              <Text style={styles.inspectionTime}>
                Yesterday • 04:16 PM
              </Text>

            </View>

            <View style={styles.compliantBadge}>
              <Text style={styles.compliantText}>
                COMPLIANT
              </Text>
            </View>

          </View>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <View style={styles.footer}>

            <Text style={styles.footerText}>
              METRIFY • Legal Metrology Inspection System
            </Text>

            <Text style={styles.footerVersion}>
              Field Inspection Assistant
            </Text>

          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  /* ================================================= */
  /* MAIN */
  /* ================================================= */

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  content: {
    paddingHorizontal: 18,
  },

  /* ================================================= */
  /* NAVY HEADER */
  /* ================================================= */

  brandHeader: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingBottom: 18,

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 2.5,
  },

  logoSubtitle: {
    color: "#D8E7F2",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 2,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: "rgba(255,255,255,0.14)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",

    alignItems: "center",
    justifyContent: "center",
  },

  profileHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    marginBottom: 4,
  },

  profileBody: {
    width: 20,
    height: 10,

    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,

    backgroundColor: "#FFFFFF",
  },

  /* ================================================= */
  /* WELCOME */
  /* ================================================= */

  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 17,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: BACKGROUND,
  },

  welcomeText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "500",
  },

  officerText: {
    color: TEXT,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 2,
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: GREEN_BG,

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#D5EBDD",
  },

  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,

    backgroundColor: GREEN,

    marginRight: 6,
  },

  readyText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* ================================================= */
  /* SCAN CARD */
  /* ================================================= */

  scanCard: {
    backgroundColor: NAVY,

    borderRadius: 20,

    padding: 18,

    flexDirection: "row",
    alignItems: "center",

    elevation: 4,

    shadowOpacity: 0.12,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  scanIconContainer: {
    width: 58,
    height: 58,

    borderRadius: 17,

    backgroundColor: "rgba(255,255,255,0.13)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 15,
  },

  scanIcon: {
    color: "#FFFFFF",
    fontSize: 37,
    fontWeight: "300",
  },

  scanContent: {
    flex: 1,
  },

  scanTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  scanDescription: {
    color: "#C9DCEB",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  /* ================================================= */
  /* START BUTTON */
  /* ================================================= */

  startButton: {
    marginTop: 13,

    alignSelf: "flex-start",

    backgroundColor: "#FFFFFF",

    borderRadius: 9,

    paddingHorizontal: 13,
    paddingVertical: 9,

    flexDirection: "row",
    alignItems: "center",
  },

  startButtonText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: "800",
  },

  startButtonArrow: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  /* ================================================= */
  /* SECTION */
  /* ================================================= */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "800",
  },

  dateText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
  },

  /* ================================================= */
  /* STAT CARDS */
  /* ================================================= */

  statsRow: {
    flexDirection: "row",
    gap: 9,
  },

  statCard: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingVertical: 15,
    paddingHorizontal: 7,

    alignItems: "center",

    borderWidth: 1,
    borderColor: BORDER,
  },

  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 7,
  },

  statIcon: {
    fontSize: 16,
    fontWeight: "900",
  },

  inspectedCircle: {
    backgroundColor: LIGHT_BLUE,
  },

  inspectedIcon: {
    color: BLUE,
  },

  nonCompliantCircle: {
    backgroundColor: RED_BG,
  },

  nonCompliantIcon: {
    color: RED,
  },

  compliantCircle: {
    backgroundColor: GREEN_BG,
  },

  compliantIcon: {
    color: GREEN,
  },

  statNumber: {
    color: TEXT,
    fontSize: 21,
    fontWeight: "800",
  },

  statLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },

  /* ================================================= */
  /* HISTORY */
  /* ================================================= */

  historyCard: {
    marginTop: 18,

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    padding: 16,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: BORDER,
  },

  historyIconContainer: {
    width: 46,
    height: 46,

    borderRadius: 13,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  historyIcon: {
    color: BLUE,
    fontSize: 27,
  },

  historyText: {
    flex: 1,
  },

  historyTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },

  historySubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
  },

  historyArrow: {
    color: BLUE,
    fontSize: 28,
    fontWeight: "300",
  },

  /* ================================================= */
  /* RECENT */
  /* ================================================= */

  sectionHeaderRecent: {
    marginTop: 26,
    marginBottom: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewAll: {
    color: BLUE,
    fontSize: 12,
    fontWeight: "800",
  },

  inspectionItem: {
    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    padding: 12,
    marginBottom: 9,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: BORDER,
  },

  /* REAL PACKAGE IMAGE WILL GO HERE LATER */

  productImagePlaceholder: {
    width: 48,
    height: 48,

    borderRadius: 12,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  imagePlaceholderText: {
    color: BLUE,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  inspectionInfo: {
    flex: 1,
  },

  productName: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "700",
  },

  inspectionTime: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  /* ================================================= */
  /* STATUS BADGES */
  /* ================================================= */

  compliantBadge: {
    backgroundColor: GREEN_BG,

    paddingHorizontal: 8,
    paddingVertical: 6,

    borderRadius: 8,
  },

  compliantText: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "800",
  },

  reviewBadge: {
    backgroundColor: ORANGE_BG,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 8,
  },

  reviewText: {
    color: ORANGE,
    fontSize: 8,
    fontWeight: "800",
  },

  /* ================================================= */
  /* FOOTER */
  /* ================================================= */

  footer: {
    alignItems: "center",

    marginTop: 25,

    paddingBottom: 10,
  },

  footerText: {
    color: "#8A9AAA",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  footerVersion: {
    color: "#A5B2BD",
    fontSize: 8,
    marginTop: 4,
  },
});