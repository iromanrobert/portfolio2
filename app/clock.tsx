"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState("");
  const [offset, setOffset] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Bucharest",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const off = -new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
      ).getTimezoneOffset() / 60;
      setTime(fmt.format(now));
      setOffset(`GMT +${off}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return (
    <span>
      {offset}: {time}
    </span>
  );
}
