import { isAfter, isBefore, parse, isValid } from "date-fns";
import * as XLSX from "xlsx";

// Helper function to safely parse dates with multiple format attempts
function safeParseDate(dateString, formats = ["dd-MM-yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy"]) {
  if (!dateString) return null;
  
  for (const format of formats) {
    const parsed = parse(dateString, format, new Date());
    if (isValid(parsed)) {
      // Set time to start of day to avoid timezone issues
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }
  
  // If all formats fail, try native Date parsing as fallback
  const nativeDate = new Date(dateString);
  if (isValid(nativeDate)) {
    nativeDate.setHours(0, 0, 0, 0);
    return nativeDate;
  }
  return null;
}

export function excelRetailOrdersData(orders, dates) {
  try {
    const startDate = safeParseDate(dates.startDate, ['yyyy-MM-dd']);
    const endDate = safeParseDate(dates.endDate, ['yyyy-MM-dd']);

    if (!startDate || !endDate) {
      return [];
    }

    endDate.setHours(23, 59, 59, 999);

  const exporting = (orders || [])
    .filter(order => {
      if (!order.createdAt) {
        return false;
      }

      const parsedDate = safeParseDate(order.createdAt, ["dd-MM-yyyy", "yyyy-MM-dd", "MM/dd/yyyy"]);
      
      if (!parsedDate) {
        return false;
      }

      return (parsedDate >= startDate) && (parsedDate <= endDate);
    })
    .map(order => {
      const sellingPrice = Number(order?.sellingPrice || 0);
      const costPrice = Number(order?.costPrice || 0);
      const paidAmount = Number(order?.paidAmount || 0);
      const profit = Math.max(sellingPrice - costPrice, 0);

      const clientName = order?.clientId?.name || 
                        order?.clientName || 
                        order?.client?.name || 
                        order?.clientId?.clientName ||
                        order?.clientId?.firstName + " " + order?.clientId?.lastName ||
                        "";
      
      const clientPhone = order?.clientId?.mobileNumber || 
                         order?.clientPhone || 
                         order?.client?.mobileNumber || 
                         order?.clientId?.phone ||
                         order?.clientId?.phoneNumber ||
                         order?.clientId?.contactNumber ||
                         "";

      return {
        "Client Name": clientName,
        "Phone Number": clientPhone,
        "Date": order.createdAt,
        "Coach Margin": order?.coachMargin || 0,
        "Cost Price": costPrice,
        "Customer Margin": order?.customerMargin || 0,
        "Invoice Number": order?.invoiceNumber || order?.orderId || order?._id || "",
        "Selling Price": sellingPrice,
        "Status": order?.status || "",
        "Paid Amount": paidAmount,
        "Pending Amount": Math.max(sellingPrice - paidAmount, 0),
        "Profit": profit
      };
    })

  return exporting;
  
  } catch (error) {
    return [];
  }
}

export function exportToExcel(
  data,
  sheetName = "Sheet1",
  fileName = "data.xlsx",
  columnWidths = []
) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data provided for Excel export. No records to export.");
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const numberOfColumns = Object.keys(data[0]).length;

  worksheet["!cols"] = Array.from({ length: numberOfColumns }, (_, i) => {
    return columnWidths[i] ? columnWidths[i] : { wch: 14 }; // 14 ≈ 100px
  });

  Object.keys(worksheet).forEach((cell) => {
    if (cell[0] !== "!") {
      worksheet[cell].s = { alignment: { wrapText: true, vertical: "top" } };
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
}

