import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const RESULT_KEY = "__METRIFY_RESULT__";

type RuleCheck = {
  field: string;
  value: string | null;
  status: "DETECTED" | "MISSING" | "VERIFY" | "NOT_APPLICABLE";
  rule: string;
};

type RuleCompliance = {
  ruleSet: string;
  status: string;
  summary: {
    totalChecks: number;
    detected: number;
    missing: number;
    verify: number;
  };
  checks: RuleCheck[];
  disclaimer: string;
};

type InspectionResult = {
  inspectionId: string;
  ocrText: string;
  ruleCompliance: RuleCompliance;
};

export default function ResultScreen() {
  const router = useRouter();

  const [result, setResult] =
    useState<InspectionResult | null>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] =
    useState(false);

  useEffect(() => {
    const stored = globalThis as any;

    if (stored[RESULT_KEY]) {
      setResult(stored[RESULT_KEY]);
      return;
    }

    Alert.alert(
      "Result Unavailable",
      "Inspection data could not be loaded.",
      [
        {
          text: "Back",
          onPress: () => router.back(),
        },
      ]
    );
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "POTENTIAL_NON_COMPLIANCE":
        return "POTENTIAL NON-COMPLIANCE";

      case "READY_FOR_OFFICER_VERIFICATION":
        return "READY FOR VERIFICATION";

      case "REVIEW_REQUIRED":
        return "REVIEW REQUIRED";

      default:
        return "REVIEW REQUIRED";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "POTENTIAL_NON_COMPLIANCE":
        return "One or more declarations could not be detected automatically. Officer verification is required.";

      case "READY_FOR_OFFICER_VERIFICATION":
        return "Automated checks are complete. Officer verification is required before the final determination.";

      default:
        return "The package requires officer verification before a final legal determination.";
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case "DETECTED":
        return "✓";

      case "MISSING":
        return "×";

      case "VERIFY":
        return "?";

      default:
        return "—";
    }
  };

  const getCheckStyle = (status: string) => {
    switch (status) {
      case "DETECTED":
        return styles.detectedIcon;

      case "MISSING":
        return styles.missingIcon;

      case "VERIFY":
        return styles.verifyIcon;

      default:
        return styles.naIcon;
    }
  };

  const generatePDF = async () => {
    if (!result) return;

    try {
      setIsGeneratingPDF(true);

      const checksHTML = result.ruleCompliance.checks
        .map(
          (check) => `
            <tr>
              <td>${check.field}</td>
              <td>${check.value || "—"}</td>
              <td>${check.status}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <style>

              body {
                font-family: Arial, sans-serif;
                padding: 24px;
                color: #222;
              }

              .header {
                background: #0E3557;
                color: white;
                padding: 22px;
                border-radius: 10px;
              }

              .header h1 {
                margin: 0;
                font-size: 27px;
              }

              .header p {
                margin-top: 6px;
                font-size: 13px;
              }

              .info {
                background: #F6F9FC;
                padding: 14px;
                margin-top: 16px;
                border-radius: 8px;
              }

              h2 {
                color: #0E3557;
                margin-top: 26px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
              }

              th, td {
                border: 1px solid #D9E2E8;
                padding: 8px;
                text-align: left;
                font-size: 10px;
              }

              th {
                background: #EAF3F9;
              }

              .warning {
                background: #FFF4E5;
                padding: 14px;
                margin-top: 24px;
                border-radius: 8px;
              }

              .ocr {
                background: #F6F9FC;
                padding: 14px;
                white-space: pre-wrap;
                font-size: 9px;
              }

            </style>
          </head>

          <body>

            <div class="header">
              <h1>METRIFY</h1>
              <p>Legal Metrology Package Inspection Report</p>
            </div>

            <div class="info">
              <strong>Inspection ID:</strong>
              ${result.inspectionId}

              <br/><br/>

              <strong>Automated Status:</strong>
              ${getStatusLabel(
                result.ruleCompliance.status
              )}
            </div>

            <h2>Compliance Summary</h2>

            <div class="info">
              Total Checks:
              ${result.ruleCompliance.summary.totalChecks}

              <br/>

              Detected:
              ${result.ruleCompliance.summary.detected}

              <br/>

              Missing:
              ${result.ruleCompliance.summary.missing}

              <br/>

              Verify:
              ${result.ruleCompliance.summary.verify}
            </div>

            <h2>Declaration Checks</h2>

            <table>

              <tr>
                <th>Declaration</th>
                <th>Value</th>
                <th>Status</th>
              </tr>

              ${checksHTML}

            </table>

            <h2>OCR Extracted Text</h2>

            <div class="ocr">
              ${result.ocrText}
            </div>

            <div class="warning">

              <strong>
                Officer Verification Required
              </strong>

              <p>
                This automated report is an inspection aid.
                OCR results may contain recognition errors.
                The automated result does not establish legal
                compliance. Final determination must be made
                by the authorized officer after physical
                verification and application of applicable
                rules.
              </p>

            </div>

          </body>
        </html>
      `;

      const pdf =
        await Print.printToFileAsync({
          html,
        });

      if (!pdf.uri) {
        throw new Error(
          "PDF file was not generated."
        );
      }

      const available =
        await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          "PDF Generated",
          "The inspection report was generated successfully."
        );

        return;
      }

      await Sharing.shareAsync(pdf.uri, {
        mimeType: "application/pdf",
        dialogTitle:
          "Share METRIFY Inspection Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error(
        "METRIFY: Result PDF error:",
        error
      );

      Alert.alert(
        "PDF Error",
        "Unable to generate or share the report."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#155D91"
          />

          <Text style={styles.loadingText}>
            Loading inspection result...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const compliance = result.ruleCompliance;

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>
              Inspection Result
            </Text>

            <Text style={styles.headerSubtitle}>
              METRIFY Automated Assessment
            </Text>
          </View>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* RESULT STATUS */}

          <View style={styles.statusCard}>

            <View style={styles.statusIconCircle}>

              <Text style={styles.statusIcon}>
                !
              </Text>

            </View>

            <Text style={styles.statusTitle}>
              {getStatusLabel(
                compliance.status
              )}
            </Text>

            <Text style={styles.statusDescription}>
              {getStatusDescription(
                compliance.status
              )}
            </Text>

          </View>


          {/* INSPECTION ID */}

          <View style={styles.inspectionCard}>

            <Text style={styles.inspectionLabel}>
              INSPECTION ID
            </Text>

            <Text style={styles.inspectionId}>
              {result.inspectionId}
            </Text>

          </View>


          {/* SUMMARY */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Compliance Summary
            </Text>

            <Text style={styles.cardSubtitle}>
              Automated declaration detection
            </Text>


            <View style={styles.summaryGrid}>

              <View style={styles.summaryItem}>

                <Text style={styles.summaryNumber}>
                  {compliance.summary.detected}
                </Text>

                <Text style={styles.summaryLabel}>
                  Detected
                </Text>

              </View>


              <View style={styles.summaryItem}>

                <Text style={styles.summaryNumber}>
                  {compliance.summary.missing}
                </Text>

                <Text style={styles.summaryLabel}>
                  Missing
                </Text>

              </View>


              <View style={styles.summaryItem}>

                <Text style={styles.summaryNumber}>
                  {compliance.summary.verify}
                </Text>

                <Text style={styles.summaryLabel}>
                  Verify
                </Text>

              </View>

            </View>

          </View>


          {/* DECLARATION RESULTS */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Declaration Checks
            </Text>

            <Text style={styles.cardSubtitle}>
              Results generated by the rule compliance
              system
            </Text>


            <View style={styles.checkList}>

              {compliance.checks.map(
                (check, index) => (

                  <View
                    key={`${check.field}-${index}`}
                    style={styles.checkRow}
                  >

                    <View
                      style={[
                        styles.checkIcon,
                        getCheckStyle(
                          check.status
                        ),
                      ]}
                    >
                      <Text
                        style={
                          styles.checkIconText
                        }
                      >
                        {getCheckIcon(
                          check.status
                        )}
                      </Text>
                    </View>


                    <View
                      style={styles.checkContent}
                    >

                      <Text
                        style={styles.checkField}
                      >
                        {check.field}
                      </Text>

                      <Text
                        style={styles.checkRule}
                        numberOfLines={2}
                      >
                        {check.value ||
                          check.rule}
                      </Text>

                    </View>


                    <Text
                      style={[
                        styles.checkStatus,
                        check.status ===
                          "DETECTED" &&
                          styles.detectedText,
                        check.status ===
                          "MISSING" &&
                          styles.missingText,
                        check.status ===
                          "VERIFY" &&
                          styles.verifyText,
                      ]}
                    >
                      {check.status ===
                      "NOT_APPLICABLE"
                        ? "N/A"
                        : check.status}
                    </Text>

                  </View>

                )
              )}

            </View>

          </View>


          {/* OFFICER VERIFICATION */}

          <View style={styles.verificationCard}>

            <View style={styles.verificationHeader}>

              <View
                style={
                  styles.verificationIconCircle
                }
              >
                <Text
                  style={
                    styles.verificationIcon
                  }
                >
                  ✓
                </Text>
              </View>

              <View
                style={styles.verificationHeaderText}
              >

                <Text
                  style={styles.verificationTitle}
                >
                  Officer Verification
                </Text>

                <Text
                  style={styles.verificationSubtitle}
                >
                  Required before final determination
                </Text>

              </View>

            </View>


            <Text
              style={styles.verificationDescription}
            >
              Review the physical package and verify
              the declarations identified by METRIFY.
              The automated assessment should be used
              only as an inspection aid.
            </Text>


            <Pressable
              onPress={() => router.push("/verification")}
              style={styles.verifyButton}
            >

              <Text style={styles.verifyButtonText}>
                Start Officer Verification
              </Text>

              <Text style={styles.verifyArrow}>
                →
              </Text>

            </Pressable>

          </View>


          {/* REPORT */}

          <View style={styles.reportCard}>

            <Text style={styles.reportTitle}>
              Inspection Report
            </Text>

            <Text style={styles.reportDescription}>
              Generate a PDF containing the automated
              inspection findings and OCR information.
            </Text>

            <Pressable
              onPress={generatePDF}
              disabled={isGeneratingPDF}
              style={styles.pdfButton}
            >

              {isGeneratingPDF ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              ) : (

                <>
                  <Text style={styles.pdfIcon}>
                    PDF
                  </Text>

                  <Text style={styles.pdfButtonText}>
                    Generate PDF Report
                  </Text>
                </>

              )}

            </Pressable>

          </View>


          {/* DISCLAIMER */}

          <View style={styles.disclaimerCard}>

            <Text style={styles.disclaimerTitle}>
              Important
            </Text>

            <Text style={styles.disclaimerText}>
              METRIFY provides automated inspection
              assistance. OCR detection does not prove
              legal compliance or non-compliance. Final
              determination must be made by the authorized
              officer using physical verification and
              applicable commodity-specific rules.
            </Text>

          </View>

        </ScrollView>

      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F6F9FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F6F9FC",
  },

  header: {
    height: 76,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E4EBF0",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 30,
    color: "#0E3557",
    marginTop: -2,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0E3557",
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#718096",
    marginTop: 3,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  statusCard: {
    backgroundColor: "#FFF4E5",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0DEC0",
    marginBottom: 16,
  },

  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E9A52B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statusIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#805500",
    textAlign: "center",
  },

  statusDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#765F38",
    textAlign: "center",
    marginTop: 7,
  },

  inspectionCard: {
    backgroundColor: "#0E3557",
    borderRadius: 14,
    padding: 17,
    marginBottom: 16,
  },

  inspectionLabel: {
    color: "#BFD5E5",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  inspectionId: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
  },

  cardSubtitle: {
    fontSize: 11,
    color: "#718096",
    marginTop: 4,
    lineHeight: 17,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },

  summaryItem: {
    flex: 1,
    backgroundColor: "#F6F9FC",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0E3557",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  checkList: {
    marginTop: 15,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  detectedIcon: {
    backgroundColor: "#DFF2E8",
  },

  missingIcon: {
    backgroundColor: "#FBE2E2",
  },

  verifyIcon: {
    backgroundColor: "#FFF0D5",
  },

  naIcon: {
    backgroundColor: "#E9EEF2",
  },

  checkIconText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  checkContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 7,
  },

  checkField: {
    fontSize: 13,
    fontWeight: "600",
    color: "#243B53",
  },

  checkRule: {
    fontSize: 10,
    color: "#7A8997",
    lineHeight: 15,
    marginTop: 3,
  },

  checkStatus: {
    fontSize: 8,
    fontWeight: "800",
    maxWidth: 72,
    textAlign: "right",
  },

  detectedText: {
    color: "#26734D",
  },

  missingText: {
    color: "#A33A3A",
  },

  verifyText: {
    color: "#9A6500",
  },

  verificationCard: {
    backgroundColor: "#EAF3F9",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D4E6F0",
  },

  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  verificationIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  verificationIcon: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  verificationHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  verificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0E3557",
  },

  verificationSubtitle: {
    fontSize: 10,
    color: "#64788A",
    marginTop: 3,
  },

  verificationDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#536B7D",
    marginTop: 13,
  },

  verifyButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  verifyArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 9,
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0E3557",
  },

  reportDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#718096",
    marginTop: 5,
  },

  pdfButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  pdfIcon: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 9,
  },

  pdfButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  disclaimerCard: {
    backgroundColor: "#FFF8EC",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0DEC0",
  },

  disclaimerTitle: {
    color: "#8A5A00",
    fontSize: 13,
    fontWeight: "700",
  },

  disclaimerText: {
    color: "#755C35",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 13,
    color: "#718096",
    marginTop: 12,
  },

});