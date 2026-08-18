import { NextRequest, NextResponse } from "next/server";
import { analyticsStore } from "@/lib/analytics-store";

const ADMIN_PASSWORD = "pankajdwivedi81";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  IN: "🇮🇳",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  FR: "🇫🇷",
  AU: "🇦🇺",
  JP: "🇯🇵",
  SG: "🇸🇬",
  AE: "🇦🇪",
  BR: "🇧🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  NL: "🇳🇱",
  MX: "🇲🇽",
  SA: "🇸🇦",
  KR: "🇰🇷",
  ID: "🇮🇩",
  TH: "🇹🇭",
  EG: "🇪🇬",
  ZA: "🇿🇦",
  NG: "🇳🇬",
  PK: "🇵🇰",
  BD: "🇧🇩",
  TR: "🇹🇷",
  RU: "🇷🇺",
  SE: "🇸🇪",
  CH: "🇨🇭",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    analyticsStore.loadFromDisk();

    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    // 1. Live Active Sessions (within 5 minutes)
    const activeSessionsList: any[] = [];
    analyticsStore.sessions.forEach((s) => {
      const elapsed = now - s.lastActive;
      if (elapsed <= FIVE_MINUTES) {
        activeSessionsList.push({
          sessionId: s.sessionId.substring(0, 10),
          fingerprint: s.fingerprint,
          city: s.city,
          country: s.country,
          countryCode: s.countryCode,
          flag: COUNTRY_FLAGS[s.countryCode] || "🌐",
          locationFormatted: s.locationFormatted || (s.city ? `${s.city} / ${s.country}` : s.country),
          path: s.path,
          device: s.device,
          gpu: s.gpu,
          screen: s.screen,
          os: s.os,
          visitCount: s.visitCount,
          secondsAgo: Math.max(1, Math.round(elapsed / 1000)),
        });
      }
    });

    activeSessionsList.sort((a, b) => a.secondsAgo - b.secondsAgo);

    // 2. Recognized Returning Visitors from Store
    const profilesList: any[] = [];
    analyticsStore.profiles.forEach((p) => {
      const elapsedMins = Math.round((now - p.lastSeen) / 60000);
      const lastActiveAgo = elapsedMins < 1 ? "Just now" : elapsedMins < 60 ? `${elapsedMins}m ago` : `${Math.round(elapsedMins / 60)}h ago`;

      profilesList.push({
        fingerprint: p.fingerprint,
        city: p.city,
        country: p.country,
        countryCode: p.countryCode,
        locationFormatted: p.locationFormatted || (p.city ? `${p.city} / ${p.country}` : p.country),
        visitCount: p.visitCount,
        pageViews: p.pageViews,
        gpu: p.gpu,
        screen: p.screen,
        lastActiveAgo,
      });
    });

    profilesList.sort((a, b) => b.visitCount - a.visitCount);

    // 3. Events Aggregation
    const events = analyticsStore.events;
    const todaySessions = new Set<string>();
    const monthlySessions = new Set<string>();
    let totalPageViews = 0;

    const countryMap: Record<string, { country: string; code: string; count: number; city: string }> = {};
    const deviceMap: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const pathMap: Record<string, number> = {};

    events.forEach((evt) => {
      const age = now - evt.timestamp;
      if (age <= TWENTY_FOUR_HOURS) todaySessions.add(evt.visitorId);
      if (age <= THIRTY_DAYS) monthlySessions.add(evt.visitorId);

      if (!evt.isHeartbeat) {
        totalPageViews++;
        const p = evt.path || "/";
        pathMap[p] = (pathMap[p] || 0) + 1;
      }

      if (evt.countryCode) {
        if (!countryMap[evt.countryCode]) {
          countryMap[evt.countryCode] = {
            country: evt.country,
            code: evt.countryCode,
            count: 0,
            city: evt.locationFormatted || evt.city || "",
          };
        }
        countryMap[evt.countryCode].count += 1;
      }

      if (evt.device && deviceMap[evt.device] !== undefined) {
        deviceMap[evt.device]++;
      } else {
        deviceMap.Desktop++;
      }
    });

    // Ensure realistic baseline when live visitors browse
    const totalVisitorsCount = profilesList.length;
    const todayVisitors = Math.max(todaySessions.size, totalVisitorsCount > 0 ? 1 : 0);
    const monthlyVisitors = Math.max(monthlySessions.size, totalVisitorsCount > 0 ? 1 : 0);
    const computedTotalPageViews = Math.max(totalPageViews, profilesList.reduce((acc, p) => acc + p.pageViews, 0));

    // Countries List
    const totalCountryHits = Object.values(countryMap).reduce((sum, item) => sum + item.count, 0) || 1;
    const countries = Object.values(countryMap)
      .map((item) => ({
        country: item.country,
        code: item.code,
        city: item.city,
        flag: COUNTRY_FLAGS[item.code] || "🌐",
        count: item.count,
        percentage: Math.round((item.count / totalCountryHits) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // If no countries tracked yet but visitors exist
    if (countries.length === 0 && profilesList.length > 0) {
      const first = profilesList[0];
      countries.push({
        country: first.country,
        code: first.countryCode,
        city: first.locationFormatted,
        flag: COUNTRY_FLAGS[first.countryCode] || "🌐",
        count: 1,
        percentage: 100,
      });
    }

    // Devices
    const totalDevices = deviceMap.Desktop + deviceMap.Mobile + deviceMap.Tablet || 1;
    const devices = [
      { name: "Desktop", count: deviceMap.Desktop, percentage: totalDevices > 0 ? Math.round((deviceMap.Desktop / totalDevices) * 100) : 100 },
      { name: "Mobile", count: deviceMap.Mobile, percentage: totalDevices > 0 ? Math.round((deviceMap.Mobile / totalDevices) * 100) : 0 },
      { name: "Tablet", count: deviceMap.Tablet, percentage: totalDevices > 0 ? Math.round((deviceMap.Tablet / totalDevices) * 100) : 0 },
    ];

    // Daily Trends for past 14 days
    const dailyTrends = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayEvents = events.filter((e) => {
        const evtDate = new Date(e.timestamp);
        return evtDate.toDateString() === d.toDateString();
      });
      const dayVisitors = new Set(dayEvents.map((e) => e.visitorId)).size;
      const dayViews = dayEvents.filter((e) => !e.isHeartbeat).length;

      dailyTrends.push({
        date: dateStr,
        visitors: i === 0 ? todayVisitors : dayVisitors,
        pageViews: i === 0 ? computedTotalPageViews : dayViews,
      });
    }

    // Top Pages
    const topPages = Object.entries(pathMap).map(([p, views]) => ({
      path: p,
      name: p === "/" ? "RankoWise Home Landing Page" : p.startsWith("/application") ? "Decision Matrix & Algorithms" : p,
      views,
      percentage: computedTotalPageViews > 0 ? Math.round((views / computedTotalPageViews) * 100) : 100,
    })).sort((a, b) => b.views - a.views);

    return NextResponse.json({
      success: true,
      data: {
        realTimeActiveUsers: activeSessionsList.length,
        realTimeSessions: activeSessionsList,
        topReturningVisitors: profilesList,
        todayVisitors,
        monthlyVisitors,
        totalPageViews: computedTotalPageViews,
        countries,
        dailyTrends,
        devices,
        topPages: topPages.length > 0 ? topPages : [{ path: "/application", name: "Decision Matrix & Algorithms", views: computedTotalPageViews || 1, percentage: 100 }],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load analytics" }, { status: 500 });
  }
}
