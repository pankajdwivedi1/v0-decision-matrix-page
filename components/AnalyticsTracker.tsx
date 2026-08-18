"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { getDeviceFingerprint } from "@/lib/fingerprint";

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const fingerprintRef = useRef<{
    visitorId: string;
    gpu: string;
    gpuFamily: string;
    res: string;
    os: string;
    browser: string;
    cores: number;
  } | null>(null);
  const geoRef = useRef<{ city: string; region: string; regionCode: string; country: string } | null>(null);
  const tabTrackedRef = useRef(false);

  useEffect(() => {
    // Don't track admin pages to keep public stats clean
    if (pathname?.startsWith("/admin")) return;

    // Real live IP geolocation lookup
    if (!geoRef.current) {
      try {
        const cachedGeo = sessionStorage.getItem("rw_analytics_geo_data");
        if (cachedGeo) {
          geoRef.current = JSON.parse(cachedGeo);
        } else {
          fetch("https://ipapi.co/json/")
            .then((r) => r.json())
            .then((data) => {
              if (data && (data.city || data.country_name)) {
                const geoData = {
                  city: data.city || data.region || "",
                  region: data.region || "",
                  regionCode: data.region_code || "",
                  country: data.country_name || data.country || "India",
                };
                geoRef.current = geoData;
                sessionStorage.setItem("rw_analytics_geo_data", JSON.stringify(geoData));
              }
            })
            .catch(() => {
              fetch("https://get.geojs.io/v1/ip/geo.json")
                .then((r) => r.json())
                .then((data) => {
                  if (data) {
                    const geoData = {
                      city: data.city || data.region || "",
                      region: data.region || "",
                      regionCode: "",
                      country: data.country || "India",
                    };
                    geoRef.current = geoData;
                    sessionStorage.setItem("rw_analytics_geo_data", JSON.stringify(geoData));
                  }
                })
                .catch(() => {});
            });
        }
      } catch {
        // Silently continue
      }
    }

    // Get or create anonymous session ID for this specific tab
    let sessionId = "";
    let isNewTabSession = false;
    try {
      sessionId = sessionStorage.getItem("rw_analytics_session_id") || "";
      if (!sessionId) {
        sessionId = "rw_sess_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
        sessionStorage.setItem("rw_analytics_session_id", sessionId);
        isNewTabSession = true;
      }
    } catch {
      sessionId = "rw_sess_" + Math.random().toString(36).substring(2, 12);
      isNewTabSession = true;
    }

    // Determine device category
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

    // Detect browser
    let browser = "Other";
    if (userAgent.includes("edg/")) browser = "Edge";
    else if (userAgent.includes("samsungbrowser/")) browser = "Samsung Internet";
    else if (userAgent.includes("opr/") || userAgent.includes("opera/")) browser = "Opera";
    else if (userAgent.includes("chrome/")) browser = "Chrome";
    else if (userAgent.includes("safari/") && !userAgent.includes("chrome")) browser = "Safari";
    else if (userAgent.includes("firefox/")) browser = "Firefox";

    const searchStr = typeof window !== "undefined" ? window.location.search : "";
    const fullPath = (pathname || "/") + searchStr;

    const sendTrackEvent = async (isHeartbeat = false) => {
      try {
        // Calculate or reuse hardware fingerprint hash
        if (!fingerprintRef.current) {
          const fp = await getDeviceFingerprint();
          fingerprintRef.current = {
            visitorId: fp.visitorId,
            gpu: fp.details.gpuRenderer,
            gpuFamily: fp.details.gpuFamily,
            res: fp.details.screenResolution,
            os: fp.details.os,
            browser: fp.details.browser || browser,
            cores: fp.details.cpuCores,
          };
        }

        const geo = geoRef.current;

        const payload = JSON.stringify({
          sessionId,
          visitorId: fingerprintRef.current.visitorId,
          gpuRenderer: fingerprintRef.current.gpu,
          gpuFamily: fingerprintRef.current.gpuFamily,
          screenRes: fingerprintRef.current.res,
          os: fingerprintRef.current.os,
          browser: fingerprintRef.current.browser || browser,
          cpuCores: fingerprintRef.current.cores,
          city: geo?.city || "",
          district: geo?.region || "",
          state: geo?.regionCode || geo?.region || "",
          country: geo?.country || "",
          path: fullPath,
          title: document.title || "RankoWise",
          referrer: document.referrer || "Direct",
          device: deviceType,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          language: navigator.language || "en",
          isHeartbeat,
          isNewSession: isNewTabSession && !tabTrackedRef.current,
          timestamp: new Date().toISOString(),
        });

        tabTrackedRef.current = true;

        if (navigator.sendBeacon && !isHeartbeat) {
          navigator.sendBeacon("/api/track", payload);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently fail on tracking error
      }
    };

    // Send initial pageview with calculated digital fingerprint
    sendTrackEvent(false);

    // Send periodic heartbeat every 30s for live real-time presence
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      sendTrackEvent(true);
    }, 30000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [pathname]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
