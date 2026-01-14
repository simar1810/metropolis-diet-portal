"use client";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import PDFRenderer from "@/components/modals/PDFRenderer";
import { DialogTrigger } from "@/components/ui/dialog";
import { fetchData } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function Page() {
  const { isLoading, error, data } = useSWR(
    "membership/invoices",
    () => fetchData("app/memberships-invoices")
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />
  const subscriptions = createSubscriptionList(data?.data);

  if (subscriptions.length === 0) {
    return (
      <div className="content-container content-height-screen">
        <h4>Membership Subscriptions</h4>
        <ContentError className="mt-6" title="No subscriptions available" />
      </div>
    );
  }

  return (
    <div className="content-container content-height-screen">
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <h4>Membership Subscriptions</h4>
        <p className="text-sm text-slate-500">{subscriptions.length} subscriptions</p>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow className="[&_th]:text-sm">
            <TableHead>Client</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Invoice PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription, index) => {
            const rowKey = subscription._id ?? subscription.historyId ?? `${subscription.clientName}-${index}`;
            const pdfPayload = {
              subscription: {
                amount: Number(subscription.amount) || 0,
                description: subscription.description || "Membership Subscription",
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                invoice: subscription.invoice,
                paymentMode: subscription.paymentMode,
                discount: Number(subscription.discount) || 0,
                notes: subscription.notes || subscription.description || "Renewal"
              },
              client: {
                name: subscription.clientName,
                phone: subscription.mobileNumber,
                email: subscription.email,
                city: subscription.city
              }
            };
            return (
              <TableRow key={rowKey}>
                <TableCell>{subscription.clientName || "-"}</TableCell>
                <TableCell className="max-w-[160px] text-xs text-slate-600 truncate">{subscription.email || "-"}</TableCell>
                <TableCell>{subscription.mobileNumber || "-"}</TableCell>
                <TableCell>{subscription.city || "-"}</TableCell>
                <TableCell>{subscription.invoice || "-"}</TableCell>
                <TableCell>{formatDate(subscription.startDate)}</TableCell>
                <TableCell>{formatDate(subscription.endDate)}</TableCell>
                <TableCell>{(subscription.paymentMode || "-").toString().toUpperCase()}</TableCell>
                <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                <TableCell className="max-w-[200px] text-xs text-slate-600 truncate">{subscription.description || "-"}</TableCell>
                <TableCell className="whitespace-nowrap pr-2">
                  <PDFRenderer pdfTemplate="MembershipInvoicePDF" data={pdfPayload}>
                    <DialogTrigger className="px-3 py-1 rounded-[6px] bg-[var(--accent-1)] text-[12px] font-semibold text-white transition-opacity hover:opacity-90">
                      PDF
                    </DialogTrigger>
                  </PDFRenderer>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function createSubscriptionList(subscriptions = []) {
  if (!Array.isArray(subscriptions)) return [];
  const result = [];
  for (const item of subscriptions) {
    const client = item.user || {};
    const history = Array.isArray(item.history) ? item.history : [];
    for (const subscription of history) {
      result.push({
        clientName: client.name,
        mobileNumber: client.mobileNumber,
        city: client.city,
        email: client.email,
        ...subscription
      });
    }
  }
  return result;
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
