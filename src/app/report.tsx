import React, { useState } from "react";
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
const DECISION_KEY = "__METRIFY_FINAL_DECISION__";

export default function ReportScreen() {
  const router = useRouter();

  const stored = globalThis as any;

  const result = stored[RESULT_KEY];
  const decisionData = stored[DECISION_KEY];

  const [generating, setGenerating] = useState(false);

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Report Data Unavailable
          </Text>

          <Text style={styles.emptyText}>
            No inspection information is currently
            available.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.primaryButtonText}>
              Go to Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const checks =
    result?.ruleCompliance?.checks || [];

  const summary =
    result?.ruleCompliance?.summary || {
      totalChecks: 0,
      detected: 0,
      missing: 0,
      verify: 0,
    };

  const decision =
    decisionData?.decision ||
    "FURTHER_REVIEW_REQUIRED";

  const decisionLabel =
    decision === "COMPLIANCE_CONFIRMED"
      ? "Compliance Confirmed"
      : decision ===
        "POTENTIAL_NON_COMPLIANCE_CONFIRMED"
      ? "Potential Non-Compliance"
      : "Further Review Required";

  const generateReport = async () => {
    try {
      setGenerating(true);

      const rows = checks
        .map(
          (check: any) => `
            <tr>
              <td>${check.field}</td>
              <td>${check.value || "Not detected"}</td>
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
                padding: 28px;
                color: #222;
              }

              .header {
                background: #0E3557;
                color: white;
                padding: 24px;
                border-radius: 10px;
              }

              .title {
                font-size: 28px;
                font-weight: bold;
                margin: 0;
              }

              .subtitle {
                font-size: 13px;
                margin-top: 7px;
              }

              .section {
                margin-top: 24px;
              }

              .section-title {
                color: #0E3557;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }

              .info {
                background: #F6F9FC;
                padding: 15px;
                border-radius: 8px;
                margin-top: 10px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }

              th {
                background: #EAF3F9;
                color: #0E3557;
              }

              th, td {
                border: 1px solid #D9E2E8;
                padding: 8px;
                text-align: left;
                font-size: 10px;
              }

              .ocr {
                background: #F6F9FC;
                padding: 15px;
                border-radius: 8px;
                font-size: 9px;
                white-space: pre-wrap;
              }

              .warning {
                background: #FFF4E5;
                padding: 15px;
                border-radius: 8px;
                margin-top: 25px;
              }

              .footer {
                margin-top: 30px;
                font-size: 9px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>

          <body>

            <div class="header">
              <div class="title">
                METRIFY
              </div>

              <div class="subtitle">
                Legal Metrology Package Inspection Report
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                Inspection Details
              </div>

              <div class="info">
                <strong>Inspection ID:</strong>
                ${result.inspectionId}

                <br/><br/>

                <strong>Automated Status:</strong>
                ${result.ruleCompliance.status}

                <br/><br/>

                <strong>Officer Decision:</strong>
                ${decisionLabel}
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                Compliance Summary
              </div>

              <div class="info">
                Total Checks: ${summary.totalChecks}
                <br/><br/>
                Detected: ${summary.detected}
                <br/><br/>
                Missing: ${summary.missing}
                <br/><br/>
                Requires Verification: ${summary.verify}
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                Declaration Verification
              </div>

              <table>
                <tr>
                  <th>Declaration</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>

                ${rows}
              </table>
            </div>

            <div class="section">
              <div class="section-title">
                OCR Extracted Text
              </div>

              <div class="ocr">
                ${result.ocrText || "No OCR text available."}
              </div>
            </div>

            <div class="warning">
              <strong>
                Officer Verification Notice
              </strong>

              <p>
                This report is generated as an inspection
                aid. Automated OCR and rule checks do not
                independently establish legal compliance
                or non-compliance. Final determination
                remains subject to officer verification and
                applicable rules.
              </p>
            </div>

            <div class="footer">
              Generated by METRIFY
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
          "PDF was not generated."
        );
      }

      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(pdf.uri, {
          mimeType: "application/pdf",
          dialogTitle:
            "Share METRIFY Inspection Report",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "Report Generated",
          "The PDF report was generated successfully."
        );
      }
    } catch (error) {
      console.error(
        "METRIFY REPORT ERROR:",
        error
      );

      Alert.alert(
        "Report Error",
        "Unable to generate the PDF report."
      );
    } finally {
      setGenerating(false);
    }
  };
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
              Inspection Report
            </Text>

            <Text style={styles.headerSubtitle}>
              Final inspection summary
            </Text>
          </View>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >

          {/* REPORT READY */}

          <View style={styles.successCard}>

            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.successTitle}>
              Report Ready
            </Text>

            <Text style={styles.successText}>
              The inspection information has been
              collected and is ready to be generated
              as a PDF report.
            </Text>

          </View>


          {/* INSPECTION DETAILS */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Inspection Details
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Inspection ID
              </Text>

              <Text style={styles.detailValue}>
                {result.inspectionId}
              </Text>
            </View>


            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Automated Status
              </Text>

              <Text style={styles.detailValue}>
                {result.ruleCompliance.status}
              </Text>
            </View>


            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Officer Decision
              </Text>

              <Text style={styles.decisionValue}>
                {decisionLabel}
              </Text>
            </View>

          </View>


          {/* SUMMARY */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Verification Summary
            </Text>

            <View style={styles.summaryGrid}>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {summary.totalChecks}
                </Text>

                <Text style={styles.summaryLabel}>
                  Total
                </Text>
              </View>


              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {summary.detected}
                </Text>

                <Text style={styles.summaryLabel}>
                  Detected
                </Text>
              </View>


              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {summary.missing}
                </Text>

                <Text style={styles.summaryLabel}>
                  Missing
                </Text>
              </View>


              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {summary.verify}
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
              Declaration Results
            </Text>

            {checks.map(
              (check: any, index: number) => (

                <View
                  key={`${check.field}-${index}`}
                  style={styles.checkRow}
                >

                  <View style={styles.checkCircle}>

                    <Text style={styles.checkCircleText}>
                      {check.status === "DETECTED"
                        ? "✓"
                        : check.status === "MISSING"
                        ? "!"
                        : "?"}
                    </Text>

                  </View>


                  <View style={styles.checkContent}>

                    <Text style={styles.checkField}>
                      {check.field}
                    </Text>

                    <Text style={styles.checkValue}>
                      {check.value ||
                        "Not detected / requires verification"}
                    </Text>

                  </View>


                  <Text style={styles.checkStatus}>
                    {check.status}
                  </Text>

                </View>

              )
            )}

          </View>


          {/* PDF */}

          <View style={styles.pdfCard}>

            <Text style={styles.pdfTitle}>
              Generate Final Report
            </Text>

            <Text style={styles.pdfDescription}>
              Create a PDF containing the inspection
              details, declaration checks, OCR results,
              and officer decision.
            </Text>


            <Pressable
              onPress={generateReport}
              disabled={generating}
              style={styles.pdfButton}
            >

              {generating ? (

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


          {/* HOME */}

          <Pressable
            onPress={() => router.replace("/home")}
            style={styles.homeButton}
          >

            <Text style={styles.homeButtonText}>
              Back to Home
            </Text>

          </Pressable>


          <Text style={styles.footerText}>
            METRIFY provides inspection assistance.
            Final legal determination remains with the
            authorized officer.
          </Text>

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

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  successCard: {
    backgroundColor: "#EAF3F9",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D4E6F0",
  },

  successIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  successIconText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  successTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0E3557",
    marginTop: 10,
  },

  successText: {
    fontSize: 11,
    color: "#5E7180",
    lineHeight: 17,
    textAlign: "center",
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
    marginBottom: 12,
  },

  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  detailLabel: {
    fontSize: 10,
    color: "#718096",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#243B53",
    marginTop: 4,
  },

  decisionValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#155D91",
    marginTop: 4,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  summaryItem: {
    width: "48%",
    backgroundColor: "#F6F9FC",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0E3557",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircleText: {
    color: "#155D91",
    fontSize: 13,
    fontWeight: "800",
  },

  checkContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 6,
  },

  checkField: {
    fontSize: 12,
    fontWeight: "700",
    color: "#243B53",
  },

  checkValue: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  checkStatus: {
    fontSize: 8,
    fontWeight: "800",
    color: "#155D91",
    maxWidth: 70,
    textAlign: "right",
  },

  pdfCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  pdfTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
  },

  pdfDescription: {
    fontSize: 11,
    color: "#718096",
    lineHeight: 17,
    marginTop: 5,
  },

  pdfButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  pdfIcon: {
    color: "#FFFFFF",
    fontSize: 9,
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

  homeButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  homeButtonText: {
    color: "#155D91",
    fontSize: 13,
    fontWeight: "700",
  },

  footerText: {
    fontSize: 9,
    color: "#8A98A3",
    lineHeight: 14,
    textAlign: "center",
    marginTop: 18,
  },

  primaryButton: {
    backgroundColor: "#155D91",
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0E3557",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
  },

});
