"use client";
import FreeTrialCustomerRow from "@/components/pages/coach/club/free-trial/FreeTrialCustomerRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import FreeTrialCustomerHeader from "./FreeTrialCustomerHeader";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { getFreeTrialUsers } from "@/lib/fetchers/club";

export default function Page() {
  const { isLoading, error, data } = useSWR("free-trial-users", () => getFreeTrialUsers());

  if (isLoading) return <ContentLoader />

  if (!data.success || error) return <ContentError title={error || data.message} />

  const customers = data.payload;

  if (customers.length === 0) return <div className="content-container">
    <FreeTrialCustomerHeader />
    <ContentError
      className="text-center font-semibold text-[var(--dark-1)]/50 border-0"
      title="0 Free Trial Customers Found"
    />
  </div>

  return <div className="content-container">
    <FreeTrialCustomerHeader />
    <div className="overflow-x-auto">
      <Table className="bordered-table [&_th]:font-bold [&_th]:text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Sr. No</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Phone No.</TableHead>
            <TableHead>Roll No</TableHead>
            <TableHead>Sponsored By</TableHead>
            <TableHead>Joining Date</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Membership</TableHead>
            {/* <TableHead>Action</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => <FreeTrialCustomerRow
            key={customer._id}
            index={index}
            customer={customer}
          />)}
        </TableBody>
      </Table>
    </div>
  </div>
}