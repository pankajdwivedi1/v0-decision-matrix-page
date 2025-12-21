"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { cn } from "@/lib/utils"

// Sample Data derived/mocked based on a consistent underlying decision problem
// 4 Alternatives, 4 Criteria
// Weights: 0.25, 0.30, 0.25, 0.20
// Types: Benefit, Benefit, Cost, Benefit

const slides = [
    {
        id: "decision",
        title: "Decision Matrix",
        method: "Input Data",
        color: "bg-blue-500",
        description: "Raw performance values for each alternative against criteria.",
        headers: ["Criteria", "Weight", "Profit ▲", "Quality ▲", "Cost ▼"],
        rows: [
            { name: "Alt A", weight: "-", values: ["8.5", "7.5", "2500", "15"] },
            { name: "Alt B", weight: "-", values: ["7.2", "8.1", "2100", "18"] },
            { name: "Alt C", weight: "-", values: ["9.1", "6.8", "2800", "12"] },
            { name: "Alt D", weight: "-", values: ["6.5", "7.9", "1900", "20"] },
        ],
        weights: [0.25, 0.30, 0.25, 0.20]
    },
    {
        id: "normalized",
        title: "Normalized Matrix",
        method: "Pre-processing",
        color: "bg-purple-500",
        description: "Values scaled to 0-1 range for comparability.",
        headers: ["Criteria", "Weight", "Profit ▲", "Quality ▲", "Cost ▼"],
        rows: [
            { name: "Alt A", weight: "-", values: ["0.27", "0.25", "0.21", "0.29"] },
            { name: "Alt B", weight: "-", values: ["0.23", "0.27", "0.25", "0.24"] },
            { name: "Alt C", weight: "-", values: ["0.29", "0.22", "0.19", "0.36"] },
            { name: "Alt D", weight: "-", values: ["0.21", "0.26", "0.35", "0.11"] },
        ]
    },
    {
        id: "swei_exp",
        title: "Weighted Exponential Info",
        method: "SWEI Method",
        color: "bg-emerald-500",
        description: "Exponential aggregation of information content.",
        headers: ["Criteria", "W=0.25", "W=0.30", "W=0.25", "W=0.20"],
        rows: [
            { name: "Alt A", weight: "-", values: ["1.32", "1.41", "1.15", "1.22"] },
            { name: "Alt B", weight: "-", values: ["1.18", "1.55", "1.28", "1.15"] },
            { name: "Alt C", weight: "-", values: ["1.45", "1.12", "1.05", "1.67"] },
            { name: "Alt D", weight: "-", values: ["1.05", "1.38", "1.52", "0.98"] },
        ]
    },
    {
        id: "swi_info",
        title: "Information Score",
        method: "SWI Method",
        color: "bg-amber-500",
        description: "Entropy-based information measure calculations.",
        headers: ["Criteria", "Info 1", "Info 2", "Info 3", "Info 4"],
        rows: [
            { name: "Alt A", weight: "-", values: ["0.88", "0.92", "0.45", "0.67"] },
            { name: "Alt B", weight: "-", values: ["0.75", "0.85", "0.55", "0.58"] },
            { name: "Alt C", weight: "-", values: ["0.95", "0.78", "0.38", "0.82"] },
            { name: "Alt D", weight: "-", values: ["0.62", "0.81", "0.65", "0.45"] },
        ]
    },
    {
        id: "topsis_weighted",
        title: "Weighted Normalized",
        method: "TOPSIS Method",
        color: "bg-indigo-500",
        description: "Distance-based weighted values relative to ideal.",
        headers: ["Criteria", "V1", "V2", "V3", "V4"],
        rows: [
            { name: "Alt A", weight: "-", values: ["0.15", "0.18", "0.11", "0.09"] },
            { name: "Alt B", weight: "-", values: ["0.12", "0.21", "0.14", "0.08"] },
            { name: "Alt C", weight: "-", values: ["0.18", "0.15", "0.09", "0.12"] },
            { name: "Alt D", weight: "-", values: ["0.09", "0.19", "0.16", "0.06"] },
        ]
    }
]

export default function DynamicMatrixPreview() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        if (paused) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [paused])

    const currentSlide = slides[currentIndex]

    return (
        <div
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-white border-0 font-bold px-2 py-0.5 text-[10px] rounded-full", currentSlide.color)}>
                            {currentSlide.method}
                        </span>
                        <span className="text-sm font-bold">{currentSlide.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 hidden sm:inline-block">{currentSlide.description}</span>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-1.5">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                idx === currentIndex ? "bg-blue-600 w-3" : "bg-blue-600/20 hover:bg-blue-600/40"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Table Content with Animation */}
            <div className="relative h-[240px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 p-0 overflow-x-auto scroller-hidden"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    {currentSlide.headers.map((header, i) => (
                                        <TableHead key={i} className={cn(
                                            "text-xs py-2 px-3 font-semibold text-center h-10 border-b border-gray-100",
                                            i === 0 ? "text-left text-gray-500 w-[100px]" : ""
                                        )}>
                                            {header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentSlide.rows.map((row, i) => (
                                    <TableRow key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium text-xs py-3 px-3 border-r border-gray-100 bg-gray-50/30">
                                            {row.name}
                                        </TableCell>
                                        {/* If first slide, show weights if applicable, but here we just show values */}
                                        {row.values.map((val, j) => (
                                            <TableCell key={j} className="text-xs text-center border-r border-gray-100 last:border-0 font-mono text-gray-700">
                                                {val}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Status */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
        </div>
    )
}
