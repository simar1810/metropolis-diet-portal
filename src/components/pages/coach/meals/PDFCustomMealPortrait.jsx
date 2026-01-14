import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
  Image,
  Font
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "/fonts/Noto-Sans-Devnagiri.ttf"
});

function createStyles(brand) {
  const primaryColor = brand?.primaryColor || "#f26b21";
  const bannerTextColor = brand?.textColor || "#ffffff";

  return StyleSheet.create({
    page: {
      padding: 24,
      fontFamily: "Roboto",
      fontSize: 10,
      backgroundColor: "#ffffff",
      color: "#1a1a1a"
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16
    },
    headerLogo: {
      width: 48,
      height: 48,
      objectFit: "cover",
      borderRadius: 8
    },
    headerTextBlock: {
      flex: 1,
      marginHorizontal: 12
    },
    planTitle: {
      fontSize: 18,
      marginBottom: 4,
      color: "#222222"
    },
    coachName: {
      fontSize: 10,
      color: "#555555"
    },
    tableContainer: {
      border: "1pt solid #f0f0f0",
      borderRadius: 6,
      overflow: "hidden"
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#ffffff",
      color: "#000000"
    },
    headerCell: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRight: "1pt solid rgba(255,255,255,0.35)"
    },
    headerCellText: {
      fontSize: 11,
      fontWeight: "bold"
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1pt solid #f0f0f0"
    },
    highlightRow: {
      backgroundColor: "#fff7f2"
    },
    tableCell: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRight: "1pt solid #f0f0f0",
      minHeight: 48
    },
    tableCellLast: {
      borderRight: "none"
    },
    dateText: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#333333"
    },
    mealTime: {
      fontSize: 9,
      color: primaryColor,
      marginBottom: 4,
      fontWeight: "bold"
    },
    mealItem: {
      fontSize: 9,
      lineHeight: 1.35,
      marginBottom: 2
    },
    placeholder: {
      fontSize: 9,
      color: "#bbbbbb"
    },
    notesSection: {
      marginTop: 16,
      padding: 12,
      borderRadius: 6,
      border: "1pt solid #f0f0f0",
      backgroundColor: "#fafafa"
    },
    notesHeading: {
      fontSize: 11,
      fontWeight: "bold",
      marginBottom: 4
    },
    noteText: {
      fontSize: 9,
      lineHeight: 1.4,
      marginBottom: 2
    }
  });
}

function resolveMealTypes(plans = [], fallback = []) {
  if (Array.isArray(fallback) && fallback.length > 0) return fallback;

  const collected = [];

  plans.forEach(plan => {
    plan?.meals?.forEach(meal => {
      if (meal?.mealType && !collected.includes(meal.mealType)) {
        collected.push(meal.mealType);
      }
    });
  });

  return collected;
}

export default function PDFCustomMealPortrait({ data = {}, brand = {} }) {
  const {
    title = "Custom Meal Plan",
    coachName,
    plans = [],
    mealTypes = [],
    selectedPlanKey,
    generalNotes = []
  } = data;

  const styles = createStyles(brand);

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <PDFViewer className="w-full h-full">
        <Document>
          <Page size="A4" style={styles.page}>
            <Text>No meal data available</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  const displayMealTypes = resolveMealTypes(plans, mealTypes);

  const renderMealItems = (meal) => {
    if (!meal || !Array.isArray(meal.items) || meal.items.length === 0) {
      return <Text style={styles.placeholder}>-</Text>;
    }

    return meal.items.map((item, idx) => {
      if (typeof item === "string") {
        return (
          <Text key={`meal-item-${idx}`} style={styles.mealItem}>
            - {item}
          </Text>
        );
      }

      return (
        <Text key={`meal-item-${idx}`} style={styles.mealItem}>
          - {item?.title || `Item ${idx + 1}`} {item?.details ? `: ${item.details}` : ""}
        </Text>
      );
    });
  };

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.headerRow}>
            {brand?.brandLogo ? (
              <Image src={brand.brandLogo} style={styles.headerLogo} />
            ) : null}

            <View style={styles.headerTextBlock}>
              <Text style={styles.planTitle}>{title}</Text>
              {coachName ? <Text style={styles.coachName}>Coach: {coachName}</Text> : null}
              {data.clientName ? (
                <View style={{ marginTop: 8, paddingTop: 6, borderTop: "0.5pt solid #f0f0f0" }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: "#444444", marginBottom: 2 }}>
                    Client: {data.clientName}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {data.clientAge ? (
                      <Text style={{ fontSize: 9, color: "#888888" }}>
                        Age: {data.clientAge}
                      </Text>
                    ) : null}
                    {data.clientAge && data.clientEmail ? (
                      <Text style={{ fontSize: 9, color: "#cccccc", marginHorizontal: 4 }}>|</Text>
                    ) : null}
                    {data.clientEmail ? (
                      <Text style={{ fontSize: 9, color: "#888888" }}>
                        {data.clientEmail}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>

            {brand?.coachLogo ? (
              <Image src={brand.coachLogo} style={styles.headerLogo} />
            ) : null}
          </View>

          {data.description && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>Description</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{data.description}</Text>
            </View>
          )}

          {data.guidelines && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>Guidelines</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{data.guidelines}</Text>
            </View>
          )}

          {data.supplements && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>Supplements</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{data.supplements}</Text>
            </View>
          )}

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.headerCell, { flex: 1 }]}>
                <Text style={styles.headerCellText}>Date</Text>
              </View>
              {displayMealTypes.map((type, index) => (
                <View
                  key={`header-${type}-${index}`}
                  style={[
                    styles.headerCell,
                    { flex: 1 },
                    index === displayMealTypes.length - 1 ? { borderRight: "none" } : null
                  ]}
                >
                  <Text style={styles.headerCellText}>{type}</Text>
                </View>
              ))}
            </View>

            {plans.map((plan, planIndex) => (
              <View
                key={`plan-row-${plan?.key || planIndex}`}
                style={[
                  styles.tableRow,
                  plan?.key === selectedPlanKey ? styles.highlightRow : null
                ]}
              >
                <View
                  style={[styles.tableCell, { flex: 1 }]}
                >
                  <Text style={styles.dateText}>{plan?.label || "Plan"}</Text>
                  {Array.isArray(plan?.notes) && plan.notes.length > 0 ? (
                    plan.notes.map((note, noteIdx) => (
                      <Text key={`plan-note-${noteIdx}`} style={styles.mealItem}>
                        • {note}
                      </Text>
                    ))
                  ) : null}
                </View>

                {displayMealTypes.map((type, index) => {
                  const meal = plan?.meals?.find(entry => entry?.mealType === type) || null;

                  return (
                    <View
                      key={`plan-${plan?.key || planIndex}-meal-${type}`}
                      style={[styles.tableCell, { flex: 1 }, index === displayMealTypes.length - 1 ? styles.tableCellLast : null]}
                    >
                      {meal?.timeWindow ? (
                        <Text style={styles.mealTime}>{meal.timeWindow}</Text>
                      ) : null}
                      {meal ? renderMealItems(meal) : <Text style={styles.placeholder}>-</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {Array.isArray(generalNotes) && generalNotes.length > 0 ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesHeading}>General Notes</Text>
              {generalNotes.map((note, idx) => (
                <Text key={`general-note-${idx}`} style={styles.noteText}>
                  - {note}
                </Text>
              ))}
            </View>
          ) : null}
        </Page>
      </Document>
    </PDFViewer>
  );
}

