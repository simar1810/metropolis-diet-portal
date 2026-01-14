"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DeleteSubscriptionDialog from "./DeleteSubscriptionDialog";

export default function SubscriptionsTable({ subscriptions, onDeleted }) {
  return (
    <div className="mt-5 overflow-x-auto border border-gray-400 rounded-lg bg-[#EFEFEF]">
      <Table>
        <TableHeader className="bg-gray-200">
          <TableRow>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub, index) => (
            <TableRow key={sub._id || index} className="hover:bg-gray-100">
              <TableCell>{format(new Date(sub.startDate), "dd-MM-yyyy")}</TableCell>
              <TableCell>{format(new Date(sub.endDate), "dd-MM-yyyy")}</TableCell>
              <TableCell>
                <span className="font-bold">₹{sub.amount}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-sm">
                  {sub.paymentMode}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-sm">
                  {sub.status || "Active"}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                <DeleteSubscriptionDialog
                  subscriptionId={sub._id}
                  onDeleted={onDeleted}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
