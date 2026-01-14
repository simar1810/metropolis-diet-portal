"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { BarChartComponent } from "@/components/common/charts/Barchart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchData } from "@/lib/api";

const numberFormatter = new Intl.NumberFormat("en-IN");
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Page() {
  const { isLoading, error, data } = useSWR(
    "/app/courses/",
    () => fetchData("app/courses/analytics")
  );

  if (isLoading) return <ContentLoader />;

  if (error || data.status_code !== 200)
    return <ContentError title={error || data.message} />;

  const analytics = data.data;
  const totalCourses = toNumber(analytics.totalCoursesCount);
  const publishedCount = toNumber(analytics.publishedCoursesCount);
  const draftCount = toNumber(analytics.draftCoursesCount);

  const stats = [
    {
      label: "Total courses",
      value: formatNumber(totalCourses),
      helper: "Total courses count",
    },
    // {
    //   label: "Published courses",
    //   value: formatNumber(publishedCount),
    //   helper: "Published courses count",
    // },
    // {
    //   label: "Draft courses",
    //   value: formatNumber(draftCount),
    //   helper: "Draft courses count",
    // },
    {
      label: "Average price",
      value: formatCurrency(analytics.averagePrice),
      helper: "Average price (INR)",
    },
    // {
    //   label: "Average discount",
    //   value: formatPercent(analytics.averageDiscount),
    //   helper: "Average discount (%)",
    // },
    // {
    //   label: "Average teachings",
    //   value: formatNumber(toNumber(analytics.averageTeachingsCount)),
    //   helper: "Average teachings count",
    // },
    // {
    //   label: "Average requirements",
    //   value: formatNumber(toNumber(analytics.averageRequirementsCount)),
    //   helper: "Average requirements count",
    // },
    // {
    //   label: "Average audience",
    //   value: formatNumber(toNumber(analytics.averageAudienceCount)),
    //   helper: "Average audience count",
    // },
  ];

  const distributions = [
    {
      title: "Category distribution",
      description: "Where the catalog is concentrated",
      data: buildDistributionData(analytics.categoryDistribution),
    },
    {
      title: "Language distribution",
      description: "Preferred course languages",
      data: buildDistributionData(analytics.languageDistribution),
    },
    {
      title: "Subscription type distribution",
      description: "Enrollment types chosen by clients",
      data: buildDistributionData(analytics.subscriptionTypeDistribution),
    },
  ];

  return (
    <div className="content-container conttent-height-screen flex flex-col gap-6 py-6">
      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {distributions.map((distribution) => (
          <DistributionChart key={distribution.title} {...distribution} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <CourseClientsCard clients={analytics.courseClients} />
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <Card className="border-1 shadow-none bg-[var(--comp-1)]">
      <CardHeader className="gap-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardHeader>
    </Card>
  );
}

function DistributionChart({ title, description, data = [] }) {
  const hasValues = data.some((item) => item.value > 0);

  if (!data.length || !hasValues) {
    return (
      <Card className="border-1 shadow-none bg-[var(--comp-1)]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough data to render this view yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <BarChartComponent
      className="h-full"
      xAxis={{ data, XAxisDataKey: "label" }}
      yAxis={{ YAxisDataKey: "value", YAxisDataLabel: "Courses" }}
      chartConfig={{
        title,
        description,
        label1: `${total} total`,
        label2: "Hover to see exact counts",
      }}
    />
  );
}

function CourseClientsCard({ clients = [] }) {
  const [query, setQuery] = useState("");
  const safeClients = Array.isArray(clients) ? clients : [];
  const hasClients = safeClients.length > 0;

  const filteredClients = useMemo(() => {
    if (!hasClients) return [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return safeClients;
    return safeClients.filter((course) =>
      (course.title || "").toLowerCase().includes(trimmed)
    );
  }, [hasClients, query, safeClients]);

  const showEmptyState = !hasClients || filteredClients.length === 0;

  return (
    <Card className="border-1 shadow-none bg-[var(--comp-1)]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Course clients</CardTitle>
            <CardDescription>Client enrollments per course</CardDescription>
          </div>
          {hasClients && (
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by course title"
              className="w-full max-w-xs bg-background"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showEmptyState ? (
          <p className="text-sm text-muted-foreground">
            {!hasClients
              ? "No enrollment activity to show yet."
              : "No courses match your search."}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((course) => (
              <div
                key={course.courseId}
                className="flex flex-col gap-3 rounded-md border border-dashed border-border/70 p-3 sm:flex-row sm:items-center"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted sm:w-40">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title || "Course thumbnail"}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <p className="truncate text-sm font-medium">
                    {course.title || "Untitled course"}
                  </p>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatNumber(toNumber(course.clientCount))}
                    </p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildDistributionData(distribution = {}) {
  return Object.entries(distribution || {})
    .map(([label, value]) => ({
      label: label === "undefined" ? "Not specified" : label,
      value: toNumber(value),
    }))
    .sort((a, b) => b.value - a.value);
}

function toNumber(value, fallback = 0) {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function formatNumber(value) {
  return typeof value === "number" && !Number.isNaN(value)
    ? numberFormatter.format(value)
    : "-";
}

function formatCurrency(value) {
  return typeof value === "number" && !Number.isNaN(value)
    ? currencyFormatter.format(value)
    : "-";
}

function formatPercent(value) {
  const safe = toNumber(value, null);
  if (safe === null) return "-";
  return `${Math.round(safe)}%`;
}
