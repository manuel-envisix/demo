"use client";

import { useEffect, useState } from "react";
import type { PublicState } from "@/lib/cue";

export function useStageState(): { state: PublicState | null; online: boolean } {
  const [state, setState] = useState<PublicState | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let stop = false;
    let timer = 0;

    const tick = async () => {
      window.clearTimeout(timer);
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) throw new Error("state");
        const data = (await response.json()) as PublicState;
        if (!stop) {
          setState(data);
          setOnline(true);
        }
      } catch {
        if (!stop) setOnline(false);
      } finally {
        if (!stop) {
          const delay = document.hidden ? 4000 : 1000;
          timer = window.setTimeout(tick, delay);
        }
      }
    };

    const onVisible = () => {
      if (!document.hidden) void tick();
    };

    void tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { state, online };
}
