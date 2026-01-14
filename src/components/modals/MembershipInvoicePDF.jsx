import React from "react";
import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
  Font,
  Image
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "/fonts/Noto-Sans-Devnagiri.ttf"
});

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#0f172a",
    backgroundColor: "#fff"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  logo: {
    width: 80,
    height: 50,
    objectFit: "contain"
  },
  companyInfo: {
    flex: 1,
    alignItems: "flex-end"
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  companyAddress: {
    fontSize: 9,
    lineHeight: 1.4,
    marginTop: 2
  },
  taxInvoiceBanner: {
    marginTop: 14,
    // backgroundColor: "#0d4ed8",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "flex-start"
  },
  taxInvoiceLabel: {
    // color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 11,
    textTransform: "uppercase"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12
  },
  separator: {
    height: 2,
    backgroundColor: "#0d4ed8",
    marginVertical: 8
  },
  infoBox: {
    width: "48%",
    // borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 8
  },
  infoHeader: {
    // borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginBottom: 4,
    paddingBottom: 2,
    fontWeight: "bold",
    fontSize: 9
  },
  infoText: {
    fontSize: 9,
    marginBottom: 2
  },
  invoiceDetails: {
    flex: 1,
    justifyContent: "space-between"
  },
  infoDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    alignItems: "center"
  },
  infoDetailLabel: {
    fontSize: 9,
    fontWeight: "bold"
  },
  infoDetailValue: {
    fontSize: 9
  },
  table: {
    marginTop: 20,
    // borderWidth: 1,
    // borderColor: "#0d4ed8",
    borderRadius: 4,
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0d4ed8",
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  headerCell: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    backgroundColor: "#fff"
  },
  tableRowFooter: {
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    flexDirection: "row",
    fontSize: 8
  },
  colIndex: {
    width: "5%",
    textAlign: "center",
    fontSize: 9
  },
  colItem: {
    width: "45%",
    fontSize: 9,
    fontWeight: "bold"
  },
  colHsn: {
    width: "20%",
    fontSize: 9,
    textAlign: "center"
  },
  colAmount: {
    width: "30%",
    fontSize: 9,
    textAlign: "right"
  },
  totals: {
    marginTop: 10,
    paddingHorizontal: 4
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 9
  },
  totalLabel: {
    fontWeight: "bold"
  },
  amountPaid: {
    marginTop: 14,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  amountPaidLabel: {
    fontWeight: "bold",
    fontSize: 10
  },
  amountPaidValue: {
    marginTop: 2,
    // color: "#0f9d58",
    fontSize: 10
  },
  bankDetails: {
    marginTop: 18,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 9
  },
  bankLabel: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 9
  },
  signature: {
    marginTop: 12,
    alignItems: "flex-end",
    fontSize: 9
  },
  notes: {
    marginTop: 10,
    fontSize: 9
  },
  notesLabel: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 9
  },
  footer: {
    marginTop: 14,
    fontSize: 8,
    color: "#475569",
    textAlign: "left"
  }
});

const defaultSubscriptionData = {
  amount: 2500,
  description: "Rented Branded App",
  startDate: "2025-11-29",
  endDate: "2025-11-29",
  invoice: "WZ180",
  paymentMode: "UPI",
  discount: 500,
  notes: "Renewal"
};

const defaultClientData = {
  name: "Mahipat",
  phone: "918955796195"
};

const formatCurrency = (
  value,
  { decimals = 2, withSymbol = true, symbol = "₹", groupThousands = true } = {}
) => {
  if (!Number.isFinite(value)) return "";
  const fixed = value.toFixed(decimals);
  const [intPart, decPart = ""] = fixed.split(".");
  const withComma = groupThousands
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : intPart;
  const decimalSection = decimals > 0 ? `.${decPart}` : "";
  return `${withSymbol ? symbol : ""}${withComma}${decimalSection}`;
};

const formatDateShort = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const numberToWords = (num) => {
  if (!Number.isFinite(num)) return "";
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const toWords = (n) => {
    if (n < 20) return units[n];
    if (n < 100) {
      const unitPart = n % 10;
      return `${tens[Math.floor(n / 10)]}${unitPart ? " " + units[unitPart] : ""}`;
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return `${units[hundred]} Hundred${remainder ? " " + toWords(remainder) : ""}`;
    }
    if (n < 100000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      return `${toWords(thousand)} Thousand${remainder ? ", " + toWords(remainder) : ""}`;
    }
    return n.toString();
  };

  return `INR ${toWords(Math.floor(num))} Rupees Only.`;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function MembershipInvoicePDF({ data = {} }) {
  const subscriptionSource = data?.subscription ?? data ?? {};
  const clientSource = data?.client ?? {};

  const subscription = { ...defaultSubscriptionData, ...subscriptionSource };
  const client = { ...defaultClientData, ...clientSource };

  const {
    amount = 1000,
    description = "Membership Subscription",
    startDate,
    endDate,
    invoice = "WZ180",
    paymentMode = "cash",
    discount: subscriptionDiscount = 0,
    notes: subscriptionNotes = "Renewal"
  } = subscription;

  const totalAmount = Number(amount) || 0;
  const discountValue = Number(subscriptionDiscount) || 0;
  const taxableAmount = totalAmount / 1.18;
  const gstAmount = totalAmount - taxableAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const billToName = client?.name || subscription?.name || "Client";
  const billToPhone = client?.phone || client?.mobile || subscription?.phone || "";
  const paymentModeLabel = typeof paymentMode === "string" ? paymentMode.toUpperCase() : "";
  const invoiceDate = formatDate(startDate);
  const dueDate = formatDate(endDate || startDate);
  const invoiceDateShort = formatDateShort(startDate);
  const amountPaidText = `${formatCurrency(totalAmount, { decimals: 0, groupThousands: false })} Paid via ${paymentModeLabel}${invoiceDateShort ? ` on ${invoiceDateShort}` : ""}`;
  const notesText = subscriptionNotes || "Renewal";

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.headerRow}>
            <Image style={styles.logo} src="/logo_vector.png" />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>MOHI LIFESTILE SOLUTIONS PRIVATE LIMITED</Text>
              <Text style={styles.companyAddress}>GSTIN 03AARCM3868J1ZY</Text>
              <Text style={styles.companyAddress}>
                A279, FIRST FLOOR, A-Block, NEW AMRITSAR, Amritsar Amritsar, PUNJAB, 143001
              </Text>
              <Text style={styles.companyAddress}>Mobile +91 7888624347 Email simarpreet@wellnessz.in</Text>
            </View>
          </View>

          <View style={styles.taxInvoiceBanner}>
            <Text style={styles.taxInvoiceLabel}>Tax Invoice</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoHeader}>Bill To</Text>
              <Text style={styles.infoText}>{billToName}</Text>
              {billToPhone && <Text style={styles.infoText}>Ph: {billToPhone}</Text>}
            </View>
            <View style={[styles.infoBox, styles.invoiceDetails]}>
              <Text style={styles.infoHeader}>Invoice Details</Text>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Invoice #:</Text>
                <Text style={styles.infoDetailValue}>{invoice}</Text>
              </View>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Invoice Date:</Text>
                <Text style={styles.infoDetailValue}>{invoiceDate}</Text>
              </View>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Due Date:</Text>
                <Text style={styles.infoDetailValue}>{dueDate}</Text>
              </View>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Place of Supply:</Text>
                <Text style={styles.infoDetailValue}>03-PUNJAB</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: "5%", textAlign: "center" }]}>#</Text>
              <Text style={[styles.headerCell, { width: "45%" }]}>Item</Text>
              <Text style={[styles.headerCell, { width: "20%", textAlign: "center" }]}>HSN/SAC</Text>
              <Text style={[styles.headerCell, { width: "30%", textAlign: "right" }]}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colIndex}>1</Text>
              <Text style={styles.colItem}>{description}</Text>
              <Text style={styles.colHsn}>-</Text>
              <Text style={styles.colAmount}>{formatCurrency(taxableAmount, { withSymbol: false })}</Text>
            </View>
            <View style={[styles.tableRowFooter, { paddingVertical: 4, paddingHorizontal: 10 }]}>
              <Text>Total Items / Qty : 1 / 1</Text>
              <Text style={{ textAlign: "right" }}>Total amount (in words): {numberToWords(totalAmount)}</Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxable Amount</Text>
              <Text>{formatCurrency(taxableAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>CGST 9.0%</Text>
              <Text>{formatCurrency(cgst)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SGST 9.0%</Text>
              <Text>{formatCurrency(sgst)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text>{formatCurrency(totalAmount)}</Text>
            </View>
            {discountValue > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Discount</Text>
                <Text>{formatCurrency(discountValue)}</Text>
              </View>
            )}
          </View>

          <View style={styles.amountPaid}>
            <Text style={styles.amountPaidLabel}>Amount Paid</Text>
            <Text style={styles.amountPaidValue}>✓ {amountPaidText}</Text>
          </View>

          <View style={styles.bankDetails}>
            <Text style={styles.bankLabel}>Bank Details:</Text>
            <Text>Bank: ICICI Bank</Text>
            <Text>Account #: 777705131810</Text>
            <Text>IFSC Code: ICIC0007335</Text>
            <Text>Branch: New Amritsar</Text>
          </View>

          <View style={styles.signature}>
            <Text>For MOHI LIFESTILE SOLUTIONS PRIVATE LIMITED</Text>
            <Text>Authorized Signatory</Text>
          </View>

          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text>{notesText}</Text>
          </View>

          <View style={styles.footer}>
            <Text>Page 1 / 1 • This is a digitally signed document.</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}

