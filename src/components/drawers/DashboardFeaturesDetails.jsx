import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Download, RefreshCcw } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import ContentLoader from "../common/ContentLoader";
import ContentError from "../common/ContentError";
import { DialogTitle } from "../ui/dialog";
import TopPerformers from "../pages/coach/dashboard/TopPerformers";
import FollowUpList from "../pages/coach/dashboard/FollowUpList";
import { fetchData } from "@/lib/api";
import { nameInitials } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { normalizeMealPlansSorting } from "../pages/coach/dashboard/feature-statistics/ClientPlansExpiry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  addDays, addYears, differenceInCalendarDays, format,
  isBefore, isValid, parse, setDate, setMonth, startOfDay
} from "date-fns";
import { ddMMyyyy } from "@/config/data/regex";

const DATE_FORMATS = ["dd-MM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy/MM/dd"];
const TONE_CLASSES = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-rose-100 text-rose-600 border-rose-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function DashboardFeaturesDetails({
  topPerformers = [],
  clientFollowUps = [],
  missingFollowups = [],
}) {
  return (
    <Drawer direction="right">
      <DrawerTrigger
        aria-label="Open dashboard statistics"
        className="fixed right-0 top-1/2 z-30 -translate-y-1/2 md:translate-x-[-24px] rounded-l-full bg-[var(--primary-1)] px-4 py-2 font-semibold text-[var(--accent-1)] shadow-lg transition hover:translate-x-[-16px]"
      >
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Statistics
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full min-w-[100vw] md:min-w-[90vw] !max-w-[90vw] overflow-hidden p-0">
        <DialogTitle />
        <div className="relative flex h-full flex-col bg-[#f6f8fb]">
          <Container
            topPerformers={topPerformers}
            clientFollowUps={clientFollowUps}
            missingFollowups={missingFollowups}
          />
          <DrawerClose
            aria-label="Close dashboard statistics"
            className="absolute left-0 top-1/2 -translate-x-[36px] -translate-y-1/2 rounded-full bg-[var(--primary-1)] p-2 text-white shadow-lg transition hover:bg-[var(--accent-1)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Container({ topPerformers, clientFollowUps, missingFollowups }) {
  const { isLoading, error, data, mutate, isValidating } = useSWR(
    "dashboardFeatureStatistics",
    () => fetchData("app/dashboard/statistics")
  );

  const [tab, setTab] = useState("plans");
  const [pagination, setPagination] = useState({
    birthdays: { page: 1, limit: 10 },
    subscriptions: { page: 1, limit: 10 },
    plans: { page: 1, limit: 10 },
    incomplete: { page: 1, limit: 10 },
  });
  const [filters, setFilters] = useState({
    plans: "all"
  })

  const { birthdays = [], subscriptions = [], plans = [] } = data?.data || {};
  const normalizedBirthdays = useMemo(() => normalizeBirthdays(birthdays), [birthdays])

  const normalizedSubscriptions = useMemo(() => normalizeSubscriptions(subscriptions), [subscriptions]);
  const normalizedPlans = useMemo(() => normalizeMealPlans(plans), [plans]);
  const normalizedIncompletePlans = useMemo(() => normalizeIncompletePlans(plans), [plans])

  const tabs = useMemo(
    () =>
      createTabsConfig({
        birthdays,
        normalizedBirthdays,
        subscriptions,
        normalizedSubscriptions,
        plans,
        normalizedPlans,
        incompletePlans: normalizedIncompletePlans,
        filters
      }),
    [
      birthdays,
      normalizedBirthdays,
      subscriptions,
      normalizedSubscriptions,
      plans,
      normalizedPlans,
      normalizedIncompletePlans,
      filters.plans
    ]
  );

  const activeTabExists = tabs.some((item) => item.value === tab);
  const defaultTabValue = tabs.at(0)?.value;

  useEffect(() => {
    if (!activeTabExists && defaultTabValue) {
      setTab(defaultTabValue);
    }
  }, [activeTabExists, defaultTabValue, tab]);

  const handleTabChange = useCallback((value) => {
    setTab(value);
    setPagination((prev) => ({
      ...prev,
      [value]: {
        limit: prev[value]?.limit ?? 10,
        page: 1,
      },
    }));
  }, []);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />;

  return (
    <div className="flex min-h-full flex-col">
      <ActivitiesHeader onRefresh={() => mutate()} isRefreshing={isValidating} />
      <div className="flex-1 overflow-y-auto md:px-8 pb-12 pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col gap-6">
              <TabsList className="flex flex-wrap justify-center md:justify-start h-auto items-center gap-2 md:gap-6 border-b border-slate-200 bg-transparent px-2 md:p-0 w-[100vw] md:w-auto">
                {tabs.map((tabItem) => (
                  <TabsTrigger
                    key={tabItem.value}
                    value={tabItem.value}
                    className="relative flex-none rounded-none border-0 bg-transparent px-0 p-2 md:pb-3 text-sm md:text-base font-semibold text-slate-500 h-auto data-[state=active]:text-slate-900 data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-[3px] data-[state=active]:after:w-full data-[state=active]:after:rounded-full data-[state=active]:after:bg-[var(--accent-1)]"
                  >
                    {tabItem.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tabItem) => {
                const { page, limit } = pagination[tabItem.value] || { page: 1, limit: 10 };
                const tableRows = tabItem.rows;
                const totalRows = tableRows.length;
                const totalPages = Math.max(1, Math.ceil(totalRows / Math.max(limit, 1)));
                const rowsToRender = tableRows.slice((page - 1) * limit, page * limit);

                return (
                  <TabsContent key={tabItem.value} value={tabItem.value} className="mt-6 mx-2 md:mx-0">
                    <DataCard
                      selectedTab={tab}
                      title={tabItem.title}
                      description={tabItem.description}
                      columns={tabItem.columns}
                      rows={rowsToRender}
                      page={page}
                      limit={limit}
                      totalRows={totalRows}
                      totalPages={totalPages}
                      onPageChange={(nextPage) =>
                        setPagination((prev) => ({
                          ...prev,
                          [tabItem.value]: {
                            ...(prev[tabItem.value] || { limit }),
                            page: nextPage,
                          },
                        }))
                      }
                      onExport={() => exportRowsAsCSV(tabItem.exportFileName, tabItem.columns, tableRows)}
                      filter={filters}
                      onFilterChange={setFilters}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
          <ClientsSidebar
            topPerformers={topPerformers}
            clientFollowUps={clientFollowUps}
            missingFollowups={missingFollowups}
          />
        </div>
      </div>
    </div>
  );
}

function ActivitiesHeader({ onRefresh, isRefreshing }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div className="flex item-center gap-4">
        <DrawerClose>
          <ArrowRight />
        </DrawerClose>
        <h2 className="text-lg md:text-3xl font-semibold text-slate-900">Activities</h2>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        Refresh
      </Button>
    </div>
  );
}

function DataCard({
  selectedTab,
  title,
  description,
  columns,
  rows,
  page,
  limit,
  totalRows,
  totalPages,
  onPageChange,
  onExport,
  filter,
  onFilterChange
}) {
  const hasData = rows.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-[95vw] md:w-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 md:px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={totalRows === 0}
          className="flex items-center gap-2 ml-auto"
        >
          <Download className="h-4 w-4" />
          Export table
        </Button>
        <FilterOptions
          selectedTab={selectedTab}
          filter={filter}
          onFilterChange={onFilterChange}
        />
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-50">
            <TableRow className="text-xs uppercase tracking-wide text-slate-500">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("whitespace-nowrap px-6 py-3 text-left text-xs font-semibold text-slate-500")}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasData ? (
              rows.map((row, index) => (
                <TableRow key={row._id ?? index} className="text-sm text-slate-700 transition hover:bg-slate-50">
                  {columns.map((column) => {
                    const content = column.render ? column.render(row, index) : row[column.key];
                    return (
                      <TableCell
                        key={column.key}
                        className={cn(
                          "whitespace-nowrap px-6 py-4 text-sm",
                          column.align === "right"
                            ? "text-right"
                            : column.align === "center"
                              ? "text-center"
                              : "text-left"
                        )}
                      >
                        {content ?? <EmptyCell />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-400">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationFooter
        page={page}
        limit={limit}
        totalRows={totalRows}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function ClientsSidebar({
  topPerformers = [],
  clientFollowUps = [],
  missingFollowups = [],
}) {
  const hasTopPerformers = Array.isArray(topPerformers) && topPerformers.length > 0;
  const hasFollowUps = Array.isArray(clientFollowUps) && clientFollowUps.length > 0;
  const hasMissingFollowups = Array.isArray(missingFollowups) && missingFollowups.length > 0;

  return (
    <aside className="flex min-w-0 flex-col gap-4 px-2 md:px-0">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Clients</h3>
        <Button
          asChild
          size="sm"
          className="bg-[var(--accent-1)] px-4 py-2 text-white hover:bg-[var(--accent-1)]/90 border border-[var(--accent-1)]"
        >
          <Link href="/coach/add-client">+ Add Clients</Link>
        </Button>
      </div>

      {hasTopPerformers ? (
        <TopPerformers clients={topPerformers} />
      ) : (
        <EmptyClientsCard title="Top Performers" />
      )}

      {hasFollowUps ? (
        <FollowUpList title="Pending Followups" clients={[...clientFollowUps]} />
      ) : null}

      {hasMissingFollowups ? (
        <FollowUpList title="Missing Follow Up" clients={[...missingFollowups]} />
      ) : null}
    </aside>
  );
}

function EmptyClientsCard({ title = "" }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
      No {title.toLowerCase()} yet
    </div>
  );
}

function PaginationFooter({ page, limit, totalRows, totalPages, onPageChange }) {
  if (totalRows === 0 || totalRows <= limit) {
    return null;
  }

  const pages = getPaginationSequence(page, totalPages);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 border-t border-slate-200 px-4 md:px-6 py-4 text-sm text-slate-500">
      <span>
        Showing {start}-{end} of {totalRows}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-200 md:px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "rounded-lg px-2 md:px-3 py-1.5 font-semibold transition",
                item === page ? "bg-[var(--accent-1)] text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-200 md:px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function createTabsConfig({
  birthdays,
  normalizedBirthdays,
  subscriptions,
  normalizedSubscriptions,
  plans,
  normalizedPlans,
  incompletePlans,
  filters
}) {
  const birthdayColumns = [
    {
      key: "user",
      label: "User",
      render: (row) => <UserCell user={{ name: row.name, profilePhoto: row.profilePhoto }} />,
      exportValue: (row) => row.name ?? "",
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   render: (row) => <StatusBadge status={row.status} />,
    //   exportValue: (row) => row.status?.label ?? "",
    // },
    {
      key: "clientId",
      label: "Client ID",
      render: (row) =>
        row.clientId ? <span className="font-semibold text-slate-700">#{row.clientId}</span> : <EmptyCell />,
      exportValue: (row) => row.clientId ?? "",
    },
    {
      key: "mobileNumber",
      label: "Mobile Number",
      render: (row) => row.mobileNumber || <EmptyCell />,
      exportValue: (row) => row.mobileNumber ?? "",
    },
    {
      key: "dob",
      label: "Birthday",
      render: (row) => format(row.dob, "dd-MM-yyyy") || <EmptyCell />,
      exportValue: (row) => format(row.dob, "dd-MM-yyyy") ?? "",
    },
  ];
  const subscriptionColumns = [
    {
      key: "user",
      label: "User",
      render: (row) => <UserCell user={row.user} />,
      exportValue: (row) => row.user?.name ?? "",
    },
    {
      key: "clientId",
      label: "Client ID",
      render: (row) =>
        row.clientId ? <span className="font-semibold text-slate-700">#{row.clientId}</span> : <EmptyCell />,
      exportValue: (row) => row.clientId ?? "",
    },
    {
      key: "mobileNumber",
      label: "Mobile Number",
      render: (row) => row.mobileNumber || <EmptyCell />,
      exportValue: (row) => row.mobileNumber ?? "",
    },
    {
      key: "validFrom",
      label: "Valid From",
      render: (row) => row.validFrom || <EmptyCell />,
      exportValue: (row) => row.validFrom ?? "",
    },
    {
      key: "validTill",
      label: "Valid Till",
      render: (row) => row.validTill || <EmptyCell />,
      exportValue: (row) => row.validTill ?? "",
    },
    {
      key: "daysRemaining",
      label: "Days Remaining",
      render: (row) => <DaysPill badge={row.daysRemaining} />,
      exportValue: (row) => row.daysRemaining?.value ?? "",
    },
  ];
  const mealPlanColumns = [
    {
      key: "user",
      label: "User",
      render: (row) => <UserCell user={row.user} />,
      exportValue: (row) => row.user?.name ?? "",
    },
    {
      key: "clientId",
      label: "Client ID",
      render: (row) =>
        row.clientId ? <span className="font-semibold text-slate-700">#{row.clientId}</span> : <EmptyCell />,
      exportValue: (row) => row.clientId ?? "",
    },
    {
      key: "mobileNumber",
      label: "Mobile Number",
      render: (row) => row.mobileNumber || <EmptyCell />,
      exportValue: (row) => row.mobileNumber ?? "",
    },
    // {
    //   key: "assignedOn",
    //   label: "Assigned On",
    //   render: (row) => row.assignedOn || <EmptyCell />,
    //   exportValue: (row) => row.assignedOn ?? "",
    // },
    {
      key: "lastDate",
      label: "Last Date",
      render: (row) => row.lastDate || <EmptyCell />,
      exportValue: (row) => row.lastDate ?? "",
    },
    {
      key: "noOfDays",
      label: "No. of Days",
      render: (row) => <DaysPill badge={row.noOfDays} />,
      exportValue: (row) => row.noOfDays?.value ?? "",
    },
    {
      key: "remainingDays",
      label: "Remaining Days",
      render: (row) =>
        typeof row.remainingDays === "number" ? (
          <span className="font-semibold text-slate-700">{row.remainingDays}</span>
        ) : (
          <EmptyCell />
        ),
      exportValue: (row) => row.remainingDays ?? "",
    },
  ];
  const incompletePlanColumns = [
    {
      key: "srNo",
      label: "Sr No",
      render: (row) => row.srNo,
      exportValue: (row) => row.srNo ?? "",
      align: "center",
    },
    {
      key: "title",
      label: "Title",
      render: (row) => row.title || <EmptyCell />,
      exportValue: (row) => row.title ?? "",
    },
    {
      key: "lastDate",
      label: "Last Date",
      render: (row) => row.lastDate || <EmptyCell />,
      exportValue: (row) => row.lastDate ?? "",
    },
    {
      key: "missingCount",
      label: "Missing",
      render: (row) => <MissingDatesBadge count={row.missingCount} dates={row.missingDates} />,
      exportValue: (row) => row.missingCount ?? "",
      align: "center",
    },
  ];
  return [
    {
      value: "plans",
      label: "Expiring Meal Plans",
      title: "Meal Plans About to Expire",
      description: null,
      columns: mealPlanColumns,
      rows: renderMealPlanRows(normalizedPlans, filters),
      rawRows: plans,
      exportFileName: "meal-plans-expiring",
    },
    {
      value: "incomplete",
      label: "Incomplete Meal Plans",
      title: "Incomplete Meal Plans",
      description: null,
      columns: incompletePlanColumns,
      rows: incompletePlans,
      rawRows: incompletePlans,
      exportFileName: "incomplete-plans",
    },
    {
      value: "birthdays",
      label: "Upcoming Birthdays",
      title: "Upcoming Birthdays",
      description: null,
      columns: birthdayColumns,
      rows: normalizedBirthdays,
      rawRows: birthdays,
      exportFileName: "upcoming-birthdays",
    },
    {
      value: "subscriptions",
      label: "Subscriptions",
      title: "Club Subscriptions & Validity",
      description: null,
      columns: subscriptionColumns,
      rows: normalizedSubscriptions,
      rawRows: subscriptions,
      exportFileName: "club-subscriptions",
    },
  ];
}

function UserCell({ user }) {
  if (!user) return <EmptyCell />;
  const displayName = user.name || user.username || "";
  const displayHandle = formatUsername(user.username);
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 rounded-xl">
        <AvatarImage src={user.avatar} alt={displayName} className="rounded-xl" />
        <AvatarFallback className="rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
          {nameInitials(displayName || "WZ")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">{displayName || "—"}</span>
        {displayHandle ? <span className="text-xs font-medium text-slate-400">{displayHandle}</span> : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status?.label) return <EmptyCell />;
  const toneClass = TONE_CLASSES[status.tone] ?? TONE_CLASSES.neutral;
  return (
    <Badge variant="outline" className={cn("border", toneClass)}>
      {status.label}
    </Badge>
  );
}

function DaysPill({ badge }) {
  if (!badge?.label) return <EmptyCell />;
  const toneClass = TONE_CLASSES[badge.tone] ?? TONE_CLASSES.neutral;
  return (
    <Badge variant="outline" className={cn("border", toneClass)}>
      {badge.label}
    </Badge>
  );
}

function MissingDatesBadge({ count, dates = [] }) {
  if (typeof count !== "number") return <EmptyCell />;
  if (count === 0) {
    return (
      <Badge variant="outline" className="border-slate-200 bg-emerald-50 text-emerald-600">
        0
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="cursor-pointer border-slate-200">
          {count}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <ScrollArea className="max-h-56">
          <div className="flex flex-wrap gap-1">
            {dates.map((date) => (
              <Badge key={date} variant="secondary" className="text-[10px]">
                {date}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function EmptyCell() {
  return <span className="text-slate-400">—</span>;
}

function getPaginationSequence(current, total, maxLength = 7) {
  if (total <= maxLength) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const range = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) {
    range.push("…");
  }
  for (let page = left; page <= right; page += 1) {
    range.push(page);
  }
  if (right < total - 1) {
    range.push("…");
  }
  range.push(total);
  return range;
}

function normalizeBirthdays(birthdays = []) {
  const today = new Date();
  return birthdays
    .filter(client => ddMMyyyy.test(client.dob))
    .map(client => {
      const [day, month] = (client.dob || "")?.split("-") || [];
      const bday = setDate(new Date(), day)
      bday.setDate(day)
      bday.setMonth(month - 1)
      const newDob = isBefore(bday, today)
        ? new Date(addYears(bday, 1))
        : new Date(bday)
      if (client.clientId === "mry822") console.log(newDob)
      return {
        ...client,
        dob: newDob
      }
    })
    .sort((a, b) => isBefore(a.dob, b.dob) ? -1 : 1)
}

function normalizeSubscriptions(subscriptions = []) {
  return subscriptions.map((subscription, index) => {
    const client = subscription?.client || {};
    const timeline = getSubscriptionTimeline(subscription);
    return {
      id: subscription?._id ?? client?._id ?? index,
      user: {
        name: client?.name ?? subscription?.name ?? "",
        username: client?.username ?? client?.handle ?? subscription?.username ?? "",
        avatar: client?.profilePhoto ?? subscription?.profilePhoto ?? "",
      },
      clientId: sanitizeClientId(client?.clientId ?? subscription?.clientId),
      mobileNumber: client?.mobileNumber ?? subscription?.mobileNumber ?? "",
      validFrom: formatDateDisplay(timeline.start),
      validTill: formatDateDisplay(timeline.end),
      daysRemaining: timeline.daysRemaining !== null ? createDaysBadge(timeline.daysRemaining) : null,
    };
  });
}

function normalizeMealPlans(plans = []) {
  const planMap = new Map(plans.map(plan => [plan._id, plan]))
  const result = normalizeMealPlansSorting(plans)
  return result
    .map(client => {
      const plan = planMap.get(client.plan)
      const planTimeline = getPlanTimeline(plan)
      const clientTimeline = getClientPlanTimeline(client, planTimeline);
      return {
        id: plan._id,
        user: {
          name: client?.name ?? client?.clientName ?? plan?.title ?? plan?.name ?? "",
          username: client?.username ?? client?.handle ?? "",
          avatar: client?.profilePhoto ?? "",
        },
        clientId: sanitizeClientId(client?.clientId ?? client?.rollno ?? plan?.clientId),
        mobileNumber: client?.mobileNumber ?? plan?.mobileNumber ?? "",
        assignedOn: formatDateDisplay(clientTimeline.start),
        lastDate: formatDateDisplay(clientTimeline.end),
        noOfDays: clientTimeline.days !== null ? createDaysBadge(clientTimeline.days) : null,
        remainingDays:
          typeof clientTimeline.remaining === "number" ? Math.max(clientTimeline.remaining, 0) : null,
      }
    })
}

function normalizeIncompletePlans(plans = []) {
  const computed = plans
    .map((plan, index) => {
      const parsedDates = collectPlanDates(plan);
      const start =
        parseDateFlexible(plan?.startDate) ||
        parseDateFlexible(plan?.assignedOn) ||
        parsedDates.at(0) ||
        null;
      const end =
        parseDateFlexible(plan?.lastDate) ||
        parseDateFlexible(plan?.endDate) ||
        parsedDates.at(-1) ||
        null;
      const totalDays = safeNumber(plan?.noOfDays) ?? (parsedDates.length ? parsedDates.length : null);
      const missingDateObjects = calculateMissingDates(start, parsedDates, totalDays);

      return {
        id: plan?._id ?? index,
        title: plan?.title ?? plan?.name ?? "",
        lastDate: formatDateDisplay(end),
        lastDateValue: end,
        missingCount: missingDateObjects.length,
        missingDates: missingDateObjects.map((date) => format(date, "dd-MM-yyyy")),
      };
    })
    .sort((a, b) => {
      if (!a.lastDateValue) return 1;
      if (!b.lastDateValue) return -1;
      return b.lastDateValue - a.lastDateValue;
    });

  return computed.map((plan, index) => {
    const { lastDateValue, ...rest } = plan;
    return {
      ...rest,
      srNo: index + 1,
    };
  });
}

function getSubscriptionTimeline(subscription) {
  const history = Array.isArray(subscription?.history) ? subscription.history : [];
  const latest = history.reduce((acc, entry) => {
    const endDate = parseDateFlexible(entry?.endDate);
    if (!endDate) return acc;
    if (!acc || endDate > acc.end) {
      return {
        start: parseDateFlexible(entry?.startDate),
        end: endDate,
      };
    }
    return acc;
  }, null);

  const start =
    parseDateFlexible(subscription?.validFrom) ||
    parseDateFlexible(subscription?.startDate) ||
    latest?.start ||
    null;
  const end =
    parseDateFlexible(subscription?.validTill) ||
    parseDateFlexible(subscription?.endDate) ||
    latest?.end ||
    null;
  const today = startOfDay(new Date());
  const daysRemaining = end ? differenceInCalendarDays(end, today) : null;

  return { start, end, daysRemaining };
}

function getPlanTimeline(plan) {
  const dateKeys = Object.keys(plan?.plans || {});
  const parsedDates = dateKeys
    .map((dateKey) => parseDateFlexible(dateKey))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const start =
    parseDateFlexible(plan?.startDate) ||
    parseDateFlexible(plan?.assignedOn) ||
    parsedDates[0] ||
    null;
  const end =
    parseDateFlexible(plan?.endDate) ||
    parseDateFlexible(plan?.lastDate) ||
    parsedDates.at(-1) ||
    null;
  const totalDays = safeNumber(plan?.noOfDays) ?? (parsedDates.length ? parsedDates.length : null);
  const today = startOfDay(new Date());
  const daysRemaining = end ? differenceInCalendarDays(end, today) : null;

  return { start, end, totalDays, daysRemaining };
}

function getClientPlanTimeline(client, fallbackTimeline) {
  if (!client) {
    return {
      start: fallbackTimeline.start,
      end: fallbackTimeline.end,
      days: fallbackTimeline.totalDays,
      remaining: fallbackTimeline.daysRemaining,
    };
  }

  const start =
    parseDateFlexible(client?.assignedOn) ||
    parseDateFlexible(client?.startDate) ||
    fallbackTimeline.start ||
    null;
  const end =
    parseDateFlexible(client?.lastDate) ||
    parseDateFlexible(client?.endDate) ||
    fallbackTimeline.end ||
    null;
  const days =
    safeNumber(client?.noOfDays ?? client?.days ?? client?.duration) ?? fallbackTimeline.totalDays ?? null;

  let remaining;
  if (client?.remainingDays !== undefined && client?.remainingDays !== null) {
    const numericRemaining = safeNumber(client?.remainingDays);
    remaining =
      numericRemaining !== null ? numericRemaining : fallbackTimeline.daysRemaining ?? null;
  } else if (end) {
    const today = startOfDay(new Date());
    remaining = differenceInCalendarDays(end, today);
  } else {
    remaining = fallbackTimeline.daysRemaining ?? null;
  }

  return { start, end, days, remaining };
}

function exportRowsAsCSV(fileName, columns, rows) {
  if (typeof window === "undefined" || !Array.isArray(rows) || rows.length === 0) return;
  const exportableColumns = columns.filter((column) => column.exportValue !== false);
  if (exportableColumns.length === 0) return;

  const header = exportableColumns
    .map((column) => sanitizeCSVValue(column.exportLabel ?? column.label))
    .join(",");
  const body = rows
    .map((row) =>
      exportableColumns
        .map((column) => {
          const value =
            typeof column.exportValue === "function" ? column.exportValue(row) : row[column.key];
          return sanitizeCSVValue(value ?? "");
        })
        .join(",")
    )
    .join("\n");

  const csvContent = [header, body].filter(Boolean).join("\n");
  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
  const safeName = fileName ? fileName.replace(/\s+/g, "-").toLowerCase() : "export";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDateDisplay(value) {
  const parsed = parseDateFlexible(value);
  if (!parsed) return "";
  return format(parsed, "dd-MM-yyyy");
}

function parseDateFlexible(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  const stringValue = String(value).trim();
  if (!stringValue) return null;

  for (const formatString of DATE_FORMATS) {
    const parsed = parse(stringValue, formatString, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const fallback = new Date(stringValue);
  return isValid(fallback) ? fallback : null;
}

function createStatus(value) {
  const label = String(value).trim().toUpperCase();
  return {
    label,
    tone: getStatusTone(label),
  };
}

function createDaysBadge(days) {
  const numeric = safeNumber(days);
  if (numeric === null) return null;
  const safeValue = Math.max(numeric, 0);
  return {
    label: `${safeValue} Day${safeValue === 1 ? "" : "s"}`,
    value: safeValue,
    tone: getDaysTone(numeric),
  };
}

function getStatusTone(label) {
  const normalized = label.toLowerCase();
  if (["ok", "active", "success", "yes"].some((keyword) => normalized.includes(keyword))) return "success";
  if (["ko", "inactive", "expired", "no", "overdue"].some((keyword) => normalized.includes(keyword)))
    return "danger";
  return "neutral";
}

function getDaysTone(days) {
  if (typeof days !== "number" || Number.isNaN(days)) return "neutral";
  if (days <= 0) return "danger";
  if (days <= 3) return "danger";
  if (days <= 7) return "warning";
  return "success";
}

function sanitizeClientId(value) {
  if (!value) return "";
  return String(value).replace(/^#/, "").trim();
}

function safeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatUsername(username) {
  if (!username) return "";
  const trimmed = String(username).trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function sanitizeCSVValue(value) {
  if (value === undefined || value === null) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

function collectPlanDates(plan) {
  return Object.keys(plan?.plans || {})
    .map((key) => parse(key, "dd-MM-yyyy", new Date()))
    .filter((date) => isValid(date))
    .sort((a, b) => a - b);
}

function calculateMissingDates(startDate, availableDates, totalDays) {
  if (!startDate || !Array.isArray(availableDates) || availableDates.length === 0) return [];
  const effectiveTotalDays = safeNumber(totalDays);
  if (effectiveTotalDays === null || effectiveTotalDays <= 0) return [];

  const availableSet = new Set(availableDates.map((date) => format(date, "dd-MM-yyyy")));
  const missing = [];

  for (let offset = 0; offset < effectiveTotalDays; offset += 1) {
    const expected = addDays(startDate, offset);
    const key = format(expected, "dd-MM-yyyy");
    if (!availableSet.has(key)) {
      missing.push(expected);
    }
  }

  return missing;
}

function FilterOptions({
  selectedTab,
  filter,
  onFilterChange
}) {
  if (selectedTab == "plans") return <ExpiringMealPlanFilterOptions
    filter={filter}
    onFilterChange={onFilterChange}
  />
  return <></>
}

function ExpiringMealPlanFilterOptions({
  filter,
  onFilterChange
}) {
  const planFilter = filter.plans || "all"
  return <Select
    value={planFilter}
    onValueChange={(value) => onFilterChange(prev => ({ ...prev, plans: value }))}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="expired">Expired</SelectItem>
      <SelectItem value="all">All</SelectItem>
    </SelectContent>
  </Select>
}

function renderMealPlanRows(plans, { plans: plansFilter } = {}) {
  if (plansFilter === "active") return plans
    .filter(plan => plan.remainingDays > 0);
  if (plansFilter === "expired") return plans
    .filter(plan => plan.remainingDays <= 0);
  return plans;
}