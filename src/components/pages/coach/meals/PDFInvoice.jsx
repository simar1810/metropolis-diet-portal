import { useAppSelector } from "@/providers/global/hooks";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  PDFViewer,
} from "@react-pdf/renderer";

function getStyles(brand) {
  return StyleSheet.create({
    page: {
      padding: 20,
      fontSize: 10,
      fontFamily: "Helvetica",
    },
    logo: {
      width: 60,
      height: 60,
      marginHorizontal: "auto",
      marginBottom: 5,
    },
    headerText: {
      textAlign: "center",
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 15,
      paddingBottom: 2,
      borderBottom: "1pt solid #000",
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 2,
      paddingHorizontal: 3,
    },
    label: {
      fontWeight: "bold",
    },
    customerBox: {
      border: "1pt solid #000",
      borderRadius: 5,
      padding: 10,
      marginTop: 10,
      marginBottom: 10,
    },
    customerRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    customerField: {
      flex: 1,
    },
    customerLabel: {
      fontWeight: "bold",
    },
    customerInput: {
      borderBottom: "1pt solid #000",
      paddingBottom: 2,
      marginLeft: 5,
      marginRight: 5,
      flex: 1,
    },
    refundBox: {
      backgroundColor: brand.primaryColor,
      color: "white",
      padding: 6,
      borderRadius: 4,
      fontWeight: "bold",
      width: "auto",
      marginVertical: 10,
      fontSize: 9,
      alignSelf: "flex-start",
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 1.4,
      marginBottom: 10,
    },
    table: {
      marginTop: 10,
      marginBottom: 10,
      border: "1pt solid black",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottom: "1pt solid black",
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "0.5pt solid #ccc",
    },
    tableCell: {
      padding: 4,
      textAlign: "center",
      flex: 1,
      border: "0.5pt solid #ccc",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    totalLabel: {
      width: "15%",
      padding: 4,
      textAlign: "right",
      fontWeight: "bold",
      border: "0.5pt solid #ccc",
    },
    totalValue: {
      width: "15%",
      padding: 4,
      textAlign: "left",
      border: "0.5pt solid #ccc",
    },
    footerText: {
      fontSize: 8,
      marginTop: 10,
      textAlign: "center",
    },
    signatureRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 40,
      marginBottom: 20,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
    },
    wellnessLogo: {
      width: 100,
      height: 30,
      marginHorizontal: "auto",
      marginBottom: 5,
    },
  });
}

export default function PDFInvoice({ data, brand }) {
  const {
    mobileNumber: coachPhoneNumber,
    city: coachCity

  } = useAppSelector(state => state.coach.data) ?? {}
  const {
    clientName,
    age,
    address,
    city,
    phone,
    date,
    products = [],
    invoiceNo,
    logoUrl,
  } = data;
  const styles = getStyles(brand)
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          {/* <img src={brand.brandLogo} alt="" /> */}
          <Image src={brand.brandLogo} style={styles.logo} />
          <Text style={styles.headerText}>Receipt / invoice</Text>

          <View style={styles.headerRow}>
            <Text>
              <Text style={styles.label}>Receipt / invoice:</Text> {invoiceNo}
            </Text>
            <Text>
              <Text style={styles.label}>Date:</Text> {date}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Text>
              <Text style={styles.label}>City:</Text> {coachCity}
            </Text>
            <Text>
              <Text style={styles.label}>Phone:</Text> {coachPhoneNumber}
            </Text>
          </View>

          <View style={styles.customerBox}>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Name of Customer:</Text>
              <Text style={styles.customerInput}>{clientName}</Text>
              <Text style={styles.customerLabel}>Age:</Text>
              <Text style={styles.customerInput}>{age}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Address:</Text>
              <Text style={styles.customerInput}>{address}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Phone:</Text>
              <Text style={styles.customerInput}>{phone}</Text>
            </View>
          </View>

          <Text style={styles.refundBox}>Herbalife Refund Policy</Text>
          <Text style={styles.paragraph}>
            Herbalife offer exchange or a full refund. Simply request a refund
            from your Associate within 30 Days from your Purchase date of the
            product and return the unused portion of the product containers to the
            associate mentioned above.
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>Sr.No</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Particulars</Text>
              <Text style={styles.tableCell}>Quantity</Text>
              <Text style={styles.tableCell}>Price</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>

            {products.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {item.productName}
                </Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>{item.price}</Text>
                <Text style={styles.tableCell}>
                  {(item.price * item.quantity).toFixed(1)}
                </Text>
              </View>
            ))}


          </View>

          <Text style={styles.paragraph}>
            I understand that this order may be considered as an invitation to
            call upon me from time to time, with the understanding that I will
            under no obligation to buy.
          </Text>

          <View style={styles.signatureRow}>
            <Text>This is auto generated invoice</Text>
            <Text>Customer Sign _____________</Text>
          </View>

          <View style={styles.footer}>
            <Image
              src="public/assets/logo.png"
              style={styles.wellnessLogo}
            />
            <Text style={styles.footerText}>
              Please ensure all items are correct and contact your coach
              immediately if there are any discrepancies.
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}