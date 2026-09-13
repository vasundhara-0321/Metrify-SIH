import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0E3557";
const BLUE = "#155D91";
const LIGHT_BLUE = "#EAF3F9";
const BACKGROUND = "#F6F9FC";

const METRIFY_IMAGE_KEY = "__METRIFY_IMAGE_URI__";

const getMetrifyImage = (): string | undefined => {
  return (globalThis as any)[METRIFY_IMAGE_KEY];
};

export default function PreviewScreen() {
  const insets = useSafeAreaInsets();

  const [image] = useState<string | undefined>(
    getMetrifyImage()
  );

  console.log("PREVIEW IMAGE URI:", image);

  if (!image) {
    return (
      <View style={styles.emptyScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={NAVY}
        />

        <Text style={styles.emptyTitle}>
          No Image Selected
        </Text>

        <Text style={styles.emptyText}>
          Please capture or select a package image to continue.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/scanner")}
        >
          <Text style={styles.primaryButtonText}>
            Open Scanner
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const continueToAnalysis = () => {
    console.log(
      "SENDING IMAGE TO ANALYSIS:",
      image
    );

    router.push("/analysis");
  };

  const retakeImage = () => {
    router.replace("/scanner");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Review Image
          </Text>

          <Text style={styles.headerSubtitle}>
            Package Label
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>
            Check the captured image
          </Text>

          <Text style={styles.instructionText}>
            Make sure the package label is clear and the
            printed declarations are readable.
          </Text>
        </View>

        <View style={styles.imageContainer}>

          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="contain"
            onLoad={() => {
              console.log(
                "METRIFY: PREVIEW IMAGE LOADED"
              );
            }}
            onError={(error) => {
              console.log(
                "METRIFY: PREVIEW IMAGE ERROR:",
                error.nativeEvent
              );
            }}
          />

          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>
              PACKAGE IMAGE
            </Text>
          </View>

        </View>

        <View style={styles.checkCard}>

          <Text style={styles.checkTitle}>
            Before continuing
          </Text>

          <View style={styles.checkRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>

            <Text style={styles.checkText}>
              Product label is visible
            </Text>
          </View>

          <View style={styles.checkRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>

            <Text style={styles.checkText}>
              Text is reasonably clear
            </Text>
          </View>

          <View style={styles.checkRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>

            <Text style={styles.checkText}>
              Important declarations are in frame
            </Text>
          </View>

        </View>
      </View>

      <View style={styles.bottomPanel}>

        <TouchableOpacity
          style={styles.retakeButton}
          onPress={retakeImage}
          activeOpacity={0.85}
        >
          <Text style={styles.retakeIcon}>↻</Text>

          <Text style={styles.retakeText}>
            Retake
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={continueToAnalysis}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>
            Continue to Analysis
          </Text>

          <Text style={styles.continueArrow}>
            →
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    backgroundColor: NAVY,
    paddingBottom: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 38,
  },

  headerText: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#C6D9E8",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  instructionContainer: {
    marginBottom: 13,
  },

  instructionTitle: {
    color: NAVY,
    fontSize: 17,
    fontWeight: "800",
  },

  instructionText: {
    color: "#718096",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  imageContainer: {
    flex: 1,
    minHeight: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2EAF0",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  imageBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(14,53,87,0.90)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  imageBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  checkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2EAF0",
  },

  checkTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  checkMark: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "800",
  },

  checkText: {
    color: "#617386",
    fontSize: 10,
    flex: 1,
  },

  bottomPanel: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2EAF0",
    flexDirection: "row",
    gap: 10,
  },

  retakeButton: {
    width: 105,
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  retakeIcon: {
    color: NAVY,
    fontSize: 19,
    marginRight: 6,
  },

  retakeText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
  },

  continueButton: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  continueArrow: {
    color: "#FFFFFF",
    fontSize: 19,
    marginLeft: 8,
  },

  emptyScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "800",
  },

  emptyText: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 25,
  },

  primaryButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

});