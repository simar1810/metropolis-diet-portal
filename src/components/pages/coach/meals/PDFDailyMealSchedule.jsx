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
  src: "/assets/fonts/Roboto-Regular.ttf"
});

function createStyles(brand) {
  const primaryColor = brand?.primaryColor || "#f26b21";
  const bannerTextColor = brand?.textColor || "#ffffff";

  return StyleSheet.create({
    page: {
      padding: 28,
      fontFamily: "Roboto",
      backgroundColor: "#ffffff",
      fontSize: 11,
      color: "#1a1a1a"
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16
    },
    headerLogo: {
      width: 56,
      height: 56,
      objectFit: "cover",
      borderRadius: 8
    },
    headerTextBlock: {
      flex: 1,
      marginHorizontal: 12
    },
    planTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      color: "#222222"
    },
    coachName: {
      fontSize: 10,
      color: "#555555"
    },
    dateBanner: {
      backgroundColor: primaryColor,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginBottom: 16
    },
    dateBannerText: {
      color: bannerTextColor,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase"
    },
    mealSection: {
      borderRadius: 6,
      border: "1pt solid #f0f0f0",
      marginBottom: 12,
      overflow: "hidden"
    },
    mealHeader: {
      backgroundColor: primaryColor,
      paddingVertical: 6,
      paddingHorizontal: 10
    },
    mealHeaderText: {
      color: bannerTextColor,
      fontSize: 12,
      fontWeight: "bold"
    },
    mealBody: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: "#ffffff"
    },
    mealItem: {
      fontSize: 11,
      marginBottom: 6,
      lineHeight: 1.4
    },
    mealItemLabel: {
      fontWeight: "bold"
    },
    notesSection: {
      marginTop: 16,
      padding: 12,
      borderRadius: 6,
      border: "1pt solid #f0f0f0",
      backgroundColor: "#fafafa"
    },
    notesHeading: {
      fontWeight: "bold",
      marginBottom: 6,
      fontSize: 11
    },
    notesText: {
      fontSize: 10,
      lineHeight: 1.4
    }
  });
}

function buildMealHeading(meal) {
  const mealName = meal?.name || "Meal";
  const mealTime = meal?.timeWindow || meal?.time;

  if (!mealTime) return mealName;

  return `${mealName} (${mealTime})`;
}

export default function PDFDailyMealSchedule({ data = {}, brand = {} }) {
  const {
    title = "Daily Meal Schedule",
    coachName,
    date,
    dateLabel,
    meals = [],
    notes
  } = data;

  const styles = createStyles(brand);
  const bannerText = dateLabel || (date ? `Date - ${date}` : "Date -");

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
            </View>

            {brand?.coachLogo ? (
              <Image src={brand.coachLogo} style={styles.headerLogo} />
            ) : null}
          </View>

          <View style={styles.dateBanner}>
            <Text style={styles.dateBannerText}>{bannerText}</Text>
          </View>

          {data.description && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>Description</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{data.description}</Text>
            </View>
          )}

          {data.guidelines && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>Guidelines</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{data.guidelines}</Text>
            </View>
          )}

          {meals.map((meal, index) => (
            <View style={styles.mealSection} key={`${meal?.name || "meal"}-${index}`}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealHeaderText}>{buildMealHeading(meal)}</Text>
              </View>

              <View style={styles.mealBody}>
                {(meal?.items || []).map((item, itemIdx) => {
                  if (typeof item === "string") {
                    return (
                      <Text style={styles.mealItem} key={`string-item-${itemIdx}`}>
                        {`- ${item}`}
                      </Text>
                    );
                  }

                  const itemTitle = item?.title;
                  const itemDetails = item?.details;

                  if (!itemTitle) {
                    return (
                      <Text style={styles.mealItem} key={`anonymous-item-${itemIdx}`}>
                        {`- ${itemDetails || ""}`}
                      </Text>
                    );
                  }

                  return (
                    <Text style={styles.mealItem} key={`${itemTitle}-${itemIdx}`}>
                      <Text style={styles.mealItemLabel}>{`- ${itemTitle}`}</Text>
                      {itemDetails ? `: ${itemDetails}` : ""}
                    </Text>
                  );
                })}
              </View>
            </View>
          ))}

          {notes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesHeading}>Notes</Text>
              {Array.isArray(notes) ? (
                notes.map((note, idx) => (
                  <Text style={styles.notesText} key={`note-${idx}`}>
                    - {note}
                  </Text>
                ))
              ) : (
                <Text style={styles.notesText}>{notes}</Text>
              )}
            </View>
          ) : null}
        </Page>
      </Document>
    </PDFViewer>
  );
}

