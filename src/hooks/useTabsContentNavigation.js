import { _throwError } from "@/lib/formatter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useTabsContentNavigation(defaultTab, tabItems) {
  if (!defaultTab) _throwError("defaultTab is required");
  const [selectedTab, setSelectedTab] = useState(defaultTab)

  const pathname = usePathname()
  const params = useSearchParams();
  const router = useRouter();

  function tabChange(value) {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("tab", value);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  useEffect(function () {
    if (tabItems.includes(params.get("tab"))) {
      setSelectedTab(params.get("tab"))
    }
  }, [params])

  return {
    selectedTab,
    tabChange
  }
}