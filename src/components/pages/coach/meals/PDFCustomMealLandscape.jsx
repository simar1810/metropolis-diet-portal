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
  const headerTextColor = brand?.textColor || "#ffffff";

  return StyleSheet.create({
    page: {
      padding: 22,
      fontFamily: "Roboto",
      fontSize: 10,
      backgroundColor: "#ffffff",
      color: "#1a1a1a"
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    },
    headerLogo: {
      width: 48,
      height: 48,
      borderRadius: 8,
      objectFit: "cover"
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
    tableWrapper: {
      border: "1pt solid #f0f0f0",
      borderRadius: 6,
      overflow: "hidden"
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#ffffff",
      color: "#000000",
      borderBottom: "1px solid #000000"
    },
    headerCell: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRight: "1pt solid rgba(255,255,255,0.35)",
      fontWeight: "bold"
    },
    row: {
      flexDirection: "row",
      borderBottom: "1pt solid #f0f0f0"
    },
    rowHighlight: {
      backgroundColor: "#fff7f2"
    },
    cell: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRight: "1pt solid #f0f0f0",
      minHeight: 52
    },
    cellLast: {
      borderRight: "none"
    },
    mealTypeCell: {
      backgroundColor: "#fafafa",
      fontWeight: "bold"
    },
    mealTypeText: {
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
    footerNotes: {
      marginTop: 14,
      flexDirection: "row"
    },
    noteBlock: {
      flex: 1,
      border: "1pt solid #f0f0f0",
      borderRadius: 6,
      padding: 10,
      backgroundColor: "#fafafa"
    },
    noteHeading: {
      fontSize: 11,
      fontWeight: "bold",
      marginBottom: 4
    },
    noteText: {
      fontSize: 9,
      lineHeight: 1.35,
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

export default function PDFCustomMealLandscape({ data = {}, brand = {} }) {
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
          <Page size="A4" orientation="landscape" style={styles.page}>
            <Text>No meal data available</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  const displayMealTypes = resolveMealTypes(plans, mealTypes);

  const renderMealContent = (plan, type) => {
    const meal = plan?.meals?.find(entry => entry?.mealType === type) || null;

    if (!meal) {
      return <Text style={styles.placeholder}>-</Text>;
    }

    return (
      <View>
        {meal.timeWindow ? <Text style={styles.mealTime}>{meal.timeWindow}</Text> : null}
        {Array.isArray(meal.items) && meal.items.length > 0
          ? meal.items.map((item, idx) => (
            <Text key={`meal-${plan?.key}-${type}-${idx}`} style={styles.mealItem}>
              - {typeof item === "string" ? item : `${item?.title || `Item ${idx + 1}`}${item?.details ? `: ${item.details}` : ""}`}
            </Text>
          ))
          : <Text style={styles.placeholder}>-</Text>}
      </View>
    );
  };

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
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

          <View style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              <View style={[styles.headerCell, { flex: 1.2 }]}>
                <Text>Meal Type</Text>
              </View>
              {plans.map((plan, index) => (
                <View
                  key={`header-plan-${plan?.key || index}`}
                  style={[styles.headerCell, { flex: 1 }, index === plans.length - 1 ? { borderRight: "none" } : null]}
                >
                  <Text>{plan?.label || `Plan ${index + 1}`}</Text>
                </View>
              ))}
            </View>

            {displayMealTypes.map((type, rowIdx) => (
              <View key={`meal-type-row-${type}-${rowIdx}`} style={styles.row}>
                <View style={[styles.cell, styles.mealTypeCell, { flex: 1.2 }]}>
                  <Text style={styles.mealTypeText}>{type}</Text>
                </View>

                {plans.map((plan, planIdx) => (
                  <View
                    key={`plan-${plan?.key || planIdx}-type-${type}`}
                    style={[
                      styles.cell,
                      { flex: 1 },
                      plan?.key === selectedPlanKey ? styles.rowHighlight : null,
                      planIdx === plans.length - 1 ? styles.cellLast : null
                    ]}
                  >
                    {renderMealContent(plan, type)}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {Array.isArray(generalNotes) && generalNotes.length > 0 ? (
            <View style={styles.footerNotes}>
              <View style={styles.noteBlock}>
                <Text style={styles.noteHeading}>General Notes</Text>
                {generalNotes.map((note, idx) => (
                  <Text key={`general-note-${idx}`} style={styles.noteText}>
                    - {note}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
        </Page>
      </Document>
    </PDFViewer>
  );
}

