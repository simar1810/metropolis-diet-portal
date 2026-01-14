import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";

// Register custom font
Font.register({ family: "NotoSans", src: "/fonts/Roboto-Regular.ttf" });

// Styles
const getStyles = function (brand) {
  return StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 10,
      fontFamily: "Helvetica",
    },
    brandTitle: {
      fontSize: 20,
      textAlign: "center",
      color: brand.primaryColor,
      fontWeight: "bold",
      marginBottom: 2,
    },
    subHeader: {
      textAlign: "center",
      fontSize: 14,
      marginBottom: 10,
    },
    infoBox: {
      backgroundColor: brand.primaryColor,
      padding: 10,
      borderRadius: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    leftInfo: {
      color: "white",
    },
    rightInfo: {
      color: "white",
      textAlign: "right",
    },
    name: {
      fontWeight: "bold",
      fontSize: 12,
    },
    meta: {
      fontSize: 10,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: "bold",
    },
    description: {
      marginBottom: 10,
    },
    metricRow: {
      backgroundColor: "#F0F9F8",
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      marginBottom: "10px",
      borderRadius: "8px"
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 6,
      objectFit: "contain",
      zIndex: 100,
    },
    metricText: {
      flex: 1,
    },
    metricTitle: {
      fontWeight: "bold",
    },
    metricNote: {
      fontSize: 8,
      color: "#666",
    },
    metricValue: {
      width: 60,
      fontWeight: "bold",
      color: "#0c8848",
    },
    metricStatus: {
      width: 60,
      fontSize: 9,
      color: "#cc0000",
    },
    progressContainer: {
      width: "100%",
      height: 6,
      backgroundColor: "#e0e0e0",
      borderRadius: 3,
      marginTop: 4,
    },
    disclaimer: {
      fontSize: 8,
      color: "#999",
      marginTop: 20,
      borderTop: "1 solid #ccc",
      paddingTop: 10,
    },
    leftSection: {
      width: "85%",
      paddingTop: 50,
      paddingRight: 30,
    },
    rightStrip: {
      width: "15%",
      height: "100%",
    },
    logo: {
      height: 50,
      alignSelf: "center",
      marginBottom: 10,
    },
    heading: {
      fontSize: 20,
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 10,
    },
    greenBox: {
      backgroundColor: "#FFA500",
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      marginBottom: 10,
    },
    whiteText: {
      color: "#fff",
      fontSize: 14,
    },
    table: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#aaa",
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#aaa",
    },
    cell: {
      flex: 1,
      padding: 5,
      fontSize: 10,
    },
    footerStrip: {
      marginTop: 20,
      textAlign: "center",
      fontSize: 8,
      color: "#98D89E",
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: "#98D89E",
      marginVertical: 10,
    },
    flowerStack: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20,
    },
    suggestionStrip: {
      backgroundColor: "#98D89E",
      color: "white",
      padding: 8,
      fontSize: 12,
      textAlign: "center",
      marginVertical: 15,
      borderRadius: 5,
    },
    boldText: {
      fontWeight: "bold",
      fontSize: 14,
      marginVertical: 10,
    },
    paragraph: {
      fontSize: 12,
      lineHeight: 1.5,
      marginVertical: 10,
    },
    containerBox: {
      position: "relative",
      marginVertical: 10,
    },
    containerOverlay: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
    },
    boxTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
    boxTitleGreen: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#5CB85C",
    },
    boxTitleRed: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#D9534F",
    },
    boxContent: {
      fontSize: 11,
      lineHeight: 1.5,
    },
    bottomBanner: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      padding: 12,
      backgroundColor: "#fff", // Optional: set background to avoid overlap issues
      borderTopWidth: 1,
      borderColor: "#ccc",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 10,
    },
    bodyWeightCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#4CAF50",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginVertical: 10,
    },
    bodyWeightText: {
      color: "#ffffff",
      fontSize: 12,
      textAlign: "center",
    },
    optimalWeightBox: {
      backgroundColor: "#4CAF50",
      borderColor: "#ffc107",
      borderWidth: 1,
      padding: 4,
      fontSize: 9,
      marginVertical: 5,
      textAlign: "center",
    },
    boldHighlight: {
      fontWeight: "bold",
      fontSize: 11,
    },
    whyHeader: {
      color: "#ff9800",
      fontWeight: "bold",
      fontSize: 12,
      marginTop: 10,
      marginBottom: 5,
    },
    riskHeader: {
      color: "#d32f2f",
      fontWeight: "bold",
      fontSize: 17,
      marginTop: 25,
      marginBottom: 5,
    },
    tipEmoji: {
      width: 16,
      height: 16,
      marginRight: 8,
      marginTop: 2,
      resizeMode: "contain",
    },
    riskBox: {
      backgroundColor: "#ffe6e6",
      padding: 8,
      fontSize: 10,
      borderRadius: 5,
      color: "#d32f2f",
      flex: 1,
    },
    disclaimer: {
      marginTop: 20,
      fontSize: 8,
      padding: 6,
      backgroundColor: "#d4edda8D",
      border: "1px solid #c3e6cb",
      color: "#444",
      borderRadius: 5,
    },
    page: {
      padding: 24,
      backgroundColor: "#fff",
      fontFamily: "Helvetica",
      fontSize: 11,
      lineHeight: 1.5,
    },
    headerRow: {
      // flexDirection: "row",
      // justifyContent: "space-between",
      // alignItems: "flex-start",
      // marginBottom: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 6,
    },
    topRightBox: {
      alignItems: "flex-end",
    },
    topRightImage: {
      width: 90,
      height: 90,
      marginBottom: 4,
    },
    bmiBadge: {
      backgroundColor: "#7ed957",
      borderRadius: 30,
      width: 110,
      height: 60,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 24,
      top: 90,
      zIndex: 2,
    },
    bmiBadgeText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      textAlign: "center",
    },
    bmiBadgeSub: {
      color: "#fff",
      fontSize: 12,
      textAlign: "center",
      marginTop: 2,
    },
    intro: {
      marginBottom: 10,
      marginTop: 4,
    },
    yellowBar: {
      height: 3,
      backgroundColor: "#f3c623",
      marginBottom: 10,
      marginTop: 2,
      width: "100%",
    },
    sectionBox: {
      borderRadius: 6,
      padding: 8,
      marginBottom: 10,
    },
    greenBox: {
      backgroundColor: "#eaf6e9",
      borderLeft: "5px solid #7ed957",
    },
    greenTitle: {
      color: "#7ed957",
      fontWeight: "bold",
      fontSize: 13,
      marginBottom: 2,
    },
    redBox: {
      backgroundColor: "#ffeaea",
      borderLeft: "5px solid #f76b6b",
    },
    redTitle: {
      color: "#f76b6b",
      fontWeight: "bold",
      fontSize: 13,
      marginBottom: 2,
    },
    suggestions: {
      fontWeight: "bold",
      fontSize: 13,
      marginTop: 6,
      marginBottom: 2,
      color: "#444",
    },
    suggestionsText: {
      fontSize: 11,
      color: "#222",
    },
    bmiBadgeBodyIndex: {
      backgroundColor: "#7ed957",
      borderRadius: 30,
      width: 110,
      height: 40,
      paddingInline: 20,
      paddingBlock: 20,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 24,
      top: 40,
      zIndex: 2,
    },
    flowerClip: {
      clipPath: 'path("M50,0 C65,15 85,15 100,0 C115,15 135,15 150,0 C165,15 185,15 200,0 C215,15 235,15 250,0 C235,35 235,65 250,100 C235,115 235,135 250,150 C235,165 235,185 250,200 C235,215 235,235 250,250 C215,235 185,235 150,250 C135,235 115,235 100,250 C85,235 65,235 50,250 C35,235 15,235 0,250 C15,215 15,185 0,150 C15,135 15,115 0,100 C15,85 15,65 0,50 C15,35 15,15 0,0 C15,15 35,15 50,0 Z")'
    }
  });
}

const ProgressBar = ({ styles, percent, color }) => (
  <View style={{ ...styles.progressContainer, maxWidth: "30%" }}>
    <View
      style={{
        height: "100%",
        width: `${percent}%`,
        backgroundColor: color,
        borderRadius: 3,
      }}
    />
  </View>
);

function Metric({ icon, title, note, value, percent, color, styles }) {
  return <View style={styles.metricRow} >
    <Image style={styles.icon} src={icon} />
    <View style={styles.metricText}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricNote}>{note}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <ProgressBar styles={styles} percent={percent} color={color} />
  </View>
}

export default function PDFShareStatistics({ data, brand }) {
  const styles = getStyles(brand)
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <StatisticsPage1 styles={styles} data={data} brand={brand} />
        <StatisticsPage2 styles={styles} data={data} brand={brand} />
        <StatisticsPage3 styles={styles} data={data} brand={brand} />
        <StatisticsPage4 styles={styles} data={data} brand={brand} />
        <StatisticsPage5 styles={styles} data={data} brand={brand} />
        <StatisticsPage6 styles={styles} data={data} brand={brand} />
      </Document>
    </PDFViewer>
  );
}

function StatisticsPage1({ data, styles, brand }) {
  const {
    clientName,
    age,
    gender,
    joined,
    weight,
    height,
    fatPercentage,
    restingMetabolism,
    bmi,
    bodyAge,
    musclePercentage,
  } = data;

  return (
    <Page size="A4" style={{ ...styles.page, display: "flex", flexDirection: "flex-col" }}>
      {brand.brandName && <Text style={styles.brandTitle}>{brand.brandName}</Text>}
      <Text style={{ ...styles.subHeader, marginTop: 2 }}>Checkup Report</Text>
      <View style={{ marginBottom: 10, height: 1, backgroundColor: brand.primaryColor }} />
      <View style={styles.infoBox}>
        <View style={styles.leftInfo}>
          <Text style={styles.name}>{clientName}</Text>
          <Text style={styles.meta}>
            {age} Yrs | {gender}
          </Text>
        </View>
        <View style={styles.rightInfo}>
          <Text>Report Generated on: {joined}</Text>
          <Text>
            Weight: {weight} KG | Height: {height}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Statistics</Text>
      <View style={{ marginTop: 6, marginBottom: 10, display: "block", height: 1, backgroundColor: brand.primaryColor }} />

      {weight && <Metric
        styles={styles}
        icon="/assets/SVG/weightLog.svg"
        title="Weight"
        note="Optimal Range: Varies by Height & Gender"
        value={`${weight} KG`}
        status="Not-Healthy"
        percent={30}
        color="#f7b731"
      />}

      {fatPercentage && <Metric
        styles={styles}
        icon="/assets/SVG/fat_icon.svg"
        title="Fat Percentage"
        note="Optimal: 10–20% men, 20–30% women"
        value={fatPercentage}
        status="Not-Healthy"
        percent={40}
        color="#f7b731"
      />}

      {restingMetabolism && <Metric
        styles={styles}
        icon="/assets/SVG/body.svg"
        title="Resting Metabolism"
        note="Optimal Range: Varies on activity and age"
        value={restingMetabolism}
        status="Not-Healthy"
        percent={50}
        color="#f7b731"
      />}

      {bmi && <Metric
        styles={styles}
        icon="/assets/SVG/BMI.svg"
        title="BMI"
        note="Optimal Range: 18 - 24.9"
        value={bmi || 0}
        status="Not-Healthy"
        percent={30}
        color="#f7b731"
      />}

      {bodyAge && <Metric
        styles={styles}
        icon="/assets/SVG/body.svg"
        title="Body Age"
        note="Optimal Range: Matches actual age"
        value={`${bodyAge} Years`}
        status="Healthy"
        percent={80}
        color="#2ecc71"
      />}

      {musclePercentage && <Metric
        styles={styles}
        icon="/assets/SVG/muscle.svg"
        title="Muscle Percentage"
        note="Optimal Range: 32%-36% for men, 24-30% for women, Athletes: 38-42%"
        value={musclePercentage}
        status="Healthy"
        percent={85}
        color="#2ecc71"
      />}

      <Text style={{ ...styles.disclaimer, marginTop: "auto", marginBottom: 32, lineHeight: 1.2 }}>
        Disclaimer: This report does not provide any medical advice & is not a
        clinical report. It is intended for informational purposes only. It is not
        a substitute for professional medical advice, diagnosis or treatment. This
        report is generated based on the information provided by you. Please
        talk to your doctor / health professional for any further treatment.
      </Text>
      <Image
        src="/assets/PNG/Bottom.png"
        styles={{ marginTop: 20 }}
      />
    </Page>
  );
}

function StatisticsPage2({ data, styles, brand }) {
  const { weight = 30.0, clientName = "", bodyComposition } = data || {};

  return (
    <Page size="A4" style={{ ...styles.page, display: "flex", flexDirection: "flex-col" }}>
      <Text style={{ ...styles.sectionTitle, marginBottom: 0 }}>Body Composition</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 5,
        }}
      >
      </View>
      <Text style={styles.paragraph}>
        Body composition refers to the proportion of fat and non-fat mass in
        your body. Understanding body composition is crucial for assessing
        overall health and fitness, as it provides insights beyond simple weight
        measurements. Higher muscle mass and lower fat percentage typically
        indicate better health and physical fitness. Regular exercise, balanced
        nutrition, and strength training can positively impact body composition.
        Monitoring changes in body composition helps tailor fitness and dietary
        plans to achieve specific health and fitness goals.
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 12,
        }}
      >
        <Image
          src="/assets/SVG/body_icon_red.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_red.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_orange.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_orange.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_yellow.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_green.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
        <Image
          src="/assets/SVG/body_icon_green.svg"
          style={{ width: 24, height: 24, marginHorizontal: 2 }}
        />
      </View>

      {/* Personalized Summary & Risk Analysis */}
      <Text style={styles.sectionTitle}>
        Personalised Summary & Possible Risk Analysis
      </Text>
      <View style={{ display: "flex", gap: 10 }}>
        <Text style={styles.paragraph}>
          Dear {clientName}, 'Dear ,Body Composition Analysis (BCA) provides
          insights into your total body water, protein, minerals, body fat mass,
          and weight. A BCA report helps your physician or health coach establish
          an accurate baseline and plan your health goals accordingly. This method
          offers a more comprehensive view of your overall health compared to
          traditional methods. Regular BCA assessments can assist in monitoring
          and achieving your health objectives.
        </Text>

        <View style={{ height: 40, }}>
          <Text>
            {bodyComposition} Body Comp.
          </Text>
        </View>
      </View>

      {/* Body Weight Red Circle and Risks Box */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginTop: 24,
        }}
      >
        {/* Body Weight Circle */}
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "#F76B6B",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {weight} KG
          </Text>
          <Text style={{ color: "#fff", fontSize: 10 }}>Body Weight</Text>
        </View>
        {/* Risks Box */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#ffe6e6",
            borderRadius: 8,
            padding: 10,
            minHeight: 70,
          }}
        >
          <Text
            style={{
              color: "#d32f2f",
              fontWeight: "bold",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Risks
          </Text>
          <Text style={{ color: "#444", fontSize: 10 }}>
            Being overweight can lead to serious health risks, including
            cardiovascular diseases like heart disease and hypertension, type 2
            diabetes, and joint problems such as osteoarthritis. Respiratory
            issues, like sleep apnea, and mental health challenges, including
            depression and anxiety, are also common. Additionally, the risk of
            certain cancers, such as breast, colon, and kidney cancer, is
            higher. Maintaining a healthy weight through balanced nutrition and
            regular exercise is crucial for reducing these risks and enhancing
            overall well-being.
          </Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={{ ...styles.disclaimer, marginTop: "auto", marginBottom: 32, lineHeight: 1.2 }}>
        Disclaimer: This report does not provide any medical advice & is not a
        clinical report. It is intended for informational purposes only. It is not
        a substitute for professional medical advice, diagnosis or treatment. This
        report is generated based on the information provided by you. Please
        talk to your doctor / health professional for any further treatment.
      </Text>
      <Image
        src="/assets/PNG/Bottom.png"
        styles={{ marginTop: 20 }}
      />
    </Page>
  );
}

function StatisticsPage3({
  data,
  styles,
  brand,
}) {
  const { bmi = 20 } = data;
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Body Mass Index (BMI)</Text>
      </View>
      <View style={{ marginVertical: 14, height: 1, backgroundColor: brand.primaryColor }} />

      {/* Introductory Paragraph */}
      <View style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Text style={{ width: "80%" }}>
          Body Mass Index (BMI) is a simple, widely used method for assessing
          whether a person has a healthy body weight for their height. It is
          calculated by dividing a person's weight in kilograms by the square of
          their height in meters (kg/m²). BMI categories include underweight
          (below 18.5), normal weight (18.5 to 24.9), overweight (25 to 29.9), and
          obese (30 and above). While BMI is a useful screening tool, it does not
          directly measure body fat and may not accurately represent the health of
          individuals with high muscle mass or those with a different body
          composition.
        </Text>
        <View style={{ height: 100, minWidth: 100, backgroundColor: brand.textColor, borderRadius: "100vw", display: "flex", fontWeight: "bold", fontSize: 16, color: "#FFFFFF", flexDirection: "column", justifyContent: "center", alignItems: "center", ...styles.flowerClip }}>
          <Text>{Boolean(bmi) || 0}&nbsp;BMI</Text>
          <br />
          <Text>{bmi < 18 || bmi > 25 ? "Not-Healthy" : "Healthy"}</Text>
        </View>
      </View>

      {/* If within Normal Range */}
      <View style={[styles.sectionBox, styles.greenBox]}>
        <Text style={styles.greenTitle}>If within Normal Range:</Text>
        <Text>
          If BMI is within the normal range, it generally indicates that a
          person has a healthy body weight relative to their height. This
          balance contributes to lower risks of various health issues.
          Individuals with a normal BMI typically experience a reduced risk of
          cardiovascular diseases, such as heart disease and stroke. Their
          likelihood of developing type 2 diabetes is also lower. Maintaining a
          normal BMI helps prevent joint problems and reduces the stress on
          bones and joints, lowering the risk of osteoarthritis. Additionally,
          it contributes to better sleep quality by minimizing the risk of sleep
          apnea. A normal BMI is associated with a lower risk of certain
          cancers, including breast, colon, and kidney cancers. Overall,
          maintaining a normal BMI through a balanced diet and regular physical
          activity supports optimal physical health, enhances mental well-being,
          and promotes a better quality of life.
        </Text>
      </View>

      {/* If Outside Normal Range */}
      <View style={[styles.sectionBox, styles.redBox]}>
        <Text style={styles.redTitle}>If Outside Normal Range:</Text>
        <Text>
          If BMI is higher than the normal range, it indicates that a person is
          either overweight or obese, leading to various health risks and
          complications. Cardiovascular diseases become more likely, with an
          increased risk of heart disease, high blood pressure, and stroke.
          Higher BMI also raises the likelihood of developing type 2 diabetes
          due to insulin resistance. Joint problems such as osteoarthritis can
          arise from the additional stress on joints. Obesity is linked to sleep
          apnea, where breathing repeatedly stops and starts during sleep, and
          it increases the risk of certain cancers, including breast, colon, and
          kidney cancers. Additionally, the risk of liver diseases, such as
          fatty liver disease and cirrhosis, escalates. Mental health can also
          be affected, with higher BMI contributing to conditions like
          depression and anxiety. Therefore, maintaining a healthy BMI through a
          balanced diet and regular exercise is crucial for reducing these risks
          and promoting overall well-being.
        </Text>
      </View>

      {/* Suggestions */}
      <Text style={styles.suggestions}>Suggestions:</Text>
      <Text style={styles.suggestionsText}>
        Maintaining a perfect BMI requires a balanced approach that includes a
        healthy diet, regular physical activity, and lifestyle adjustments.
        Consuming a variety of nutrient-dense foods, such as fruits, vegetables,
        whole grains, lean proteins, and healthy fats, helps provide essential
        nutrients while managing calorie intake. Regular exercise, including
        both aerobic and strength-training activities, supports muscle health
        and aids in weight management. Staying hydrated, getting adequate sleep,
        and managing stress are also crucial for overall well-being. Consistency
        in these habits promotes a balanced BMI and supports long-term health.
      </Text>
    </Page>
  );
}

function StatisticsPage4({
  data: { musclePercentage },
  styles,
  brand
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Muscle Percentage</Text>
      </View>
      <View style={{ marginVertical: 14, height: 1, backgroundColor: "#F7941E" }} />

      <View style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Text style={{ width: "80%" }}>
          Muscle percentage refers to the proportion of total body weight that is
          composed of muscle tissue. It is an important component of body
          composition analysis, providing insights into overall muscle health and
          fitness level. Muscle percentage can vary significantly based on factors
          such as age, sex, fitness level, and physical activity. Muscle tissue
          plays a vital role in metabolism, as it requires more energy (calories)
          than fat tissue to maintain. Therefore, a higher muscle percentage can
          contribute to a higher basal metabolic rate (BMR), which may aid in
          weight management and overall metabolic health.
        </Text>
        <View style={{ height: 100, minWidth: 100, backgroundColor: brand.textColor, borderRadius: "100vw", display: "flex", fontWeight: "bold", fontSize: 16, color: "#FFFFFF", flexDirection: "column", justifyContent: "center", alignItems: "center", ...styles.flowerClip }}>
          <Text>{Boolean(musclePercentage) ? musclePercentage : 0}</Text>
          <br />
          <Text>{(musclePercentage) ? "Healthy" : "Not Healthy"}</Text>
        </View>
      </View>

      {/* If within Normal Range */}
      <View style={[styles.sectionBox, styles.greenBox]}>
        <Text style={styles.greenTitle}>If within Normal Range:</Text>
        <Text>
          If muscle percentage is within the normal range for an individual, it
          typically indicates a healthy balance between muscle mass and overall
          body weight. Having a normal muscle percentage suggests that the
          individual's muscle mass is adequate for their age, gender, and
          activity level, contributing positively to overall health and physical
          function. Maintaining a healthy muscle percentage is crucial for
          various reasons. It supports metabolic health by enhancing calorie
          expenditure and insulin sensitivity, which are important factors in
          managing weight and preventing chronic diseases like diabetes and
          cardiovascular conditions. Additionally, adequate muscle mass promotes
          functional strength, agility, and endurance, which are essential for
          daily activities and athletic performance.
        </Text>
      </View>

      {/* If Outside Normal Range */}
      <View style={[styles.sectionBox, styles.redBox]}>
        <Text style={styles.redTitle}>If Outside Normal Range:</Text>
        <Text>
          Muscle mass significantly impacts health and function. Low muscle mass
          leads to reduced physical function, increased injury risk, and
          metabolic impact. Conversely, high muscle mass requires more calories,
          may limit flexibility, hinder explosive movements, and strain organs.
          As we age, maintaining muscle through exercise and nutrition is
          crucial.
        </Text>
      </View>

      {/* Suggestions */}
      <Text style={styles.suggestions}>Suggestions:</Text>
      <Text style={styles.suggestionsText}>
        Maintaining a perfect BMI requires a balanced approach that includes a
        healthy diet, regular physical activity, and lifestyle adjustments.
        Consuming a variety of nutrient-dense foods, such as fruits, vegetables,
        whole grains, lean proteins, and healthy fats, helps provide essential
        nutrients while managing calorie intake. Regular exercise, including
        both aerobic and strength-training activities, supports muscle health
        and aids in weight management. Staying hydrated, getting adequate sleep,
        and managing stress are also crucial for overall well-being. Consistency
        in these habits promotes a balanced BMI and supports long-term health.
      </Text>
    </Page>
  );
}

function StatisticsPage5({
  data: { restingMetabolism },
  styles,
  brand
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resting Metabolism</Text>
      </View>
      <View style={{ marginVertical: 14, height: 1, backgroundColor: "#F7941E" }} />

      <View style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Text style={{ width: "80%" }}>
          Resting metabolism, or basal metabolic rate (BMR), is the energy
          expended by the body at rest to maintain vital functions like
          breathing and circulation. It varies based on age, sex, body
          composition, and genetics, with muscle tissue requiring more
          energy than fat tissue. BMR is essential for managing weight and
          planning nutrition and exercise, as it determines daily calorie
          needs. Monitoring changes in BMR helps gauge metabolic health
          and guides adjustments in lifestyle for optimal energy balance and
          overall well-being.
        </Text>
        <View style={{ height: 100, minWidth: 100, backgroundColor: brand.textColor, borderRadius: "100vw", display: "flex", fontWeight: "bold", fontSize: 16, color: "#FFFFFF", flexDirection: "column", justifyContent: "center", alignItems: "center", ...styles.flowerClip }}>
          <Text>{Boolean(restingMetabolism) ? restingMetabolism : 0}</Text>
          <br />
          <Text>{restingMetabolism ? "Healthy" : "Not Healthy"}</Text>
        </View>
      </View>

      {/* Introductory Paragraph */}
      <Text style={styles.intro}>

      </Text>

      {/* If within Normal Range */}
      <View style={[styles.sectionBox, styles.greenBox]}>
        <Text style={styles.greenTitle}>If within Normal Range:</Text>
        <Text>
          Having a resting metabolism within the normal range for your age, sex, and body composition
          indicates that your body efficiently expends energy to maintain essential functions at rest. This
          suggests a balanced metabolic rate that supports overall health and energy balance. It typically
          reflects a healthy metabolic function, where the body can effectively regulate energy needs based on
          daily activities and dietary intake. Monitoring and maintaining a normal resting metabolism through
          lifestyle habits like regular exercise and balanced nutrition helps support optimal weight management
          and overall well-being.
        </Text>
      </View>

      {/* If Outside Normal Range */}
      <View style={[styles.sectionBox, styles.redBox]}>
        <Text style={styles.redTitle}>If Outside Normal Range:</Text>
        <Text>
          If your resting metabolism is outside the normal range for your age, sex, and body composition, it
          indicates potential metabolic variations that could impact overall health and energy balance. A
          higher-than-normal resting metabolism may suggest increased energy expenditure, potentially
          requiring adjustments in diet and exercise. Conversely, a lower-than-normal metabolism could
          indicate reduced energy expenditure, affecting weight management and energy levels. Consulting
          healthcare professionals can help identify underlying causes and develop tailored strategies to
          support metabolic health and well-being.
        </Text>
      </View>

      {/* Suggestions */}
      <Text style={styles.suggestions}>Suggestions:</Text>
      <Text style={styles.suggestionsText}>
        Maintaining a perfect BMI requires a balanced approach that includes a
        healthy diet, regular physical activity, and lifestyle adjustments.
        Consuming a variety of nutrient-dense foods, such as fruits, vegetables,
        whole grains, lean proteins, and healthy fats, helps provide essential
        nutrients while managing calorie intake. Regular exercise, including
        both aerobic and strength-training activities, supports muscle health
        and aids in weight management. Staying hydrated, getting adequate sleep,
        and managing stress are also crucial for overall well-being. Consistency
        in these habits promotes a balanced BMI and supports long-term health.
      </Text>
    </Page>
  );
}

function StatisticsPage6({
  data: {
    coachName,
    coachDescription,
    coachProfileImage
  },
  styles,
  brand
}) {
  return <Page size="A4" style={{ display: "flex", flexDirection: "column", gap: 0, ...styles.page }}>
    {/* Suggestions Header */}
    <Text style={styles.sectionTitle}>Suggestions For Health & Wellbeing</Text>
    <View style={{ marginVertical: 14, height: 1, backgroundColor: "#F7941E" }} />

    {/* 1. Eating Block */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
      <View style={{ width: '50%' }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: brand.textColor }}>Physical Activity</Text>
        <Text style={styles.paragraph}>
          It is recommended to do aerobic exercises for at least 30 mins a day for 3 to 4 days in a week such as walking, jogging, swimming, taking stairs instead of lift, etc.
        </Text>
      </View>
      <Image
        src="/assets/PNG/eating.png"
        style={{ width: 180, height: 120, objectFit: "contain" }}
      />
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
      <Image
        src="/assets/PNG/dumbell.png"
        style={{ width: 180, height: 120, objectFit: "contain" }}
      />
      <View style={{ width: '50%' }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: brand.textColor }}>Balanced Diet And Nutrition</Text>
        <Text style={styles.paragraph}>
          A diet rich in health fat, lean proteins complex carbohydrates, is recommended. It is vital to stay hydrated and away from all processed junk food.
        </Text>
      </View>
    </View>

    {/* 3. Stress Management Block */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
      <View style={{ width: '50%' }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: brand.textColor }}>Stress Management</Text>
        <Text style={styles.paragraph}>
          Certain positive lifestyle changes such as meditation, yoga should be incorporated.
        </Text>
      </View>
      <Image
        src="/assets/PNG/stress.png"
        style={{ width: 180, height: 120, objectFit: "contain" }}
      />
    </View>

    {/* Coach Info */}
    <View style={{ marginTop: 32 }}>
      <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Your Wellness Coach</Text>
      <View style={styles.divider} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <View style={{ width: '50%' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4CAF50' }}>
            {coachName ?? 'Your Coach'}
          </Text>
          <Text style={styles.paragraph}>{coachDescription ?? 'Dedicated to your transformation journey.'}</Text>
        </View>
        {/* <Image
          alt=""
          src={coachProfileImage || "/assets/PNG/tryimage.png"}
          style={{ width: 120, height: 120, borderRadius: 60, objectFit: "contain" }}
        /> */}
      </View>
    </View>

    <Text style={{ ...styles.disclaimer, marginTop: "auto", marginBottom: 32, lineHeight: 1.2 }}>
      Disclaimer: This report does not provide any medical advice & is not a
      clinical report. It is intended for informational purposes only. It is not
      a substitute for professional medical advice, diagnosis or treatment. This
      report is generated based on the information provided by you. Please
      talk to your doctor / health professional for any further treatment.
    </Text>
    <Image
      src="/assets/PNG/Bottom.png"
      styles={{ marginTop: 20 }}
    />
  </Page>
}