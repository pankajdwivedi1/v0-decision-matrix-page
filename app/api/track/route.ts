import { NextRequest, NextResponse } from "next/server";
import { analyticsStore } from "@/lib/analytics-store";
import { db } from "@/lib/firebase-admin";

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  US: "United States",
  IN: "India",
  GB: "United Kingdom",
  DE: "Germany",
  CA: "Canada",
  FR: "France",
  AU: "Australia",
  JP: "Japan",
  SG: "Singapore",
  AE: "United Arab Emirates",
  BR: "Brazil",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  MX: "Mexico",
  SA: "Saudi Arabia",
  KR: "South Korea",
  ID: "Indonesia",
  TH: "Thailand",
  EG: "Egypt",
  ZA: "South Africa",
  NG: "Nigeria",
  PK: "Pakistan",
  BD: "Bangladesh",
  TR: "Turkey",
  RU: "Russia",
  SE: "Sweden",
  CH: "Switzerland",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId = "anon",
      visitorId = "anon_fp",
      gpuRenderer = "",
      screenRes = "",
      os = "",
      cpuCores = 4,
      city: clientCity = "",
      district: clientDistrict = "",
      state: clientState = "",
      country: clientCountry = "",
      path = "/",
      title = "RankoWise",
      referrer = "Direct",
      device = "Desktop",
      browser = "Chrome",
      timezone = "",
      language = "en",
      isHeartbeat = false,
      isNewSession = false,
    } = body;

    // Detect country from Cloudflare / Proxy headers
    const headerCountry =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("x-vercel-ip-country") ||
      "";

    const headerCity =
      req.headers.get("cf-ipcity") ||
      req.headers.get("x-vercel-ip-city") ||
      "";

    let country = clientCountry || (headerCountry && COUNTRY_CODE_TO_NAME[headerCountry.toUpperCase()]) || "India";
    let countryCode = headerCountry ? headerCountry.toUpperCase() : "IN";
    let city = clientCity || headerCity || "";
    let district = clientDistrict || "";
    let state = clientState || "";

    const profile = analyticsStore.recordTrack({
      sessionId,
      visitorId: visitorId !== "anon_fp" ? visitorId : sessionId,
      gpu: gpuRenderer,
      gpuFamily: body.gpuFamily || "",
      screen: screenRes,
      os,
      browser: body.browser || browser,
      city,
      district,
      state,
      country,
      countryCode,
      path,
      title,
      device,
      isHeartbeat,
      isNewSession,
    });

    // Asynchronously log to Firestore if enabled
    if (!isHeartbeat) {
      try {
        db.collection("analytics_pageviews")
          .add({
            sessionId,
            visitorId: profile.visitorId,
            gpuRenderer,
            location: profile.locationFormatted,
            city: profile.city,
            path,
            title,
            device,
            browser,
            country: profile.country,
            countryCode: profile.countryCode,
            referrer,
            timestamp: new Date(),
          })
          .catch(() => {});
      } catch {
        // Fallback silently if DB is not configured yet
      }
    }

    return NextResponse.json({
      success: true,
      visitorId: profile.visitorId,
      location: profile.locationFormatted,
      visitCount: profile.visitCount,
      pageViews: profile.pageViews,
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
