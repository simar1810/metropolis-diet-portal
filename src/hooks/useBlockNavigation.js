"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function useBlockNavigation({ shouldBlock, onAttemptToLeave }) {
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  // Block browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldBlock()) {
        const confirmLeave = window.confirm("You have unsaved changes. Do you want to leave?");
        if (!confirmLeave) {
          if (onAttemptToLeave) onAttemptToLeave();
          router.push(prevPath.current);
        } else {
          prevPath.current = pathname;
        }

        if (onAttemptToLeave) onAttemptToLeave();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock, onAttemptToLeave]);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      if (shouldBlock()) {
        const confirmLeave = window.confirm("You have unsaved changes. Do you want to leave?");
        if (!confirmLeave) {
          if (onAttemptToLeave) onAttemptToLeave();
          router.push(prevPath.current); // cancel and revert route
        } else {
          prevPath.current = pathname; // allow route change
        }
      } else {
        prevPath.current = pathname; // no block needed
      }
    }
  }, [pathname]);
}
