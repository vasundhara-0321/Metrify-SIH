import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RESULT_KEY = "__METRIFY_RESULT__";
const HISTORY_KEY = "__METRIFY_HISTORY__";

type RuleCheck = {
  field: string;
  value: string | null;
  status:
    | "DETECTED"
    | "MISSING"
    | "VERIFY"
    | "NOT_APPLICABLE";
  rule: string;
};

type InspectionResult = {
  inspectionId: string;
  ocrText: string;
  ruleCompliance: {
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
};

export default function VerificationScreen() {
  const router = useRouter();

  const stored = globalThis as any;

  const result: InspectionResult | null =
    stored[RESULT_KEY] || null;

  const [verified, setVerified] = useState<
    Record<string, boolean>
  >({});

  const [finalDecision, setFinalDecision] =
    useState<string | null>(null);

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Verification Data Unavailable
          </Text>

          <Text style={styles.emptyText}>
            Please return to the inspection result and
            start verification again.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const checks = result.ruleCompliance.checks;

  const toggleVerification = (field: string) => {
    setVerified((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const verifiedCount = Object.values(verified).filter(
    Boolean
  ).length;

  const allVerified =
    verifiedCount === checks.length;

  const handleFinalReview = () => {
    if (!allVerified) {
      Alert.alert(
        "Verification Incomplete",
        "Please verify every declaration before continuing."
      );
      return;
    }

    Alert.alert(
      "Verification Complete",
      "All detected declarations have been reviewed. You can now proceed to the final report.",
      [
        {
          text: "Continue",
          onPress: () => {
            setFinalDecision("READY_FOR_FINAL_REVIEW");
          },
        },
      ]
    );
  };

  const handleDecision = async (decision: string) => {
    try {
      setFinalDecision(decision);

      // Save final decision for Report screen
      stored.__METRIFY_FINAL_DECISION__ = {
        inspectionId: result.inspectionId,
        decision,
        verified,
        verifiedCount,
        totalChecks: checks.length,
      };

      // Convert decision into readable text
      const decisionLabel =
        decision === "COMPLIANCE_CONFIRMED"
          ? "Compliance Confirmed"
          : decision ===
            "POTENTIAL_NON_COMPLIANCE_CONFIRMED"
          ? "Potential Non-Compliance"
          : "Further Review Required";

      // Create history record
      const historyItem = {
        inspectionId: result.inspectionId,
        decision,
        decisionLabel,
        date: new Date().toLocaleString(),
        summary: result.ruleCompliance.summary,
      };

      // Read existing history
      const savedHistory =
        await AsyncStorage.getItem(HISTORY_KEY);

      const existingHistory = savedHistory
        ? JSON.parse(savedHistory)
        : [];

      // Add latest inspection at the beginning
      const updatedHistory = [
        historyItem,
        ...existingHistory,
      ];

      // Save history permanently
      await AsyncStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

    } catch (error) {
      console.error(
        "METRIFY HISTORY SAVE ERROR:",
        error
      );

      Alert.alert(
        "Save Error",
        "The inspection decision could not be saved to history."
      );
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

          <View>
            <Text style={styles.headerTitle}>
              Officer Verification
            </Text>

            <Text style={styles.headerSubtitle}>
              Manual inspection required
            </Text>
          </View>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >

          {/* INSPECTION ID */}

          <View style={styles.idCard}>

            <Text style={styles.idLabel}>
              INSPECTION ID
            </Text>

            <Text style={styles.idValue}>
              {result.inspectionId}
            </Text>

          </View>


          {/* INSTRUCTION */}

          <View style={styles.instructionCard}>

            <View style={styles.instructionIcon}>
              <Text style={styles.instructionIconText}>
                i
              </Text>
            </View>

            <View style={styles.instructionContent}>

              <Text style={styles.instructionTitle}>
                Verify the physical package
              </Text>

              <Text style={styles.instructionText}>
                Compare the package with the declarations
                detected by METRIFY. Confirm each item
                physically before making a final decision.
              </Text>

            </View>

          </View>


          {/* PROGRESS */}

          <View style={styles.progressCard}>

            <View style={styles.progressTop}>

              <Text style={styles.progressTitle}>
                Verification Progress
              </Text>

              <Text style={styles.progressCount}>
                {verifiedCount}/{checks.length}
              </Text>

            </View>

            <View style={styles.progressTrack}>

              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      checks.length > 0
                        ? Math.round(
                            (verifiedCount /
                              checks.length) *
                              100
                          )
                        : 0
                    }%`,
                  },
                ]}
              />

            </View>

          </View>


          {/* CHECKLIST */}

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Declaration Verification
            </Text>

            <Text style={styles.cardSubtitle}>
              Tap each item after physically verifying it.
            </Text>


            {checks.map((check, index) => {

              const isVerified =
                verified[check.field] === true;

              return (
                <Pressable
                  key={`${check.field}-${index}`}
                  onPress={() =>
                    toggleVerification(check.field)
                  }
                  style={[
                    styles.checkItem,
                    isVerified &&
                      styles.checkItemVerified,
                  ]}
                >

                  <View
                    style={[
                      styles.checkbox,
                      isVerified &&
                        styles.checkboxChecked,
                    ]}
                  >

                    {isVerified && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}

                  </View>


                  <View style={styles.itemContent}>

                    <Text style={styles.itemTitle}>
                      {check.field}
                    </Text>

                    <Text style={styles.itemValue}>
                      {check.value ||
                        "Not detected — verify physically"}
                    </Text>

                    <Text style={styles.itemRule}>
                      {check.rule}
                    </Text>

                  </View>

                </Pressable>
              );
            })}

          </View>


          {/* DECISION */}

          {finalDecision ===
            "READY_FOR_FINAL_REVIEW" && (

            <View style={styles.decisionCard}>

              <Text style={styles.decisionTitle}>
                Final Officer Decision
              </Text>

              <Text style={styles.decisionText}>
                Based on your physical inspection, select
                the appropriate outcome.
              </Text>


              <Pressable
                onPress={() =>
                  handleDecision(
                    "COMPLIANCE_CONFIRMED"
                  )
                }
                style={styles.decisionButton}
              >
                <Text style={styles.decisionButtonText}>
                  Compliance Confirmed
                </Text>
              </Pressable>


              <Pressable
                onPress={() =>
                  handleDecision(
                    "POTENTIAL_NON_COMPLIANCE_CONFIRMED"
                  )
                }
                style={styles.decisionButtonSecondary}
              >
                <Text
                  style={
                    styles.decisionButtonSecondaryText
                  }
                >
                  Potential Non-Compliance
                </Text>
              </Pressable>


              <Pressable
                onPress={() =>
                  handleDecision(
                    "FURTHER_REVIEW_REQUIRED"
                  )
                }
                style={styles.decisionButtonOutline}
              >
                <Text
                  style={
                    styles.decisionButtonOutlineText
                  }
                >
                  Further Review Required
                </Text>
              </Pressable>

            </View>
          )}


          {/* FINAL RESULT */}

          {finalDecision &&
            finalDecision !==
              "READY_FOR_FINAL_REVIEW" && (

            <View style={styles.finalCard}>

              <View style={styles.finalIcon}>
                <Text style={styles.finalIconText}>
                  ✓
                </Text>
              </View>

              <Text style={styles.finalTitle}>
                Decision Recorded
              </Text>

              <Text style={styles.finalText}>
                {finalDecision ===
                "COMPLIANCE_CONFIRMED"
                  ? "Officer recorded that the package declarations were verified."
                  : finalDecision ===
                    "POTENTIAL_NON_COMPLIANCE_CONFIRMED"
                  ? "Officer recorded that potential non-compliance requires further action."
                  : "Officer recorded that further review is required."}
              </Text>


              <Pressable
                onPress={() =>
                  router.push("/report")
                }
                style={styles.reportButton}
              >
                <Text style={styles.reportButtonText}>
                  Continue to Report
                </Text>

                <Text style={styles.reportArrow}>
                  →
                </Text>
              </Pressable>

            </View>
          )}


          {/* ACTION */}

          {!finalDecision && (

            <Pressable
              onPress={handleFinalReview}
              style={[
                styles.primaryButton,
                !allVerified &&
                  styles.primaryButtonDisabled,
              ]}
            >

              <Text style={styles.primaryButtonText}>
                Complete Verification
              </Text>

              <Text style={styles.primaryArrow}>
                →
              </Text>

            </Pressable>

          )}


          <Text style={styles.footerNote}>
            METRIFY is an inspection-assistance system.
            The officer remains responsible for the final
            legal determination.
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
    marginTop: -3,
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

  idCard: {
    backgroundColor: "#0E3557",
    borderRadius: 14,
    padding: 17,
    marginBottom: 15,
  },

  idLabel: {
    fontSize: 9,
    color: "#BFD5E5",
    fontWeight: "700",
    letterSpacing: 1,
  },

  idValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 5,
  },

  instructionCard: {
    backgroundColor: "#EAF3F9",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D4E6F0",
  },

  instructionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  instructionIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  instructionContent: {
    flex: 1,
    marginLeft: 11,
  },

  instructionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E3557",
  },

  instructionText: {
    fontSize: 11,
    color: "#5E7180",
    lineHeight: 17,
    marginTop: 4,
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0E3557",
  },

  progressCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#155D91",
  },

  progressTrack: {
    height: 7,
    backgroundColor: "#E7EDF2",
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#155D91",
    borderRadius: 5,
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
    marginBottom: 12,
  },

  checkItem: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F4",
  },

  checkItemVerified: {
    backgroundColor: "#F3FAF6",
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#B7C6D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: "#155D91",
    borderColor: "#155D91",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#243B53",
  },

  itemValue: {
    fontSize: 11,
    color: "#155D91",
    marginTop: 4,
  },

  itemRule: {
    fontSize: 9,
    color: "#8997A3",
    lineHeight: 14,
    marginTop: 4,
  },

  decisionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDE7ED",
  },

  decisionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
  },

  decisionText: {
    fontSize: 11,
    color: "#718096",
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 15,
  },

  decisionButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  decisionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  decisionButtonSecondary: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FFF4E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EBCF9F",
  },

  decisionButtonSecondaryText: {
    color: "#8A5A00",
    fontSize: 13,
    fontWeight: "700",
  },

  decisionButtonOutline: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  decisionButtonOutlineText: {
    color: "#155D91",
    fontSize: 13,
    fontWeight: "700",
  },

  finalCard: {
    backgroundColor: "#EAF3F9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },

  finalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#155D91",
    alignItems: "center",
    justifyContent: "center",
  },

  finalIconText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  finalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0E3557",
    marginTop: 10,
  },

  finalText: {
    fontSize: 11,
    color: "#5E7180",
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  reportButton: {
    height: 48,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  reportArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 8,
  },

  primaryButton: {
    height: 52,
    borderRadius: 11,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonDisabled: {
    backgroundColor: "#AEBBC4",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  primaryArrow: {
    color: "#FFFFFF",
    fontSize: 19,
    marginLeft: 9,
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
  },

  emptyText: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
  },

  footerNote: {
    fontSize: 9,
    color: "#8A98A3",
    textAlign: "center",
    lineHeight: 14,
    marginTop: 18,
  },

});