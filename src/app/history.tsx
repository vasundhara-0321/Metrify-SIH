import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "__METRIFY_HISTORY__";

type HistoryItem = {
  inspectionId: string;
  decision: string;
  decisionLabel: string;
  date: string;
  summary: {
    totalChecks: number;
    detected: number;
    missing: number;
    verify: number;
  };
};

export default function HistoryScreen() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * Load history every time the History screen
   * becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);

      const savedHistory =
        await AsyncStorage.getItem(HISTORY_KEY);

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        } else {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error(
        "METRIFY HISTORY LOAD ERROR:",
        error
      );

      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.error(
        "METRIFY HISTORY CLEAR ERROR:",
        error
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerContent}>

            <Text style={styles.headerTitle}>
              Inspection History
            </Text>

            <Text style={styles.headerSubtitle}>
              Previous package inspections
            </Text>

          </View>

          {history.length > 0 && (
            <Pressable
              onPress={clearHistory}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>
                Clear
              </Text>
            </Pressable>
          )}

        </View>


        {/* CONTENT */}

        {loading ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color="#155D91"
            />

            <Text style={styles.loadingText}>
              Loading inspection history...
            </Text>

          </View>

        ) : (

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >

            {/* HISTORY COUNT */}

            {history.length > 0 && (

              <View style={styles.countCard}>

                <View>
                  <Text style={styles.countTitle}>
                    Saved Inspections
                  </Text>

                  <Text style={styles.countSubtitle}>
                    Stored locally on this device
                  </Text>
                </View>

                <Text style={styles.countNumber}>
                  {history.length}
                </Text>

              </View>

            )}


            {/* EMPTY STATE */}

            {history.length === 0 ? (

              <View style={styles.emptyCard}>

                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>
                    H
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No Inspection History
                </Text>

                <Text style={styles.emptyText}>
                  Completed inspections will appear here
                  after an officer records a final decision.
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  onPress={() =>
                    router.push("/scanner")
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Start New Inspection
                  </Text>

                  <Text style={styles.primaryArrow}>
                    →
                  </Text>
                </Pressable>

              </View>

            ) : (

              <>
                {/* HISTORY LIST */}

                {history.map((item, index) => (

                  <View
                    key={`${item.inspectionId}-${index}`}
                    style={styles.historyCard}
                  >

                    {/* TOP */}

                    <View style={styles.cardTop}>

                      <View style={styles.iconBox}>
                        <Text style={styles.iconText}>
                          ✓
                        </Text>
                      </View>

                      <View style={styles.cardTitleArea}>

                        <Text style={styles.cardTitle}>
                          Package Inspection
                        </Text>

                        <Text style={styles.inspectionId}>
                          {item.inspectionId}
                        </Text>

                      </View>

                    </View>


                    {/* DATE */}

                    <View style={styles.dateRow}>

                      <Text style={styles.dateLabel}>
                        Inspection Date
                      </Text>

                      <Text style={styles.dateValue}>
                        {item.date}
                      </Text>

                    </View>


                    {/* DECISION */}

                    <View style={styles.decisionRow}>

                      <Text style={styles.decisionLabel}>
                        Officer Decision
                      </Text>

                      <View
                        style={[
                          styles.decisionBadge,
                          item.decision ===
                            "COMPLIANCE_CONFIRMED" &&
                            styles.complianceBadge,
                          item.decision ===
                            "POTENTIAL_NON_COMPLIANCE_CONFIRMED" &&
                            styles.warningBadge,
                          item.decision ===
                            "FURTHER_REVIEW_REQUIRED" &&
                            styles.reviewBadge,
                        ]}
                      >

                        <Text
                          style={[
                            styles.decisionBadgeText,
                            item.decision ===
                              "COMPLIANCE_CONFIRMED" &&
                              styles.complianceText,
                            item.decision ===
                              "POTENTIAL_NON_COMPLIANCE_CONFIRMED" &&
                              styles.warningText,
                            item.decision ===
                              "FURTHER_REVIEW_REQUIRED" &&
                              styles.reviewText,
                          ]}
                        >
                          {item.decisionLabel}
                        </Text>

                      </View>

                    </View>


                    {/* SUMMARY */}

                    {item.summary && (

                      <View style={styles.summarySection}>

                        <Text style={styles.summaryTitle}>
                          Verification Summary
                        </Text>

                        <View style={styles.summaryRow}>

                          <View style={styles.summaryItem}>
                            <Text
                              style={styles.summaryNumber}
                            >
                              {item.summary.detected}
                            </Text>

                            <Text
                              style={styles.summaryLabel}
                            >
                              Detected
                            </Text>
                          </View>


                          <View style={styles.summaryItem}>
                            <Text
                              style={styles.summaryNumber}
                            >
                              {item.summary.missing}
                            </Text>

                            <Text
                              style={styles.summaryLabel}
                            >
                              Missing
                            </Text>
                          </View>


                          <View style={styles.summaryItem}>
                            <Text
                              style={styles.summaryNumber}
                            >
                              {item.summary.verify}
                            </Text>

                            <Text
                              style={styles.summaryLabel}
                            >
                              Verify
                            </Text>
                          </View>

                        </View>

                      </View>

                    )}

                  </View>

                ))}

              </>

            )}


            {/* FOOTER */}

            <Text style={styles.footerText}>
              METRIFY — Inspection assistance system
            </Text>

            <Text style={styles.storageNote}>
              Inspection history is stored locally on
              this device for offline access.
            </Text>

          </ScrollView>

        )}

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
    minHeight: 76,
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

  headerContent: {
    flex: 1,
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

  clearButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F6F9FC",
    borderWidth: 1,
    borderColor: "#DDE7ED",
  },

  clearButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#155D91",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    fontSize: 12,
    color: "#718096",
    marginTop: 12,
  },

  countCard: {
    backgroundColor: "#0E3557",
    borderRadius: 15,
    padding: 17,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  countTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  countSubtitle: {
    fontSize: 10,
    color: "#BFD5E5",
    marginTop: 4,
  },

  countNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#155D91",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0E3557",
    marginTop: 14,
  },

  emptyText: {
    fontSize: 11,
    color: "#718096",
    textAlign: "center",
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 18,
  },

  primaryButton: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: "#155D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  primaryArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 8,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E7EDF2",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EAF3F9",
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    color: "#155D91",
    fontSize: 18,
    fontWeight: "800",
  },

  cardTitleArea: {
    flex: 1,
    marginLeft: 11,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E3557",
  },

  inspectionId: {
    fontSize: 10,
    color: "#718096",
    marginTop: 3,
  },

  dateRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF1F4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateLabel: {
    fontSize: 10,
    color: "#718096",
  },

  dateValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#243B53",
  },

  decisionRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  decisionLabel: {
    fontSize: 10,
    color: "#718096",
  },

  decisionBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: "#EAF3F9",
    maxWidth: "65%",
  },

  decisionBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#155D91",
    textAlign: "right",
  },

  complianceBadge: {
    backgroundColor: "#EAF3F9",
  },

  complianceText: {
    color: "#155D91",
  },

  warningBadge: {
    backgroundColor: "#FFF4E5",
  },

  warningText: {
    color: "#8A5A00",
  },

  reviewBadge: {
    backgroundColor: "#F0F2F5",
  },

  reviewText: {
    color: "#5E7180",
  },

  summarySection: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EDF1F4",
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0E3557",
    marginBottom: 9,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },

  summaryItem: {
    flex: 1,
    backgroundColor: "#F6F9FC",
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0E3557",
  },

  summaryLabel: {
    fontSize: 8,
    color: "#718096",
    marginTop: 2,
  },

  footerText: {
    textAlign: "center",
    fontSize: 9,
    color: "#8A98A3",
    marginTop: 18,
  },

  storageNote: {
    textAlign: "center",
    fontSize: 8,
    color: "#A0ACB5",
    lineHeight: 13,
    marginTop: 4,
  },

});