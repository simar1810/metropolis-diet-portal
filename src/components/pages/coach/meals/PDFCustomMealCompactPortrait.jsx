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

  return StyleSheet.create({
    page: {
      padding: 20,
      fontFamily: "Roboto",
      fontSize: 10,
      backgroundColor: "#ffffff",
      color: "#1a1a1a"
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    },
    headerLogo: {
      width: 44,
      height: 44,
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
    cardsContainer: {
      flexDirection: "column"
    },
    dayCard: {
      borderRadius: 8,
      border: "1pt solid #f0f0f0",
      padding: 12,
      backgroundColor: "#ffffff",
      marginBottom: 12
    },
    selectedCard: {
      borderColor: primaryColor,
      backgroundColor: "#fff7f2"
    },
    dayHeader: {
      fontSize: 12,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 6
    },
    mealBlock: {
      marginBottom: 8,
      borderBottom: "1pt dashed #efefef",
      paddingBottom: 6
    },
    mealBlockLast: {
      borderBottom: "none",
      paddingBottom: 0
    },
    mealTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2
    },
    mealTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#222222"
    },
    mealTime: {
      fontSize: 9,
      color: "#777777"
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
    notesHeading: {
      fontSize: 10,
      fontWeight: "bold",
      marginTop: 6,
      marginBottom: 2
    },
    noteText: {
      fontSize: 9,
      lineHeight: 1.35,
      marginBottom: 2
    },
    generalNotes: {
      marginTop: 14,
      borderRadius: 8,
      border: "1pt solid #f0f0f0",
      backgroundColor: "#fafafa",
      padding: 12
    }
  });
}

export default function PDFCustomMealCompactPortrait({ data = {}, brand = {} }) {
  const {
    title = "Custom Meal Plan",
    coachName,
    plans = [],
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

  const renderMealItems = (meal) => {
    if (!meal || !Array.isArray(meal.items) || meal.items.length === 0) {
      return <Text style={styles.placeholder}>-</Text>;
    }

    return meal.items.map((item, idx) => (
      <Text key={`meal-item-${idx}`} style={styles.mealItem}>
        - {typeof item === "string" ? item : `${item?.title || `Item ${idx + 1}`}${item?.details ? `: ${item.details}` : ""}`}
      </Text>
    ));
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

          <View style={styles.cardsContainer}>
            {plans.map((plan, index) => (
              <View
                key={`plan-card-${plan?.key || index}`}
                style={[
                  styles.dayCard,
                  plan?.key === selectedPlanKey ? styles.selectedCard : null
                ]}
              >
                <Text style={styles.dayHeader}>{plan?.label || `Plan ${index + 1}`}</Text>

                {Array.isArray(plan?.meals) && plan.meals.length > 0 ? (
                  plan.meals.map((meal, mealIndex) => (
                    <View
                      key={`meal-block-${meal?.mealType || mealIndex}`}
                      style={[
                        styles.mealBlock,
                        mealIndex === plan.meals.length - 1 ? styles.mealBlockLast : null
                      ]}
                    >
                      <View style={styles.mealTitleRow}>
                        <Text style={styles.mealTitle}>{meal?.mealType || `Meal ${mealIndex + 1}`}</Text>
                        {meal?.timeWindow ? <Text style={styles.mealTime}>{meal.timeWindow}</Text> : null}
                      </View>
                      {renderMealItems(meal)}
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholder}>No meals configured</Text>
                )}

                {Array.isArray(plan?.notes) && plan.notes.length > 0 ? (
                  <View>
                    <Text style={styles.notesHeading}>Notes</Text>
                    {plan.notes.map((note, noteIdx) => (
                      <Text key={`plan-note-${noteIdx}`} style={styles.noteText}>
                        - {note}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          {Array.isArray(generalNotes) && generalNotes.length > 0 ? (
            <View style={styles.generalNotes}>
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


