"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TimePickerClock({ defaultValue, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const parseDefault = () => {
    if (!defaultValue) return { hour: 11, minute: 7, period: "AM" };
    const [time, period] = defaultValue.split(" ");
    const [hour, minute] = time.split(":").map(Number);
    return { hour, minute, period: period || "AM" };
  };

  const [time, setTime] = React.useState(parseDefault);
  const [selecting, setSelecting] = React.useState("hour");

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleConfirm = () => {
    setIsOpen(false);
    onChange?.(`${time.hour.toString().padStart(2, "0")}:${time.minute
      .toString()
      .padStart(2, "0")} ${time.period}`);
  };

  const handleHourClick = (h) => {
    setTime((t) => ({ ...t, hour: h }));
    setSelecting("minute");
  };

  const handleMinuteClick = (m) => {
    setTime((t) => ({ ...t, minute: m }));
  };

  const displayClock = selecting === "hour" ? hours : minutes;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
          >
            {`${time.hour.toString().padStart(2, "0")}:${time.minute
              .toString()
              .padStart(2, "0")} ${time.period}`}
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-black border-zinc-800 text-white rounded-2xl p-6 w-80 flex flex-col items-center">
          <p className="text-gray-400 mb-4">
            {selecting === "hour" ? "Select hour" : "Select minute"}
          </p>

          {/* Clock Face */}
          <div className="relative w-48 h-48 rounded-full border border-zinc-700 flex items-center justify-center">
            {displayClock.map((val, i) => {
              const total = selecting === "hour" ? 12 : 12; // 12 positions
              const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
              const x = 90 + 70 * Math.cos(angle);
              const y = 90 + 70 * Math.sin(angle);
              const isActive =
                selecting === "hour"
                  ? val === time.hour
                  : val === time.minute;
              return (
                <button
                  key={val}
                  onClick={() =>
                    selecting === "hour"
                      ? handleHourClick(val)
                      : handleMinuteClick(val)
                  }
                  className={`absolute text-sm w-8 h-8 rounded-full flex items-center justify-center transition ${isActive
                    ? "bg-green-500 text-black scale-110"
                    : "text-gray-400 hover:text-white"
                    }`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {val.toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* AM / PM Toggle */}
          <div className="flex gap-4 mt-6">
            {["AM", "PM"].map((p) => (
              <Button
                key={p}
                variant="outline"
                className={`w-16 ${time.period === p
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 border-zinc-700 text-white"
                  }`}
                onClick={() => setTime((t) => ({ ...t, period: p }))}
              >
                {p}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between w-full mt-6">
            {selecting === "minute" ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setSelecting("hour")}
                  className="text-gray-400"
                >
                  Back
                </Button>
                <Button
                  className="bg-green-500 text-black hover:bg-green-400"
                  onClick={handleConfirm}
                >
                  OK
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-500 text-black hover:bg-green-400"
                  onClick={() => setSelecting("minute")}
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
