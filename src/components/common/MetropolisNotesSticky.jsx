"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import { Pen } from "lucide-react";
import { mutate } from "swr";

export default function MetropolisNotesSticky({
  clientId,
  defaultValue,
  swrKey,
  onSaved,
  title = "Metropolis Notes",
  stickyTopClass = "top-[76px]",
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const isDirty = useMemo(
    () => (value || "") !== (defaultValue || ""),
    [value, defaultValue]
  );

  const preview = useMemo(() => {
    const text = (defaultValue || "").trim();
    if (!text) return "No notes yet.";
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }, [defaultValue]);

  async function save() {
    try {
      if (!clientId) return;
      setLoading(true);
      const response = await sendData(
        "app/metropolis/client/diet-note",
        { clientId, note: value },
        "POST"
      );
      if (response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to update notes");
      }
      toast.success(response.message || "Diet note updated");
      if (typeof onSaved === "function") onSaved(value, response);
      if (swrKey) mutate(swrKey);
      setOpen(false);
    } catch (e) {
      toast.error(e?.message || "Failed to update notes");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setValue(defaultValue || "");
    setOpen(false);
  }

  return (
    <div
      className={[
        "sticky z-[20] bg-white rounded-[18px] border-1 px-4 py-3",
        stickyTopClass,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold leading-tight">{title}</h3>
          {!open && (
            <p className="mt-1 text-[14px] text-[var(--dark-2)] leading-[1.4] whitespace-pre-wrap">
              {preview}
            </p>
          )}
        </div>

        {open ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" disabled={loading} onClick={close}>
              Close
            </Button>
            <Button variant="wz" disabled={loading || !isDirty} onClick={save}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="shrink-0"
            aria-label={`Edit ${title}`}
          >
            <Pen />
          </Button>
        )}
      </div>

      {open && (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write Metropolis notes for this client…"
          className="focus-visible:ring-[0px] min-h-[110px] mt-3"
        />
      )}
    </div>
  );
}

