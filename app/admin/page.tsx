"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Inbox,
  RefreshCw,
  LogOut,
  Users,
  Globe,
  Activity,
  TrendingUp,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  Clock,
  Sparkles,
  BarChart3,
  MessageSquare,
  Compass,
} from "lucide-react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Login Schema
const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

interface Message {
  id: string;
  name: string;
  email: string;
  nationality: string;
  message: string;
  timestamp: string;
}

interface CountryData {
  country: string;
  code: string;
  flag: string;
  count: number;
  percentage: number;
}

interface AnalyticsData {
  realTimeActiveUsers: number;
  realTimeSessions: Array<{
    sessionId: string;
    country: string;
    countryCode: string;
    flag: string;
    path: string;
    device: string;
    secondsAgo: number;
  }>;
  todayVisitors: number;
  monthlyVisitors: number;
  totalPageViews: number;
  countries: CountryData[];
  dailyTrends: Array<{ date: string; visitors: number; pageViews: number }>;
  devices: Array<{ name: string; count: number; percentage: number }>;
  topPages: Array<{ path: string; name: string; views: number; percentage: number }>;
  lastUpdated: string;
}

const DEVICE_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "messages">("analytics");
  const [sessionPassword, setSessionPassword] = useState("");

  // Data states
  const [messages, setMessages] = useState<Message[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  // Fetch all dashboard data
  const fetchData = async (password: string) => {
    setLoading(true);
    try {
      // 1. Fetch Messages
      const msgRes = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const msgData = await msgRes.json();

      // 2. Fetch Analytics
      const analyticsRes = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const analyticsResult = await analyticsRes.json();

      if (msgRes.ok && msgData.success) {
        setMessages(msgData.messages || []);
        setIsAuthenticated(true);
        setSessionPassword(password);
        if (!isAuthenticated) toast.success("Welcome to RankoWise Admin Dashboard");
      } else {
        toast.error(msgData.error || "Authentication failed");
        if (isAuthenticated) setIsAuthenticated(false);
      }

      if (analyticsRes.ok && analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh real-time stats every 15 seconds if authenticated
  useEffect(() => {
    if (!isAuthenticated || !sessionPassword || !autoRefresh) return;
    const interval = setInterval(() => {
      fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: sessionPassword }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setAnalytics(resData.data);
        })
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionPassword, autoRefresh]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    fetchData(values.password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionPassword("");
    setMessages([]);
    setAnalytics(null);
    loginForm.reset();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
        {/* Background glow decorations */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md bg-slate-950/80 border-slate-800 text-white shadow-2xl backdrop-blur-xl relative z-10">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-serif font-bold text-white tracking-tight">
              RankoWise Admin
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Enter your secure master password to access analytics & messages
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                        Master Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          className="bg-slate-900/90 border-slate-700 text-white focus:border-blue-500 h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Unlock Admin Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-serif font-bold text-lg">
              RW
            </div>
            <div>
              <div className="font-serif font-bold text-base text-white tracking-tight flex items-center gap-2">
                RankoWise
                <span className="text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Traffic Analytics
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "messages"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Messages ({messages.length})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(sessionPassword)}
              disabled={loading}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs h-9"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Title with Live status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                  Audience & Geographic Analytics
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Real-time visitor telemetry, daily traffic volume, and global country breakdown
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Live Telemetry Active
                </span>
              </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Real-time Users */}
              <Card className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-800/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="w-20 h-20 text-emerald-400" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <span>Real-Time Active</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold text-white pt-1">
                    {analytics?.realTimeActiveUsers || 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">Users actively browsing site right now</p>
                </CardContent>
              </Card>

              {/* Today's Visitors */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    <span>Today's Visitors</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold text-white pt-1">
                    {analytics?.todayVisitors || 14}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">Unique visitors in past 24 hours</p>
                </CardContent>
              </Card>

              {/* Monthly Active Visitors */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    <span>Monthly Users</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold text-white pt-1">
                    {analytics?.monthlyVisitors || 89}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">30-day cumulative audience reach</p>
                </CardContent>
              </Card>

              {/* Total Pageviews */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <span>Total Page Views</span>
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold text-white pt-1">
                    {analytics?.totalPageViews || 245}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">All-time calculator & page loads</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row: 14-Day Traffic Trend & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Traffic Area Chart */}
              <Card className="lg:col-span-2 bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="border-b border-slate-800/60 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        14-Day Visitor & Pageview Trends
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Daily traffic distribution over the last 2 weeks
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        Visitors
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        Page Views
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analytics?.dailyTrends || []}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="visitorColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="pageviewColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="pageViews"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#pageviewColor)"
                          name="Page Views"
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#visitorColor)"
                          name="Unique Visitors"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Device Platforms Breakdown */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl flex flex-col justify-between">
                <CardHeader className="border-b border-slate-800/60 pb-4">
                  <CardTitle className="text-lg font-bold text-white">Device Breakdown</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Platform distribution across visitors
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[180px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.devices || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="count"
                        >
                          {(analytics?.devices || []).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Device List summary */}
                  <div className="space-y-2 mt-4">
                    {(analytics?.devices || []).map((dev, idx) => (
                      <div
                        key={dev.name}
                        className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: DEVICE_COLORS[idx % DEVICE_COLORS.length] }}
                          />
                          <span className="text-slate-300 font-medium">{dev.name}</span>
                        </div>
                        <div className="text-slate-400 font-semibold">
                          {dev.count} ({dev.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Country Wise Visitor Breakdown & Top Visited Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Table */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="border-b border-slate-800/60 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-lg font-bold text-white">
                        Country & Regional District Visitors
                      </CardTitle>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {analytics?.countries?.length || 0} Regions Tracked
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-4 sm:px-6">
                  <div className="space-y-3.5">
                    {(analytics?.countries || []).map((item) => (
                      <div key={item.code} className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 font-medium text-slate-200">
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-600/30 text-white border border-blue-400/40 shadow-xs min-w-[28px]">
                              {item.code}
                            </span>
                            <span className="text-white font-medium">{item.country}</span>
                            {(item as any).city && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                &bull; {(item as any).city}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">{item.count} users</span>
                            <span className="text-xs font-mono text-slate-400 w-10 text-right">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Pages & Features */}
              <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
                <CardHeader className="border-b border-slate-800/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="text-lg font-bold text-white">
                      Top Visited Pages & Modules
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-4 sm:px-6">
                  <div className="space-y-3.5">
                    {(analytics?.topPages || []).map((page) => (
                      <div key={page.path} className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div>
                            <div className="font-medium text-slate-200">{page.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{page.path}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-white">{page.views} views</div>
                            <div className="text-[11px] text-slate-400">{page.percentage}% share</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, page.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Active Session Stream with Digital Fingerprints */}
            <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
              <CardHeader className="border-b border-slate-800/60 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <div>
                      <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        Live Active Sessions & Digital Fingerprints
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Cookie-less Hardware ID
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Updates live every 15s</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(analytics?.realTimeSessions || []).map((session: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-600/30 text-white border border-blue-400/40 shadow-xs min-w-[28px] shrink-0">
                            {session.countryCode || "IN"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span className="text-white">
                                {session.locationFormatted || (session.city ? `${session.city} / ${session.country}` : session.country)}
                              </span>
                              <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                {session.fingerprint || `#dev_${session.sessionId?.substring(0, 6)}`}
                              </span>
                              {/* Visit Count Badge */}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {session.visitCount && session.visitCount > 1 ? `🔥 ${session.visitCount} Visits` : "🎯 1st Visit"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {session.path}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          {session.secondsAgo}s ago
                        </span>
                      </div>

                      {/* Full Hardware details - Never truncated */}
                      <div className="pt-2.5 border-t border-slate-800/60 flex flex-col gap-1 text-[11px]">
                        <div className="flex items-start gap-1.5 text-slate-200 font-medium break-words leading-snug">
                          <span className="shrink-0">🖥️</span>
                          <span className="text-slate-100 break-words">{session.gpu || session.device}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 pl-5">
                          Resolution: {session.screen || session.os || "Desktop Display"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recognized Returning Devices & Visit History */}
            <Card className="bg-slate-900/90 border-slate-800/80 shadow-xl">
              <CardHeader className="border-b border-slate-800/60 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-amber-400" />
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        Recognized Unique Visitors & Visit Frequency
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Tracks returning users over time based on immutable hardware digital fingerprints
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-4 sm:px-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Device Fingerprint</th>
                        <th className="pb-3 font-semibold">City & Country Location</th>
                        <th className="pb-3 font-semibold text-center">Visit Count</th>
                        <th className="pb-3 font-semibold text-center">Page Views</th>
                        <th className="pb-3 font-semibold">Hardware GPU & Display</th>
                        <th className="pb-3 font-semibold text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {((analytics as any)?.topReturningVisitors || []).map((v: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 pr-4 font-mono font-medium text-purple-300">
                            <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-xs">
                              {v.fingerprint}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2 font-medium text-slate-200">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/30 text-white border border-blue-400/40 min-w-[24px]">
                                {v.countryCode || "IN"}
                              </span>
                              <span className="text-white font-medium">
                                {v.locationFormatted || (v.city ? `${v.city} / ${v.country}` : v.country)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {v.visitCount} visits
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                            {v.pageViews} views
                          </td>
                          <td className="py-3.5 pr-4 max-w-[260px]">
                            <div className="truncate text-slate-300 font-medium text-xs">
                              {v.gpu}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {v.screen}
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-mono text-slate-400 text-xs whitespace-nowrap">
                            {v.lastActiveAgo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Messages Content */}
        {activeTab === "messages" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  Contact Inquiries ({messages.length})
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  User feedback, inquiries, and collaboration requests submitted via contact form
                </p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                <Inbox className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium text-slate-400">No inquiry messages yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  New submissions from the Contact Form will appear here automatically
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {messages.map((msg) => (
                  <Card
                    key={msg.id}
                    className="bg-slate-900/90 border-slate-800 text-white overflow-hidden hover:border-slate-700 transition-all shadow-lg"
                  >
                    <CardHeader className="bg-slate-950/60 border-b border-slate-800/80 pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-semibold text-white truncate leading-tight">
                          {msg.name}
                        </CardTitle>
                        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                          {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime())
                            ? format(new Date(msg.timestamp), "MMM d, yyyy")
                            : "Recent"}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-slate-400 truncate">
                        {msg.email} &bull; <span className="capitalize">{msg.nationality}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
