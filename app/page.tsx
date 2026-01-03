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
  Info,
  Menu,
  X
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
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
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

const metricsData = [
  { subject: 'Consistency', A: 120, B: 110, fullMark: 150 },
  { subject: 'Efficiency', A: 98, B: 130, fullMark: 150 },
  { subject: 'Robustness', A: 86, B: 130, fullMark: 150 },
  { subject: 'Scalability', A: 99, B: 100, fullMark: 150 },
  { subject: 'Accuracy', A: 85, B: 90, fullMark: 150 },
  { subject: 'Speed', A: 65, B: 85, fullMark: 150 },
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
    <div className="min-h-screen text-slate-900 font-sans selection:bg-blue-100 transition-colors duration-300 bg-[#fdfdfd]">
      <Toaster position="top-center" richColors />

      {/* Decorative Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1d4ed8] rounded-sm flex items-center justify-center font-serif font-bold text-lg sm:text-xl text-white shadow-sm ring-1 ring-blue-700 shrink-0">
              DA
            </div>
            <div className="flex flex-col -gap-1 overflow-hidden">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-slate-900 truncate">DecisionAlgo</span>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-slate-500 truncate hidden xs:block">Academic Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden text-slate-600">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] border-r-slate-200 p-0">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1d4ed8] rounded-sm flex items-center justify-center font-serif font-bold text-white">
                    DA
                  </div>
                  <span className="font-serif font-bold text-lg text-slate-900">DecisionAlgo</span>
                </div>
                <div className="px-6 py-8 flex flex-col gap-6">
                  {['Methodology', 'Analysis', 'Showcase', 'Contact'].map((item) => (
                    <SheetClose key={item} asChild>
                      <button
                        className="text-2xl font-serif font-bold text-slate-400 hover:text-slate-900 text-left transition-all hover:translate-x-2 border-b border-transparent hover:border-slate-100 pb-2"
                        onClick={() => {
                          const el = document.getElementById(item.toLowerCase());
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {item}
                      </button>
                    </SheetClose>
                  ))}
                </div>
                <div className="absolute bottom-10 left-6 right-6 p-6 bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Developed By</p>
                  <p className="text-sm font-serif font-bold text-slate-900">Dr. Pankaj Prasad Dwivedi</p>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden lg:flex items-center gap-8 mr-8">
              {['Methodology', 'Analysis', 'Showcase', 'Contact'].map((item) => (
                <button
                  key={item}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors relative group"
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full" />
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100 italic font-black text-xs text-slate-600">
                  {language}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setLanguage("EN")}>EN {language === "EN" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("HI")}>HI {language === "HI" && "✓"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>ES {language === "ES" && "✓"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="hidden sm:flex text-slate-600 hover:text-slate-900" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Home className="h-4 w-4" />
            </Button>

            <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-none px-3 sm:px-6 h-10 text-[10px] sm:text-sm font-semibold tracking-wide shadow-lg shadow-blue-100" onClick={() => window.location.href = '/application'}>
              {t.navbar.getStarted}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Academic Watermark */}
        <div className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] md:h-[800px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-600 text-[8px] sm:text-[10px] font-bold mb-6 md:mb-10 uppercase tracking-[0.25em]">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="font-serif text-3xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-10 leading-[1.1] text-slate-900 tracking-tight">
              PRECISION ANALYSIS <br />
              <span className="text-slate-500 italic font-medium">FOR COMPLEX SYSTEMS</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 md:mb-14 leading-relaxed font-light px-4 sm:px-0">
              Elevate your decision-making with <span className="font-semibold text-slate-900">mathematically rigorous</span> MCDM frameworks
              and real-time computational analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
              <Button size="lg" className="w-full sm:w-auto px-10 bg-[#1d4ed8] hover:bg-[#1e40af] text-white h-12 md:h-16 text-xs sm:text-base font-bold rounded-none tracking-widest shadow-xl shadow-blue-100 transition-all hover:-translate-y-1" onClick={() => window.location.href = '/application'}>
                INITIATE FRAMEWORK <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button size="lg" variant="ghost" className="w-full sm:w-auto px-10 text-slate-600 h-12 md:h-16 text-xs sm:text-base hover:bg-slate-50 rounded-none border-b border-transparent hover:border-slate-200" onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}>
                REVEAL METHODOLOGY
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Abstract Element */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* Why We Make It Section (Methodology) */}
      <section id="methodology" className="py-16 md:py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-6 md:mb-8 text-slate-900 leading-tight">
                Empirical Foundations <br />
                <span className="text-slate-400 font-light italic">of Decision Intelligence</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 md:mb-10 leading-relaxed font-light">
                {t.why.desc} Our approach combines classical MCDM theories with modern computational optimization
                to ensure results are both statistically significant and practically actionable.
              </p>
              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: <Target className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900" />, ...t.why.features[0] },
                  { icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900" />, ...t.why.features[1] },
                  { icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900" />, ...t.why.features[2] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-none border-l-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group">
                    <div className="mt-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-[11px] sm:text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative p-0.5 sm:p-1 bg-slate-100/50"
            >
              <div className="bg-white p-4 sm:p-8 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-black text-slate-400">Fig 01. Correlation Matrix</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
                  </div>
                </div>
                <DynamicMatrixPreview />
                <div className="mt-4 sm:mt-8 grid grid-cols-2 gap-px bg-slate-100 border border-slate-100">
                  <div className="bg-white p-3 sm:p-6 text-center">
                    <span className="block text-xl sm:text-3xl font-serif font-bold text-slate-900">92.4%</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 mt-2 block">{t.why.accuracy}</span>
                  </div>
                  <div className="bg-white p-3 sm:p-6 text-center">
                    <span className="block text-xl sm:text-3xl font-serif font-bold text-slate-900">26+</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 mt-2 block">{t.why.methods}</span>
                  </div>
                </div>
              </div>
              {/* Decorative background element */}
              <div className="hidden sm:block absolute -top-12 -right-12 w-64 h-64 border-r border-t border-slate-100 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section (Procedural Framework) */}
      <section id="how" className="py-16 md:py-32 px-4 bg-[#fdfdfd] border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-4 block">Operation Protocol</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-slate-900">{t.how.title}</h2>
            <div className="w-24 h-px bg-slate-900 mx-auto mb-8" />
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">{t.how.desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-100 bg-white">
            {[
              { step: "I", icon: <Database className="h-5 w-5" />, ...t.how.steps[0] },
              { step: "II", icon: <Layers className="h-5 w-5" />, ...t.how.steps[1] },
              { step: "III", icon: <Calculator className="h-5 w-5" />, ...t.how.steps[2] },
              { step: "IV", icon: <BarChart3 className="h-5 w-5" />, ...t.how.steps[3] },
            ].map((item, i) => (
              <div key={i} className="p-8 sm:p-10 border-b sm:border-b-0 sm:border-r last:border-b-0 lg:last:border-r-0 border-slate-100 hover:bg-slate-50 transition-colors group relative overflow-hidden">
                <span className="text-4xl sm:text-6xl font-serif font-black text-slate-50 absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 transition-transform group-hover:scale-110">{item.step}</span>
                <div className="mb-6 sm:mb-8 p-3 bg-[#1d4ed8] text-white inline-block shadow-lg shadow-blue-100 shrink-0">
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-slate-900 tracking-tight relative z-10">{item.title}</h3>
                <p className="text-[11px] sm:text-sm text-slate-500 font-light leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Requirements (System Specification) */}
      <section className="py-24 md:py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold mb-4 text-slate-900">{t.requirements.title}</h2>
            <p className="text-slate-500 font-light">Operational constraints and system capabilities</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 md:gap-12 text-left px-4 sm:px-0">
            <div className="p-6 sm:p-8 border border-slate-100 bg-slate-50/30">
              <h4 className="text-slate-900 font-bold mb-4 sm:mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-sm sm:text-base">
                <Info className="h-4 w-4 text-slate-400" /> {t.requirements.structure.title}
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-[11px] sm:text-sm text-slate-600 font-light">
                {t.requirements.structure.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 sm:mt-2 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item }} className="break-words" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 sm:p-8 border border-slate-100 bg-slate-50/30">
              <h4 className="text-slate-900 font-bold mb-4 sm:mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-sm sm:text-base">
                <Layers className="h-4 w-4 text-slate-400" /> {t.requirements.capabilities.title}
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-[11px] sm:text-sm text-slate-600 font-light">
                {t.requirements.capabilities.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 sm:mt-2 shrink-0" />
                    <span className="break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Merits Section (Advantages) */}
      <section className="py-16 md:py-32 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl font-bold mb-4 tracking-tight">{t.merits.title}</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {t.merits.items.map((merit, i) => (
              <div key={i} className="p-10 bg-slate-900 hover:bg-slate-800 transition-colors cursor-default">
                <h4 className="font-bold mb-4 flex items-center justify-between group">
                  {merit.title}
                  <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                </h4>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{merit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Showcase: Formula & Graphs (Analysis Report) */}
      <section id="analysis" className="py-16 md:py-32 px-4 bg-[#fdfdfd]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-20 grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-4 block">Experimental Data</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{t.showcase.title}</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-500 font-light leading-relaxed lg:text-right">{t.showcase.desc}</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Formulas Card */}
            <div className="lg:col-span-12 xl:col-span-5 xl:col-start-2 flex flex-col gap-6 md:gap-8">
              <Card className="rounded-none border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-4 sm:p-6 lg:pb-4">
                  <div className="overflow-hidden">
                    <CardTitle className="font-serif text-lg sm:text-xl text-slate-900 truncate">{t.showcase.formulation.title}</CardTitle>
                    <CardDescription className="text-slate-400 font-light text-[10px] sm:text-xs truncate">{t.showcase.formulation.desc}</CardDescription>
                  </div>
                  <div className="flex bg-slate-50 border border-slate-100 p-0.5 sm:p-1 shrink-0">
                    {['swei', 'swi'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-8 bg-slate-50/30 overflow-x-auto">
                  <div className="transform transition-all duration-500 py-0 sm:py-4">
                    {activeTab === 'swei' ? <SWEIFormula landingPage={true} language={language} /> : <SWIFormula landingPage={true} language={language} />}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-serif text-slate-900 tracking-tight">Consolidated Performance</CardTitle>
                  <CardDescription className="text-slate-400 font-light text-[10px] sm:text-xs">Metric efficiency analysis</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] sm:h-[250px] p-4 sm:p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="subject" stroke="#94a3b8" fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="A" stroke="#0f172a" fillOpacity={0.05} fill="#0f172a" name="SWEI" strokeWidth={2} />
                      <Area type="monotone" dataKey="B" stroke="#64748b" fillOpacity={0.05} fill="#64748b" name="SWI" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Graphs Card */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 md:gap-8">
              <Card className="rounded-none border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-serif text-slate-900 tracking-tight">{t.showcase.graphRank.title}</CardTitle>
                  <CardDescription className="text-slate-400 font-light text-[10px] sm:text-xs">{t.showcase.graphRank.desc}</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] sm:h-[250px] p-4 sm:p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingComparisonData} margin={{ left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '10px' }}
                        itemStyle={{ fontSize: '9px', color: '#0f172a' }}
                      />
                      <Bar dataKey="SWEI" fill="#0f172a" radius={[0, 0, 0, 0]} barSize={16} />
                      <Bar dataKey="SWI" fill="#e2e8f0" radius={[0, 0, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-none border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-serif text-slate-900 tracking-tight">{t.showcase.graphSens.title}</CardTitle>
                  <CardDescription className="text-slate-400 font-light text-[10px] sm:text-xs">{t.showcase.graphSens.desc}</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] sm:h-[250px] p-4 sm:p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData} margin={{ left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="weight" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} reversed axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '10px' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '10px' }} />
                      <Line type="monotone" dataKey="rank1" stroke="#0f172a" strokeWidth={2} dot={{ r: 2, fill: '#0f172a' }} name="Alt-1" />
                      <Line type="monotone" dataKey="rank2" stroke="#94a3b8" strokeWidth={1.5} dot={{ r: 2, fill: '#94a3b8' }} name="Alt-2" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Calculated Tables Preview (Statistical Appendix) */}
      <section id="showcase" className="py-16 md:py-32 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-4 block">Data Appendix</span>
            <h2 className="font-serif text-3xl font-bold mb-4 text-slate-900">{t.tables.title}</h2>
            <p className="text-slate-500 font-light max-w-2xl">{t.tables.desc}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t.tables.rankTitle}</h4>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-t-2 border-b border-slate-900">
                      <TableHead className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{t.tables.alt}</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-900 text-center uppercase tracking-tighter">SWEI Rank</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-900 text-center uppercase tracking-tighter">SWI Rank</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-600 text-center uppercase tracking-tighter">{t.tables.avg}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { n: "Alt-1", r1: 1, r2: 2, sc: 0.902 },
                      { n: "Alt-2", r1: 4, r2: 4, sc: 0.795 },
                      { n: "Alt-3", r1: 2, r2: 1, sc: 0.914 },
                      { n: "Alt-4", r1: 3, r2: 3, sc: 0.841 },
                    ].map((r, i) => (
                      <TableRow key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-[11px] sm:text-xs py-3 sm:py-4 font-medium text-slate-900">{r.n}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center text-slate-600">{r.r1}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center text-slate-600">{r.r2}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center font-mono text-slate-400">{r.sc}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-slate-900"><TableCell colSpan={4} className="p-0" /></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t.tables.matrixTitle}</h4>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-t-2 border-b border-slate-900">
                      <TableHead className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{t.tables.metrics}</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-900 text-center uppercase tracking-tighter">SWEI</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-900 text-center uppercase tracking-tighter">TOPSIS</TableHead>
                      <TableHead className="text-[10px] font-black text-slate-900 text-center uppercase tracking-tighter">WASPAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { m: "Consistency Ratio", v1: "0.082", v2: "0.071", v3: "0.075" },
                      { m: "Computation Time", v1: "12ms", v2: "18ms", v3: "15ms" },
                      { m: "Correlation Coefficient", v1: "0.98", v2: "0.95", v3: "0.97" },
                      { m: "Sensitivity Level", v1: "High", v2: "Med", v3: "High" },
                    ].map((r, i) => (
                      <TableRow key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-[11px] sm:text-xs py-3 sm:py-4 font-medium text-slate-500">{r.m}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center text-slate-900">{r.v1}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center text-slate-900">{r.v2}</TableCell>
                        <TableCell className="text-[11px] sm:text-xs text-center text-slate-900">{r.v3}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-slate-900"><TableCell colSpan={4} className="p-0" /></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section (Academic Inquiry) */}
      <section id="contact" className="py-20 md:py-32 px-4 bg-[#fdfdfd]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="text-center lg:text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-4 block">Collaboration</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-slate-900">{t.contact.title}</h2>
              <p className="text-base sm:text-lg text-slate-600 mb-10 sm:mb-12 font-light leading-relaxed">
                {t.contact.desc} We welcome inquiries regarding institutional access, research partnerships, and methodological customisations.
              </p>
              <div className="space-y-6 sm:space-y-8 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-4 sm:gap-6 group text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-[#1d4ed8] flex items-center justify-center text-white transition-transform group-hover:-translate-y-1 shrink-0">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">{t.contact.response}</h4>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-light">{t.contact.responseTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 group text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-white border border-slate-200 flex items-center justify-center text-slate-900 transition-transform group-hover:-translate-y-1 shadow-sm shrink-0">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">{t.contact.access}</h4>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-light">{t.contact.accessPerson}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-1 bg-slate-100 shadow-2xl mt-8 lg:mt-0">
              <div className="bg-white p-6 sm:p-10 border border-slate-100">
                <ContactForm language={language} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer (Final Submission) */}
      <footer className="py-20 md:py-32 px-4 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold mb-6 md:mb-8 tracking-tight px-4 sm:px-0">{t.footer.ctaTitle}</h2>
          <p className="text-base sm:text-xl text-slate-400 mb-10 md:mb-14 font-light max-w-xl mx-auto leading-relaxed px-4">{t.footer.ctaDesc}</p>
          <Button size="lg" className="w-full sm:w-auto px-12 bg-white hover:bg-slate-100 text-slate-900 h-14 md:h-16 text-sm sm:text-lg font-bold rounded-none tracking-[0.2em] shadow-2xl transition-all hover:scale-105" onClick={() => window.location.href = '/application'}>
            {t.footer.ctaButton}
          </Button>

          <div className="mt-20 md:mt-32 pt-12 md:pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-slate-900 flex items-center justify-center font-serif font-black text-[10px] sm:text-xs">DA</div>
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight">DecisionAlgo</span>
              </div>
              <p className="text-[8px] sm:text-[10px] text-white/30 uppercase tracking-[0.3em] mt-1 italic">Advanced Decision Systems © 2025</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">
              <a href="#" className="hover:text-white transition-colors">{t.footer.docs}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.api}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
