import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Fajr 🌅",
  Dhuhr: "Dhuhr ☀️",
  Asr: "Asr 🌤️",
  Maghrib: "Maghrib 🌇",
  Isha: "Isha 🌙",
};

export function useAdhanNotifications(enabled: boolean) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());
  const lastDateRef = useRef<string>("");

  const fetchPrayerTimes = useCallback(async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      if (dateStr === lastDateRef.current && prayerTimes) return;

      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=23.588&longitude=58.3829&method=3`
      );
      const data = await res.json();
      if (data?.data?.timings) {
        const t = data.data.timings;
        setPrayerTimes({
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
        });
        lastDateRef.current = dateStr;
        notifiedRef.current = new Set();
      }
    } catch (err) {
      console.error("Failed to fetch prayer times:", err);
    }
  }, [prayerTimes]);

  useEffect(() => {
    if (!enabled) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchPrayerTimes();

    const interval = setInterval(() => {
      fetchPrayerTimes();

      if (!prayerTimes) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      for (const [prayer, time] of Object.entries(prayerTimes)) {
        const prayerTime24 = time.replace(/ \(.*\)/, "");
        if (currentTime === prayerTime24 && !notifiedRef.current.has(prayer)) {
          notifiedRef.current.add(prayer);

          const label = PRAYER_NAMES[prayer] || prayer;
          toast(`🕌 ${label} Adhan Time`, {
            description: `It's time for ${prayer} prayer in Oman (${time})`,
            duration: 15000,
          });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`🕌 ${label} - Adhan Time`, {
              body: `It's time for ${prayer} prayer (${time})`,
              icon: "☪️",
            });
          }
        }
      }
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [enabled, prayerTimes, fetchPrayerTimes]);

  return prayerTimes;
}
