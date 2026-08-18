/**
 * RankoWise - Cross-Browser Hardware-Normalized Fingerprinting Engine
 * 
 * Generates an invariant, deterministic hardware fingerprint hash that remains
 * IDENTICAL across different browsers (Chrome, Firefox, Opera, Edge, Samsung)
 * on the SAME physical computer or smartphone.
 */

export interface DeviceFingerprintResult {
  /** The unique cross-browser hardware fingerprint hash */
  visitorId: string;
  /** Summary details about the device hardware and software */
  details: {
    os: string;
    browser: string;
    deviceType: "Desktop" | "Mobile" | "Tablet";
    gpuRenderer: string;
    gpuFamily: string;
    screenResolution: string;
    screenRatio: string;
    cpuCores: number;
    ramEstimate: string;
    timezone: string;
    colorDepth: number;
    touchPoints: number;
  };
  components: Record<string, string | number | boolean>;
}

// ─── 1. MurmurHash3 Fast 32-bit Hash ───────────────────────────────────────────
function murmurhash3_32_gc(key: string, seed = 0): string {
  let remainder = key.length & 3;
  let bytes = key.length - remainder;
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let i = 0;

  while (i < bytes) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    const h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  let k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return ("00000000" + (h1 >>> 0).toString(16)).slice(-8);
}

// ─── 2. GPU Chipset Family Normalization ───────────────────────────────────────
function normalizeGPU(rawGpu: string): { family: string; raw: string } {
  if (!rawGpu || rawGpu === "Unknown") return { family: "Standard GPU", raw: "Graphics Processor" };

  const s = rawGpu.toLowerCase();

  // Qualcomm Adreno Series (Adreno 512, 540, 618, 640, 730, etc.)
  if (s.includes("adreno")) {
    if (s.includes("512") || s.includes("540") || s.includes("50")) return { family: "Qualcomm Adreno 5xx Series", raw: rawGpu };
    if (s.includes("618") || s.includes("640") || s.includes("60")) return { family: "Qualcomm Adreno 6xx Series", raw: rawGpu };
    if (s.includes("730") || s.includes("70")) return { family: "Qualcomm Adreno 7xx Series", raw: rawGpu };
    return { family: "Qualcomm Adreno Series", raw: rawGpu };
  }

  // ARM Mali Series
  if (s.includes("mali")) {
    return { family: "ARM Mali Graphics Series", raw: rawGpu };
  }

  // Intel HD / UHD / Iris Series
  if (s.includes("intel")) {
    if (s.includes("620") || s.includes("630") || s.includes("600")) return { family: "Intel HD/UHD 600 Series", raw: rawGpu };
    if (s.includes("iris")) return { family: "Intel Iris Xe Graphics", raw: rawGpu };
    return { family: "Intel Integrated Graphics", raw: rawGpu };
  }

  // NVIDIA GeForce Series
  if (s.includes("nvidia") || s.includes("geforce") || s.includes("rtx") || s.includes("gtx")) {
    if (s.includes("40") || s.includes("4090") || s.includes("4080") || s.includes("4070") || s.includes("4060")) return { family: "NVIDIA GeForce RTX 40-Series", raw: rawGpu };
    if (s.includes("30") || s.includes("3090") || s.includes("3080") || s.includes("3070") || s.includes("3060")) return { family: "NVIDIA GeForce RTX 30-Series", raw: rawGpu };
    if (s.includes("20") || s.includes("2080") || s.includes("2070") || s.includes("2060")) return { family: "NVIDIA GeForce RTX 20-Series", raw: rawGpu };
    if (s.includes("16") || s.includes("10")) return { family: "NVIDIA GeForce GTX Series", raw: rawGpu };
    return { family: "NVIDIA GeForce Graphics", raw: rawGpu };
  }

  // Apple Metal (M1, M2, M3, Apple GPU)
  if (s.includes("apple")) {
    return { family: "Apple Silicon Metal GPU", raw: rawGpu };
  }

  // AMD Radeon
  if (s.includes("amd") || s.includes("radeon")) {
    return { family: "AMD Radeon Graphics", raw: rawGpu };
  }

  return { family: "Hardware Graphics Chip", raw: rawGpu };
}

// ─── 3. Screen Physical Geometry Normalization ─────────────────────────────────
function normalizeScreen(): { ratio: string; widthBucket: string; raw: string } {
  if (typeof window === "undefined") return { ratio: "16:9", widthBucket: "desktop", raw: "1920x1080" };

  const w = window.screen.width;
  const h = window.screen.height;
  const maxDim = Math.max(w, h);
  const minDim = Math.min(w, h);
  const rawRatio = maxDim / (minDim || 1);

  // Normalize to standard physical aspect ratio buckets
  let ratio = "16:9";
  if (rawRatio >= 2.1) ratio = "20:9";
  else if (rawRatio >= 1.95) ratio = "19.5:9";
  else if (rawRatio >= 1.7) ratio = "16:9";
  else if (rawRatio >= 1.55) ratio = "16:10";
  else if (rawRatio >= 1.3) ratio = "4:3";

  // Bucket width to ignore minor browser address bar padding
  let widthBucket = "desktop-standard";
  if (minDim <= 430) widthBucket = "mobile-portrait";
  else if (minDim <= 850) widthBucket = "tablet-medium";
  else if (maxDim >= 2500) widthBucket = "desktop-4k-qhd";
  else if (maxDim >= 1800) widthBucket = "desktop-1080p";
  else widthBucket = "desktop-hd";

  return {
    ratio,
    widthBucket,
    raw: `${w}x${h} (${window.devicePixelRatio || 1}x)`,
  };
}

// ─── 4. WebGL Query ────────────────────────────────────────────────────────────
function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { vendor: "Generic", renderer: "Standard GPU" };

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

    return {
      vendor: String(vendor || "Generic"),
      renderer: String(renderer || "Standard GPU"),
    };
  } catch {
    return { vendor: "Generic", renderer: "Standard GPU" };
  }
}

// ─── 5. OS Normalization ───────────────────────────────────────────────────────
function getNormalizedOS(): { os: string; isMobile: boolean } {
  const ua = navigator.userAgent;
  let os = "Windows";
  let isMobile = false;

  if (ua.includes("Android")) {
    os = "Android";
    isMobile = true;
  } else if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) {
    os = "iOS";
    isMobile = true;
  } else if (ua.includes("Mac")) {
    os = "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Win")) {
    os = "Windows";
  }

  return { os, isMobile };
}

// ─── 6. Main Cross-Browser Hardware Fingerprint Generator ─────────────────────
export async function getDeviceFingerprint(): Promise<DeviceFingerprintResult> {
  if (typeof window === "undefined") {
    return {
      visitorId: "rw_fp_server",
      details: {
        os: "Server",
        browser: "Node",
        deviceType: "Desktop",
        gpuRenderer: "Server GPU",
        gpuFamily: "Server GPU",
        screenResolution: "N/A",
        screenRatio: "16:9",
        cpuCores: 4,
        ramEstimate: "4 GB",
        timezone: "UTC",
        colorDepth: 24,
        touchPoints: 0,
      },
      components: {},
    };
  }

  const webgl = getWebGLInfo();
  const gpuNorm = normalizeGPU(webgl.renderer);
  const screenNorm = normalizeScreen();
  const osInfo = getNormalizedOS();

  const cpuCores = navigator.hardwareConcurrency || 4;
  const ramGB = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "4+ GB";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const touchPoints = (navigator.maxTouchPoints || 0) > 0 ? 1 : 0; // Binary (has touch or not)
  const colorDepth = window.screen.colorDepth || 24;

  // Invariant Hardware Components (100% Cross-Browser Stable)
  const hardwareComponents: Record<string, string | number | boolean> = {
    os: osInfo.os,
    gpuFamily: gpuNorm.family,
    cpuCores: cpuCores,
    screenRatio: screenNorm.ratio,
    widthBucket: screenNorm.widthBucket,
    touchSupport: touchPoints,
    timezone: timezone,
    colorDepth: colorDepth,
  };

  // Generate 64-bit Cross-Browser Invariant Hash
  const rawKey = JSON.stringify(hardwareComponents);
  const hashPart1 = murmurhash3_32_gc(rawKey, 0x5a5a5a5a);
  const hashPart2 = murmurhash3_32_gc(rawKey, 0xa5a5a5a5);
  const visitorId = `rw_fp_${hashPart1}${hashPart2}`;

  const deviceType: "Desktop" | "Mobile" | "Tablet" = osInfo.isMobile ? "Mobile" : "Desktop";

  let browser = "Chrome";
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";
  else if (ua.includes("SamsungBrowser/")) browser = "Samsung Internet";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Chrome/")) browser = "Chrome";

  return {
    visitorId,
    details: {
      os: osInfo.os,
      browser,
      deviceType,
      gpuRenderer: webgl.renderer,
      gpuFamily: gpuNorm.family,
      screenResolution: screenNorm.raw,
      screenRatio: screenNorm.ratio,
      cpuCores,
      ramEstimate: ramGB,
      timezone,
      colorDepth,
      touchPoints: navigator.maxTouchPoints || 0,
    },
    components: hardwareComponents,
  };
}
