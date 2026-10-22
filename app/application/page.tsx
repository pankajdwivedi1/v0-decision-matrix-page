"use client";

import dynamic from "next/dynamic";

const ApplicationContent = dynamic(() => import("./ApplicationContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-700">Loading RankoWise Calculator...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <ApplicationContent />;
}
