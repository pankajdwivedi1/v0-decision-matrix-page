import fs from "fs";
import path from "path";

export interface RealTimeSession {
  sessionId: string;
  visitorId: string;
  fingerprint: string;
  lastActive: number;
  city: string;
  district: string;
  state: string;
  locationFormatted: string;
  country: string;
  countryCode: string;
  path: string;
  device: string;
  browser: string;
  gpu: string;
  screen: string;
  os: string;
  visitCount: number;
}

export interface VisitorRecord {
  visitorId: string;
  fingerprint: string;
  firstSeen: number;
  lastSeen: number;
  city: string;
  district: string;
  state: string;
  locationFormatted: string;
  country: string;
  countryCode: string;
  visitCount: number;
  pageViews: number;
  gpu: string;
  screen: string;
  os: string;
  lastPath: string;
  browsers: string[];
  knownSessions: string[];
  clusterKey: string;
}

export interface PageEvent {
  sessionId: string;
  visitorId: string;
  path: string;
  title: string;
  device: string;
  browser: string;
  country: string;
  countryCode: string;
  city: string;
  locationFormatted: string;
  isHeartbeat: boolean;
  timestamp: number;
}

class AnalyticsStore {
  private cacheFilePath: string;
  public sessions: Map<string, RealTimeSession> = new Map();
  public profiles: Map<string, VisitorRecord> = new Map();
  public events: PageEvent[] = [];

  constructor() {
    this.cacheFilePath = path.join(process.cwd(), ".analytics_data.json");
    this.loadFromDisk();
  }

  public loadFromDisk() {
    try {
      this.profiles.clear();
      this.sessions.clear();
      this.events = [];

      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, "utf8");
        const data = JSON.parse(raw);
        if (data.profiles && Array.isArray(data.profiles)) {
          data.profiles.forEach((p: VisitorRecord) => this.profiles.set(p.visitorId, p));
        }
        if (data.events && Array.isArray(data.events)) {
          this.events = data.events;
        }
      }
    } catch {
      // Ignore disk load error
    }
  }

  public saveToDisk() {
    try {
      const data = {
        profiles: Array.from(this.profiles.values()),
        events: this.events.slice(-2000),
      };
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch {
      // Ignore disk write error
    }
  }

  public recordTrack(data: {
    sessionId: string;
    visitorId: string;
    gpu?: string;
    gpuFamily?: string;
    screen?: string;
    os?: string;
    browser?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    clientIp?: string;
    path: string;
    title: string;
    device: string;
    isHeartbeat: boolean;
    isNewSession: boolean;
  }) {
    const now = Date.now();
    const vid = data.visitorId || data.sessionId;
    const country = data.country || "India";
    const countryCode = data.countryCode || "IN";
    const city = data.city || "";
    const district = data.district || "";
    const state = data.state || "";
    const os = data.os || "Android";
    const browser = data.browser || "Chrome";

    const parts = [city, district, state, country].filter(Boolean);
    const locationFormatted = parts.length > 0 ? parts.join(" / ") : country;

    // Cross-Browser Hardware Cluster Key (matches same device across different mobile/desktop browsers)
    const normalizedGpu = (data.gpuFamily || data.gpu || "").toLowerCase().slice(0, 15);
    const clusterKey = `${os}_${data.device}_${normalizedGpu}_${locationFormatted}`;

    // 1. Find existing profile by Visitor ID or Cluster Key (Cross-Browser Unification)
    let profile = this.profiles.get(vid);

    if (!profile) {
      for (const existing of this.profiles.values()) {
        if (existing.clusterKey === clusterKey) {
          profile = existing;
          break;
        }
      }
    }

    const effectiveId = profile ? profile.visitorId : vid;
    const fp = effectiveId.startsWith("#") ? effectiveId : effectiveId.replace("rw_fp_", "#");

    if (!profile) {
      profile = {
        visitorId: effectiveId,
        fingerprint: fp,
        firstSeen: now,
        lastSeen: now,
        city,
        district,
        state,
        locationFormatted,
        country,
        countryCode,
        visitCount: 1,
        pageViews: 1,
        gpu: data.gpu || "Hardware GPU",
        screen: data.screen || "Display",
        os,
        lastPath: data.path,
        browsers: [browser],
        knownSessions: [data.sessionId],
        clusterKey,
      };
      this.profiles.set(effectiveId, profile);
    } else {
      if (!profile.knownSessions) profile.knownSessions = [];
      if (!profile.browsers) profile.browsers = [];
      if (!profile.browsers.includes(browser)) profile.browsers.push(browser);

      const isKnown = profile.knownSessions.includes(data.sessionId);

      if (!isKnown || data.isNewSession) {
        profile.visitCount += 1;
        if (!isKnown) profile.knownSessions.push(data.sessionId);
      }

      if (!data.isHeartbeat) {
        profile.pageViews += 1;
      }
      profile.lastSeen = now;
      profile.lastPath = data.path;
      if (locationFormatted) profile.locationFormatted = locationFormatted;
      if (data.gpu) profile.gpu = data.gpu;
      if (data.screen) profile.screen = data.screen;
      profile.clusterKey = clusterKey;
    }

    // 2. Update Live Active Sessions
    this.sessions.set(effectiveId, {
      sessionId: data.sessionId,
      visitorId: effectiveId,
      fingerprint: fp,
      lastActive: now,
      city: profile.city,
      district: profile.district,
      state: profile.state,
      locationFormatted: profile.locationFormatted,
      country: profile.country,
      countryCode: profile.countryCode,
      path: data.path,
      device: data.device,
      browser: profile.browsers.join(", "),
      gpu: profile.gpu,
      screen: profile.screen,
      os: profile.os,
      visitCount: profile.visitCount,
    });

    // 3. Record event
    this.events.push({
      sessionId: data.sessionId,
      visitorId: effectiveId,
      path: data.path,
      title: data.title,
      device: data.device,
      browser,
      country: profile.country,
      countryCode: profile.countryCode,
      city: profile.city,
      locationFormatted: profile.locationFormatted,
      isHeartbeat: data.isHeartbeat,
      timestamp: now,
    });

    if (this.events.length > 5000) {
      this.events.shift();
    }

    this.saveToDisk();

    return profile;
  }
}

// Global persistent instance
const globalStore = (global as any).__RW_ANALYTICS_STORE__ || new AnalyticsStore();
(global as any).__RW_ANALYTICS_STORE__ = globalStore;

export const analyticsStore: AnalyticsStore = globalStore;
