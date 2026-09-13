import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0E3557";
const BLUE = "#155D91";
const LIGHT_BLUE = "#EAF3F9";

/*
 * Temporary in-memory image storage.
 * This avoids passing local file URIs through Expo Router.
 */
const METRIFY_IMAGE_KEY = "__METRIFY_IMAGE_URI__";

const setMetrifyImage = (uri: string) => {
  (globalThis as any)[METRIFY_IMAGE_KEY] = uri;
};

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [facing, setFacing] =
    useState<"back" | "front">("back");

  const [flash, setFlash] =
    useState<"off" | "on">("off");

  const [isCapturing, setIsCapturing] =
    useState(false);

  /* ---------------- CAMERA PERMISSION ---------------- */

  if (!permission) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>
          Checking Camera
        </Text>

        <Text style={styles.permissionText}>
          Please wait...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionIconText}>⌾</Text>
        </View>

        <Text style={styles.permissionTitle}>
          Camera Access Required
        </Text>

        <Text style={styles.permissionText}>
          METRIFY needs access to your camera to capture
          package labels for inspection.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={styles.permissionButtonText}>
            Allow Camera Access
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButtonPermission}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------------- CAPTURE PHOTO ---------------- */

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);

      console.log("METRIFY: Capturing package image...");

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.9,
        });

      if (!photo?.uri) {
        Alert.alert(
          "Capture Failed",
          "Unable to capture the package image. Please try again."
        );
        return;
      }

      console.log(
        "METRIFY: Captured image URI:",
        photo.uri
      );

      // Store image URI in memory
      setMetrifyImage(photo.uri);

      console.log(
        "METRIFY: Image stored successfully."
      );

      router.push("/preview");

    } catch (error) {
      console.log(
        "Camera capture error:",
        error
      );

      Alert.alert(
        "Capture Failed",
        "Something went wrong while capturing the image."
      );

    } finally {
      setIsCapturing(false);
    }
  };

  /* ---------------- GALLERY ---------------- */

  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Access Required",
          "Please allow METRIFY to access your photos so you can select a package image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: false,
          allowsEditing: false,
          quality: 0.9,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage =
        result.assets?.[0];

      if (!selectedImage?.uri) {
        Alert.alert(
          "No Image Selected",
          "Please select a package image."
        );
        return;
      }

      console.log(
        "METRIFY: Selected gallery image URI:",
        selectedImage.uri
      );

      // Store image URI in memory
      setMetrifyImage(selectedImage.uri);

      console.log(
        "METRIFY: Gallery image stored successfully."
      );

      router.push("/preview");

    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        "Unable to Open Gallery",
        "Please try again."
      );
    }
  };

  /* ---------------- CAMERA CONTROLS ---------------- */

  const flipCamera = () => {
    setFacing((current) =>
      current === "back"
        ? "front"
        : "back"
    );
  };

  const toggleFlash = () => {
    setFlash((current) =>
      current === "off"
        ? "on"
        : "off"
    );
  };

  /* ---------------- MAIN SCREEN ---------------- */

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      />

      <View
        style={[
          styles.topOverlay,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >

        <TouchableOpacity
          style={styles.topButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.topButtonText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>

          <Text style={styles.title}>
            Scan Product
          </Text>

          <Text style={styles.subtitle}>
            Legal Metrology Inspection
          </Text>

        </View>

        <TouchableOpacity
          style={styles.topButton}
          onPress={toggleFlash}
          activeOpacity={0.8}
        >
          <Text style={styles.flashIcon}>
            {flash === "on" ? "⚡" : "♢"}
          </Text>
        </TouchableOpacity>

      </View>

      <View style={styles.guideContainer}>

        <View style={styles.scanFrame}>

          <View
            style={[
              styles.corner,
              styles.topLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.topRight,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomRight,
            ]}
          />

        </View>

        <View style={styles.instructionBox}>

          <Text style={styles.instructionTitle}>
            Position the package inside the frame
          </Text>

          <Text style={styles.instructionText}>
            Make sure the label is clear and all printed
            information is visible.
          </Text>

        </View>

      </View>

      <View style={styles.bottomPanel}>

        <Text style={styles.bottomTitle}>
          Capture Package Label
        </Text>

        <Text style={styles.bottomSubtitle}>
          Use camera or select an existing image
        </Text>

        <View style={styles.controlsRow}>

          <TouchableOpacity
            style={styles.sideControl}
            onPress={openGallery}
            activeOpacity={0.8}
          >

            <View style={styles.sideIconCircle}>
              <Text style={styles.sideIcon}>
                ▧
              </Text>
            </View>

            <Text style={styles.sideLabel}>
              Gallery
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={capturePhoto}
            activeOpacity={0.85}
            disabled={isCapturing}
          >

            <View style={styles.captureInner}>

              <Text style={styles.captureIcon}>
                {isCapturing ? "…" : "●"}
              </Text>

            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideControl}
            onPress={flipCamera}
            activeOpacity={0.8}
          >

            <View style={styles.sideIconCircle}>
              <Text style={styles.sideIcon}>
                ↻
              </Text>
            </View>

            <Text style={styles.sideLabel}>
              Flip
            </Text>

          </TouchableOpacity>

        </View>

        <View style={styles.tipContainer}>

          <Text style={styles.tipIcon}>
            i
          </Text>

          <Text style={styles.tipText}>
            Keep the package steady and ensure good lighting
          </Text>

        </View>

      </View>

    </View>
  );
}

/* =====================================================
   STYLES — UNCHANGED
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  permissionScreen: {
    flex: 1,
    backgroundColor: "#F6F9FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  permissionIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  permissionIconText: {
    color: NAVY,
    fontSize: 38,
  },

  permissionTitle: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  permissionText: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  permissionButton: {
    backgroundColor: NAVY,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  backButtonPermission: {
    marginTop: 15,
    paddingVertical: 10,
  },

  backButtonText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: "700",
  },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: "rgba(14,53,87,0.94)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },

  topButtonText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 38,
  },

  flashIcon: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  titleContainer: {
    alignItems: "center",
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  subtitle: {
    color: "#C6D9E8",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginTop: 3,
  },

  guideContainer: {
    position: "absolute",
    top: "25%",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  scanFrame: {
    width: "78%",
    height: 245,
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },

  instructionBox: {
    marginTop: 18,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  instructionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  instructionText: {
    color: "#E0E8EF",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 300,
  },

  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
  },

  bottomTitle: {
    color: NAVY,
    fontSize: 17,
    fontWeight: "800",
  },

  bottomSubtitle: {
    color: "#7B8794",
    fontSize: 11,
    marginTop: 4,
  },

  controlsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 18,
  },

  sideControl: {
    width: 65,
    alignItems: "center",
  },

  sideIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  sideIcon: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "700",
  },

  sideLabel: {
    color: NAVY,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    borderWidth: 5,
    borderColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },

  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },

  captureIcon: {
    color: "#FFFFFF",
    fontSize: 25,
  },

  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F8FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 17,
    width: "100%",
  },

  tipIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: LIGHT_BLUE,
    color: NAVY,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 8,
  },

  tipText: {
    flex: 1,
    color: "#68798A",
    fontSize: 9,
    lineHeight: 14,
  },

});