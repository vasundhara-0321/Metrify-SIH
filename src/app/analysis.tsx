import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const IMAGE_KEY = "__METRIFY_IMAGE_URI__";

const API_BASE_URL = "http://172.17.36.57:5000";

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

export default function AnalysisScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [ocrText, setOcrText] = useState("");
  const [inspectionId, setInspectionId] = useState("");

  const [ruleCompliance, setRuleCompliance] =
    useState<RuleCompliance | null>(null);

  const [analysisError, setAnalysisError] = useState(false);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const storedImage = globalThis as any;

    if (storedImage[IMAGE_KEY]) {
      console.log("METRIFY: Analysis image:", storedImage[IMAGE_KEY]);
      setImageUri(storedImage[IMAGE_KEY]);
    }
  }, []);

  useEffect(() => {
    if (imageUri) {
      analyzePackage();
    }
  }, [imageUri]);

  const analyzePackage = async () => {
    if (!imageUri) return;

    try {
      setIsAnalyzing(true);
      setAnalysisComplete(false);
      setAnalysisError(false);

      console.log("=================================");
      console.log("METRIFY: Starting package analysis");
      console.log("Image URI:", imageUri);
      console.log("=================================");

      const file = new File(imageUri);

      const formData = new FormData();

      formData.append("image", file as any);

      console.log("METRIFY: Sending image to backend...");

      const response = await fetch(
        `${API_BASE_URL}/api/inspection/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("METRIFY: Backend status:", response.status);

      const data = await response.json();

      console.log(
        "METRIFY: Backend response:",
        JSON.stringify(data)
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Package analysis failed."
        );
      }

      setInspectionId(data.inspectionId || "");

      setOcrText(
        data?.ocr?.text ||
          "No readable text was detected from the package."
      );

      setRuleCompliance(data?.ruleCompliance || null);
      (globalThis as any).__METRIFY_RESULT__ = {
  inspectionId: data.inspectionId || "",
  ocrText:
    data?.ocr?.text ||
    "No readable text was detected from the package.",
  ruleCompliance: data?.ruleCompliance || null,
};
      setAnalysisComplete(true);

      console.log("METRIFY: Analysis completed.");
    } catch (error) {
      console.error("METRIFY: Analysis error:", error);
      setAnalysisError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retryAnalysis = () => {
    analyzePackage();
  };

  const goToResult = () => {
    router.push("/result");
  };

  const generatePDF = async () => {
    if (!ruleCompliance) {
      Alert.alert(
        "Analysis Required",
        "Please complete the analysis first."
      );
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const checksHTML = ruleCompliance.checks
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
            <meta name="viewport"
              content="width=device-width, initial-scale=1.0" />

            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 24px;
                color: #222;
              }

              .header {
                background: #0E3557;
                color: white;
                padding: 20px;
                border-radius: 8px;
              }

              h1 {
                margin: 0;
                font-size: 26px;
              }

              h2 {
                color: #0E3557;
                margin-top: 25px;
              }

              .info {
                background: #F6F9FC;
                padding: 12px;
                margin-top: 15px;
                border-radius: 6px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
              }

              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
                font-size: 11px;
              }

              th {
                background: #EAF3F9;
              }

              .warning {
                background: #FFF4E5;
                padding: 12px;
                margin-top: 20px;
                border-radius: 6px;
              }

              .ocr {
                white-space: pre-wrap;
                background: #F6F9FC;
                padding: 12px;
                font-size: 10px;
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
              ${inspectionId || "N/A"}

              <br/><br/>

              <strong>Automated Status:</strong>
              ${ruleCompliance.status}
            </div>

            <h2>Compliance Summary</h2>

            <div class="info">
              Total Checks:
              ${ruleCompliance.summary.totalChecks}

              <br/>

              Detected:
              ${ruleCompliance.summary.detected}

              <br/>

              Missing:
              ${ruleCompliance.summary.missing}

              <br/>

              Verification Required:
              ${ruleCompliance.summary.verify}
            </div>

            <h2>Declaration Checks</h2>

            <table>

              <tr>
                <th>Declaration</th>
                <th>Detected Value</th>
                <th>Status</th>
              </tr>

              ${checksHTML}

            </table>

            <h2>OCR Extracted Text</h2>

            <div class="ocr">
              ${ocrText || "No readable text detected."}
            </div>

            <div class="warning">

              <strong>Officer Verification Required</strong>

              <p>
                This report is an automated inspection aid.
                OCR results may contain recognition errors.
                Automated analysis does not establish legal compliance.
                Final determination must be made by the authorized
                officer after physical verification and application
                of the relevant rules.
              </p>

            </div>

            <p style="margin-top:30px;font-size:10px;">
              Rule Set: ${ruleCompliance.ruleSet}
            </p>

          </body>
        </html>
      `;

      console.log("METRIFY: Generating PDF...");

      const result = await Print.printToFileAsync({
        html,
      });

      console.log(
        "METRIFY: PDF generated:",
        result.uri
      );

      if (!result.uri) {
        throw new Error(
          "PDF file URI was not generated."
        );
      }

      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert(
          "PDF Generated",
          "The PDF was generated successfully."
        );

        return;
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: "application/pdf",
        dialogTitle:
          "Share METRIFY Inspection Report",
        UTI: "com.adobe.pdf",
      });

    } catch (error) {
      console.error(
        "METRIFY: PDF error:",
        error
      );

      Alert.alert(
        "PDF Error",
        "The inspection report could not be shared."
      );
    } finally {
      setIsGeneratingPDF(false);
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
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Package Analysis
            </Text>

            <Text style={styles.headerSubtitle}>
              METRIFY Inspection
            </Text>
          </View>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* PACKAGE IMAGE */}

          {imageUri && (
            <View style={styles.imageCard}>

              <Text style={styles.sectionLabel}>
                PACKAGE IMAGE
              </Text>

              <Image
                source={{ uri: imageUri }}
                style={styles.packageImage}
                resizeMode="contain"
              />

            </View>
          )}


          {/* ANALYSIS PROGRESS */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Analysis Progress
            </Text>

            <Text style={styles.cardSubtitle}>
              Automated inspection workflow
            </Text>


            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: analysisComplete
                      ? "100%"
                      : isAnalyzing
                      ? "55%"
                      : "10%",
                  },
                ]}
              />
            </View>


            <View style={styles.progressRow}>

              <View style={styles.stepCircleCompleted}>
                <Text style={styles.stepIcon}>
                  ✓
                </Text>
              </View>

              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>
                  Image Processing
                </Text>

                <Text style={styles.stepSubtitle}>
                  Package image received
                </Text>
              </View>

            </View>


            <View style={styles.progressRow}>

              <View
                style={
                  isAnalyzing || analysisComplete
                    ? styles.stepCircleCompleted
                    : styles.stepCircle
                }
              >
                <Text
                  style={
                    isAnalyzing || analysisComplete
                      ? styles.stepIcon
                      : styles.stepNumber
                  }
                >
                  {isAnalyzing || analysisComplete
                    ? "✓"
                    : "2"}
                </Text>
              </View>

              <View style={styles.stepTextContainer}>

                <Text style={styles.stepTitle}>
                  OCR Text Extraction
                </Text>

                <Text style={styles.stepSubtitle}>
                  {isAnalyzing
                    ? "Reading package text..."
                    : analysisComplete
                    ? "Text extraction completed"
                    : "Waiting"}
                </Text>

              </View>

            </View>


            <View style={styles.progressRow}>

              <View
                style={
                  analysisComplete
                    ? styles.stepCircleCompleted
                    : styles.stepCircle
                }
              >
                {analysisComplete ? (
                  <Text style={styles.stepIcon}>
                    ✓
                  </Text>
                ) : (
                  <Text style={styles.stepNumber}>
                    3
                  </Text>
                )}
              </View>

              <View style={styles.stepTextContainer}>

                <Text style={styles.stepTitle}>
                  Declaration Detection
                </Text>

                <Text style={styles.stepSubtitle}>
                  {analysisComplete
                    ? "Declarations analyzed"
                    : "Waiting"}
                </Text>

              </View>

            </View>


            <View style={styles.progressRow}>

              <View
                style={
                  analysisComplete
                    ? styles.stepCircleCompleted
                    : styles.stepCircle
                }
              >

                {analysisComplete ? (
                  <Text style={styles.stepIcon}>
                    ✓
                  </Text>
                ) : (
                  <Text style={styles.stepNumber}>
                    4
                  </Text>
                )}

              </View>


              <View style={styles.stepTextContainer}>

                <Text style={styles.stepTitle}>
                  Rule Compliance
                </Text>

                <Text style={styles.stepSubtitle}>
                  {analysisComplete
                    ? "Legal Metrology rules checked"
                    : "Waiting"}
                </Text>

              </View>

            </View>


            <View style={styles.progressRowLast}>

              <View
                style={
                  analysisComplete
                    ? styles.stepCircleCompleted
                    : styles.stepCircle
                }
              >

                {analysisComplete ? (
                  <Text style={styles.stepIcon}>
                    ✓
                  </Text>
                ) : (
                  <Text style={styles.stepNumber}>
                    5
                  </Text>
                )}

              </View>


              <View style={styles.stepTextContainer}>

                <Text style={styles.stepTitle}>
                  Result Preparation
                </Text>

                <Text style={styles.stepSubtitle}>
                  {analysisComplete
                    ? "Inspection result ready"
                    : "Waiting"}
                </Text>

              </View>

            </View>

          </View>


          {/* LOADING */}

          {isAnalyzing && (

            <View style={styles.processingCard}>

              <ActivityIndicator
                size="small"
                color="#155D91"
              />

              <View style={styles.processingText}>

                <Text style={styles.processingTitle}>
                  Analyzing package...
                </Text>

                <Text style={styles.processingSubtitle}>
                  OCR and compliance checks are being
                  performed.
                </Text>

              </View>

            </View>

          )}


          {/* ERROR */}

          {analysisError && (

            <View style={styles.errorCard}>

              <Text style={styles.errorTitle}>
                Analysis Failed
              </Text>

              <Text style={styles.errorText}>
                The package could not be analyzed.
                Please try again.
              </Text>

              <Pressable
                onPress={retryAnalysis}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
                  Retry Analysis
                </Text>
              </Pressable>

            </View>

          )}


          {/* OCR RESULTS */}

          {analysisComplete && (

            <View style={styles.card}>

              <View style={styles.sectionHeaderRow}>

                <View>
                  <Text style={styles.cardTitle}>
                    OCR Results
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    Text detected from the package
                  </Text>
                </View>

                <View style={styles.successBadge}>
                  <Text style={styles.successBadgeText}>
                    COMPLETED
                  </Text>
                </View>

              </View>


              <View style={styles.ocrPreview}>

                <Text style={styles.ocrText}>
                  {ocrText || "No readable text detected."}
                </Text>

              </View>

            </View>

          )}


          {/* RULE COMPLIANCE */}

          {analysisComplete &&
            ruleCompliance && (

              <View style={styles.card}>

                <View style={styles.sectionHeaderRow}>

                  <View>
                    <Text style={styles.cardTitle}>
                      Rule Compliance
                    </Text>

                    <Text style={styles.cardSubtitle}>
                      Automated Legal Metrology checks
                    </Text>
                  </View>

                  <View style={styles.ruleBadge}>
                    <Text style={styles.ruleBadgeText}>
                      CHECKED
                    </Text>
                  </View>

                </View>


                {/* SUMMARY */}

                <View style={styles.summaryRow}>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>
                      {ruleCompliance.summary.detected}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      Detected
                    </Text>
                  </View>


                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>
                      {ruleCompliance.summary.missing}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      Missing
                    </Text>
                  </View>


                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>
                      {ruleCompliance.summary.verify}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      Verify
                    </Text>
                  </View>

                </View>


                {/* CHECKS */}

                <View style={styles.checkList}>

                  {ruleCompliance.checks.map(
                    (check, index) => (

                      <View
                        key={`${check.field}-${index}`}
                        style={styles.checkRow}
                      >

                        <View style={styles.checkTextArea}>

                          <Text style={styles.checkField}>
                            {check.field}
                          </Text>

                          {check.value && (
                            <Text
                              style={styles.checkValue}
                              numberOfLines={2}
                            >
                              {check.value}
                            </Text>
                          )}

                        </View>


                        <View
                          style={[
                            styles.statusBadge,
                            check.status === "DETECTED" &&
                              styles.statusDetected,
                            check.status === "MISSING" &&
                              styles.statusMissing,
                            check.status === "VERIFY" &&
                              styles.statusVerify,
                          ]}
                        >

                          <Text
                            style={[
                              styles.statusText,
                              check.status === "DETECTED" &&
                                styles.statusDetectedText,
                              check.status === "MISSING" &&
                                styles.statusMissingText,
                              check.status === "VERIFY" &&
                                styles.statusVerifyText,
                            ]}
                          >
                            {check.status ===
                            "NOT_APPLICABLE"
                              ? "N/A"
                              : check.status}
                          </Text>

                        </View>

                      </View>

                    )
                  )}

                </View>

              </View>
            )}
            {/* RESULT ACTION */}

          {analysisComplete &&
            ruleCompliance && (

              <View style={styles.actionCard}>

                <View style={styles.actionIconCircle}>
                  <Text style={styles.actionIcon}>
                    ✓
                  </Text>
                </View>

                <Text style={styles.actionTitle}>
                  Analysis Completed
                </Text>

                <Text style={styles.actionSubtitle}>
                  OCR extraction and automated rule checks
                  are complete. Review the inspection result
                  before making the final decision.
                </Text>


                <Pressable
                  onPress={goToResult}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    View Inspection Result
                  </Text>

                  <Text style={styles.primaryButtonArrow}>
                    →
                  </Text>
                </Pressable>


                <Pressable
                  onPress={generatePDF}
                  disabled={isGeneratingPDF}
                  style={styles.secondaryButton}
                >

                  {isGeneratingPDF ? (
                    <ActivityIndicator
                      size="small"
                      color="#155D91"
                    />
                  ) : (
                    <Text style={styles.secondaryButtonText}>
                      Generate PDF Report
                    </Text>
                  )}

                </Pressable>

              </View>

            )}


          {/* INSPECTION ID */}

          {inspectionId && (

            <View style={styles.inspectionIdCard}>

              <Text style={styles.inspectionIdLabel}>
                INSPECTION ID
              </Text>

              <Text style={styles.inspectionIdValue}>
                {inspectionId}
              </Text>

            </View>

          )}


          {/* DISCLAIMER */}

          {analysisComplete &&
            ruleCompliance && (

              <View style={styles.disclaimerCard}>

                <Text style={styles.disclaimerTitle}>
                  Officer Verification Required
                </Text>

                <Text style={styles.disclaimerText}>
                  Automated analysis is an inspection aid.
                  OCR results do not establish legal
                  compliance. Final determination requires
                  officer verification and applicable
                  commodity-specific rules.
                </Text>

              </View>

            )}

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
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EDF3",
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
    lineHeight: 32,
    color: "#0E3557",
    marginTop: -2,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0E3557",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 3,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#718096",
    marginBottom: 10,
  },

  packageImage: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    backgroundColor: "#F1F5F8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EEF3",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
    lineHeight: 17,
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#E6EEF4",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 20,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#155D91",
    borderRadius: 5,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },

  progressRowLast: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F4F7",
    borderWidth: 1,
    borderColor: "#D8E2E9",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleCompleted: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  stepIcon: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  stepNumber: {
    color: "#8796A5",
    fontSize: 12,
    fontWeight: "700",
  },

  stepTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#243B53",
  },

  stepSubtitle: {
    fontSize: 11,
    color: "#8A98A8",
    marginTop: 2,
  },

  processingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3F9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  processingText: {
    flex: 1,
    marginLeft: 12,
  },

  processingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E3557",
  },

  processingSubtitle: {
    fontSize: 11,
    color: "#5F7182",
    marginTop: 3,
    lineHeight: 16,
  },

  errorCard: {
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F0CACA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#A33A3A",
  },

  errorText: {
    fontSize: 12,
    color: "#704444",
    marginTop: 5,
    lineHeight: 18,
  },

  retryButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  successBadge: {
    backgroundColor: "#E8F6EF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 8,
  },

  successBadgeText: {
    color: "#26734D",
    fontSize: 9,
    fontWeight: "800",
  },

  ruleBadge: {
    backgroundColor: "#EAF3F9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 8,
  },

  ruleBadgeText: {
    color: "#155D91",
    fontSize: 9,
    fontWeight: "800",
  },

  ocrPreview: {
    backgroundColor: "#F6F9FC",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    maxHeight: 230,
  },

  ocrText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#465A6B",
  },

  summaryRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: "#F6F9FC",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0E3557",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  checkList: {
    marginTop: 16,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  checkTextArea: {
    flex: 1,
    paddingRight: 8,
  },

  checkField: {
    fontSize: 13,
    fontWeight: "600",
    color: "#243B53",
  },

  checkValue: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  statusBadge: {
    minWidth: 70,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    alignItems: "center",
  },

  statusDetected: {
    backgroundColor: "#E8F6EF",
  },

  statusMissing: {
    backgroundColor: "#FDECEC",
  },

  statusVerify: {
    backgroundColor: "#FFF4E5",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  statusDetectedText: {
    color: "#26734D",
  },

  statusMissingText: {
    color: "#A33A3A",
  },

  statusVerifyText: {
    color: "#9A6500",
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EEF3",
  },

  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F6EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionIcon: {
    fontSize: 22,
    color: "#26734D",
    fontWeight: "800",
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
    textAlign: "center",
  },

  actionSubtitle: {
    fontSize: 11,
    color: "#718096",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 18,
  },

  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 11,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  primaryButtonArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
  },

  secondaryButton: {
    width: "100%",
    height: 46,
    borderRadius: 11,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "#155D91",
    fontSize: 13,
    fontWeight: "700",
  },

  inspectionIdCard: {
    backgroundColor: "#0E3557",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  inspectionIdLabel: {
    color: "#BFD5E5",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  inspectionIdValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
  },

  disclaimerCard: {
    backgroundColor: "#FFF8EC",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
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
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

});