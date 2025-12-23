"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Home,
  Zap,
  Target,
  Layers,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Database,
  ArrowUpRight,
  Calculator,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts"

import SWEIFormula from "@/components/SWEIFormula"
import SWIFormula from "@/components/SWIFormula"
import ContactForm from "@/components/ContactForm"
import { Toaster } from "@/components/ui/sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { translations } from "@/constants/translations"
import DynamicMatrixPreview from "@/components/DynamicMatrixPreview"
import ColorSwitcher from "@/components/ColorSwitcher"

// Sample Data for Showcase
const sampleDecisionMatrix = [
  { alt: "Alt-1", c1: 0.85, c2: 0.72, c3: 0.91, c4: 0.65 },
  { alt: "Alt-2", c1: 0.62, c2: 0.88, c3: 0.75, c4: 0.92 },
  { alt: "Alt-3", c1: 0.94, c2: 0.65, c3: 0.82, c4: 0.78 },
  { alt: "Alt-4", c1: 0.77, c2: 0.81, c3: 0.69, c4: 0.85 },
]

const rankingComparisonData = [
  { name: "Alt-1", SWEI: 0.92, SWI: 0.88, TOPSIS: 0.85 },
  { name: "Alt-2", SWEI: 0.78, SWI: 0.82, TOPSIS: 0.80 },
  { name: "Alt-3", SWEI: 0.89, SWI: 0.91, TOPSIS: 0.93 },
  { name: "Alt-4", SWEI: 0.85, SWI: 0.84, TOPSIS: 0.82 },
]

const sensitivityData = [
  { weight: "0%", rank1: 1, rank2: 3, rank3: 2, rank4: 4 },
  { weight: "20%", rank1: 1, rank2: 2, rank3: 3, rank4: 4 },
  { weight: "40%", rank1: 2, rank2: 1, rank3: 3, rank4: 4 },
  { weight: "60%", rank1: 3, rank2: 1, rank3: 2, rank4: 4 },
  { weight: "80%", rank1: 2, rank2: 1, rank3: 4, rank4: 3 },
  { weight: "100%", rank1: 1, rank2: 2, rank3: 4, rank4: 3 },
]

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("swei")
  const { setTheme, theme } = { setTheme: () => { }, theme: "light" } // Placeholder to avoid breaking references if any remain
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState("EN")

  const t = translations[language as keyof typeof translations]

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("landingLanguage")
    if (savedLang && ["EN", "HI", "ES"].includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("landingLanguage", language)
    }
  }, [language, mounted])

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.()
    }
  }, [activeTab])

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-blue-500/30 transition-colors duration-300 bg-transparent">
      <Toaster position="top-center" richColors />
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
              DA
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">decisionalgo</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Languages className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("EN")}>
                  English {language === "EN" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("HI")}>
                  Hindi {language === "HI" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>
                  Spanish {language === "ES" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>



            <ColorSwitcher />
            <Button variant="ghost" className="text-sm hidden md:flex" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Home className="mr-2 h-4 w-4" /> {t.navbar.home}
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={() => window.location.href = '/application'}>
              {t.navbar.getStarted} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6 inline-block uppercase tracking-wider">
              {t.hero.badge}
            </span>
            <h1 className={`text-4xl sm:text-7xl font-extrabold mb-6 py-2 ${language === 'HI' ? 'tracking-normal text-foreground' : 'tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent'}`}>
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold transition-all hover:scale-105" onClick={() => window.location.href = '/application'}>
                {t.hero.ctaStart} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-border hover:bg-white/5 h-12 text-base" onClick={() => document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' })}>
                {t.hero.ctaFeatures}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why We Make It Section */}
      <section id="why" className="py-24 px-4 border-t border-border/50 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t.why.title}</h2>
              <p className="text-muted-foreground mb-8 max-w-lg">
                {t.why.desc}
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Target className="h-5 w-5 text-blue-500" />, ...t.why.features[0] },
                  { icon: <Zap className="h-5 w-5 text-emerald-500" />, ...t.why.features[1] },
                  { icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />, ...t.why.features[2] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:bg-white/[0.02] transition-colors">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative p-8 rounded-3xl border border-border bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full" />
              <DynamicMatrixPreview />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="block text-2xl font-bold text-emerald-400">92%</span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/70">{t.why.accuracy}</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <span className="block text-2xl font-bold text-blue-400">20+</span>
                  <span className="text-[10px] uppercase tracking-wider text-blue-500/70">{t.why.methods}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.how.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.how.desc}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <Database className="h-6 w-6 text-blue-500" />, ...t.how.steps[0] },
              { step: "02", icon: <Layers className="h-6 w-6 text-indigo-500" />, ...t.how.steps[1] },
              { step: "03", icon: <Calculator className="h-6 w-6 text-emerald-500" />, ...t.how.steps[2] },
              { step: "04", icon: <BarChart3 className="h-6 w-6 text-amber-500" />, ...t.how.steps[3] },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl border border-border/50 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                <span className="absolute top-4 right-6 text-3xl font-black text-white/5 group-hover:text-white/10 transition-colors uppercase italic">{item.step}</span>
                <div className="mb-4 p-3 rounded-lg bg-white/5 inline-block">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{t.requirements.title}</h2>
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="p-6 rounded-2xl border border-border/50 bg-white/[0.01]">
              <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5" /> {t.requirements.structure.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {t.requirements.structure.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-border/50 bg-white/[0.01]">
              <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5" /> {t.requirements.capabilities.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {t.requirements.capabilities.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Merits Section */}
      <section className="py-24 px-4 bg-blue-600/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 uppercase ${language === 'HI' ? 'tracking-normal' : 'tracking-tighter'}`}>{t.merits.title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.merits.items.map((merit, i) => (
              <div key={i} className="p-6 rounded-xl bg-background border border-border hover:border-blue-500/50 transition-all duration-300">
                <h4 className="font-bold mb-2 flex items-center justify-between">
                  {merit.title}
                  <ArrowUpRight className="h-4 w-4 text-gray-600" />
                </h4>
                <p className="text-sm text-muted-foreground/70">{merit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Showcase: Formula & Graphs */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">{t.showcase.title}</h2>
            <p className="text-muted-foreground">{t.showcase.desc}</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Formulas Card */}
            <div className="lg:col-span-12 xl:col-span-7">
              <Card className="bg-card/40 border-border/50 text-white overflow-hidden backdrop-blur-md">
                <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t.showcase.formulation.title}</CardTitle>
                    <CardDescription className="text-blue-500/70">{t.showcase.formulation.desc}</CardDescription>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('swei')}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'swei' ? 'bg-blue-600 text-white' : 'text-muted-foreground/70 hover:text-white'}`}
                    >
                      SWEI
                    </button>
                    <button
                      onClick={() => setActiveTab('swi')}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'swi' ? 'bg-blue-600 text-white' : 'text-muted-foreground/70 hover:text-white'}`}
                    >
                      SWI
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-10 bg-muted/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)] rounded-b-xl overflow-x-auto min-h-[400px]">
                  <div className="transform transition-all duration-500">
                    {activeTab === 'swei' ? <SWEIFormula landingPage={true} language={language} /> : <SWIFormula landingPage={true} language={language} />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphs Card */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
              <Card className="bg-card/40 border-border/50 text-white flex-1 overflow-hidden backdrop-blur-md">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-lg">{t.showcase.graphRank.title}</CardTitle>
                  <CardDescription>{t.showcase.graphRank.desc}</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020817', border: '1px solid #ffffff10', fontSize: '12px' }}
                        itemStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="SWEI" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="SWI" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 text-white flex-1 overflow-hidden backdrop-blur-md">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-lg">{t.showcase.graphSens.title}</CardTitle>
                  <CardDescription>{t.showcase.graphSens.desc}</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="weight" stroke="#666" fontSize={10} />
                      <YAxis stroke="#666" fontSize={10} reversed />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020817', border: '1px solid #ffffff10' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="rank1" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Alt-1" />
                      <Line type="monotone" dataKey="rank2" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Alt-2" />
                      <Line type="monotone" dataKey="rank3" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Alt-3" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Calculated Tables Preview */}
      <section className="py-24 px-4 bg-white/[0.01] border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center sm:text-left">
            <h2 className="text-3xl font-bold mb-4 underline decoration-blue-500 underline-offset-8">{t.tables.title}</h2>
            <p className="text-muted-foreground">{t.tables.desc}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className={`text-sm font-bold uppercase text-muted-foreground/70 ${language === 'HI' ? 'tracking-normal' : 'tracking-widest'}`}>{t.tables.rankTitle}</h4>
              <div className="rounded-xl overflow-x-auto border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 bg-white/5">
                      <TableHead className="text-xs">{t.tables.alt}</TableHead>
                      <TableHead className="text-xs text-center">SWEI Rank</TableHead>
                      <TableHead className="text-xs text-center">SWI Rank</TableHead>
                      <TableHead className="text-xs text-center text-blue-400">{t.tables.avg}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { n: "Alt-1", r1: 1, r2: 2, sc: 0.902 },
                      { n: "Alt-2", r1: 4, r2: 4, sc: 0.795 },
                      { n: "Alt-3", r1: 2, r2: 1, sc: 0.914 },
                      { n: "Alt-4", r1: 3, r2: 3, sc: 0.841 },
                    ].map((r, i) => (
                      <TableRow key={i} className="border-border/50 hover:bg-white/5 transition-colors">
                        <TableCell className="text-xs py-3">{r.n}</TableCell>
                        <TableCell className="text-xs text-center">{r.r1}</TableCell>
                        <TableCell className="text-xs text-center">{r.r2}</TableCell>
                        <TableCell className="text-xs text-center font-mono text-blue-500/80">{r.sc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className={`text-sm font-bold uppercase text-muted-foreground/70 ${language === 'HI' ? 'tracking-normal' : 'tracking-widest'}`}>{t.tables.matrixTitle}</h4>
              <div className="rounded-xl overflow-x-auto border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 bg-white/5">
                      <TableHead className="text-xs">{t.tables.metrics}</TableHead>
                      <TableHead className="text-xs text-center">SWEI</TableHead>
                      <TableHead className="text-xs text-center">TOPSIS</TableHead>
                      <TableHead className="text-xs text-center">WASPAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { m: "Consistency Ratio", v1: "0.082", v2: "0.071", v3: "0.075" },
                      { m: "Computation Time", v1: "12ms", v2: "18ms", v3: "15ms" },
                      { m: "Correlation Coefficient", v1: "0.98", v2: "0.95", v3: "0.97" },
                      { m: "Sensitivity Level", v1: "High", v2: "Med", v3: "High" },
                    ].map((r, i) => (
                      <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="text-xs py-3 font-medium text-gray-400">{r.m}</TableCell>
                        <TableCell className="text-xs text-center">{r.v1}</TableCell>
                        <TableCell className="text-xs text-center">{r.v2}</TableCell>
                        <TableCell className="text-xs text-center">{r.v3}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t.contact.title}</h2>
              <p className="text-muted-foreground mb-8">
                {t.contact.desc}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{t.contact.response}</h4>
                    <p className="text-sm text-muted-foreground">{t.contact.responseTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{t.contact.access}</h4>
                    <p className="text-sm text-muted-foreground">{t.contact.accessPerson}</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-1 bg-background border-border shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <ContactForm language={language} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 px-4 border-t border-border/50 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">{t.footer.ctaTitle}</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">{t.footer.ctaDesc}</p>
          <Button size="lg" className="px-10 bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-bold transition-transform hover:scale-105" onClick={() => window.location.href = '/application'}>
            {t.footer.ctaButton} <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="mt-20 pt-10 border-t border-border/50 flex flex-col sm:row items-center justify-between gap-6">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">DA</div>
              <span className="font-bold text-sm tracking-tight text-foreground">decisionalgo</span>
            </div>
            <p className="text-xs text-muted-foreground/70">© 2025 decisionalgo. {t.footer.developed}</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-blue-400 transition-colors">{t.footer.docs}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{t.footer.api}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
