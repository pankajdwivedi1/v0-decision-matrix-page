"use client"

import { motion } from "framer-motion"
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function GraphMarquee() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Static data generation to avoid hydration mismatches
    // We generate deterministic "random" data based on index
    const generateChartData = (id: number) => {
        const data = []
        for (let i = 0; i < 8; i++) {
            // Pseudo-random based on id and i
            const val1 = ((id * 7 + i * 13) % 80) + 20
            const val2 = ((id * 3 + i * 19) % 70) + 10
            data.push({
                name: `P${i}`,
                value: val1,
                value2: val2,
            })
        }

        const types = ['area', 'bar', 'area', 'bar', 'bar', 'area', 'area', 'bar', 'area', 'bar']
        const colors = [
            '#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e'
        ]

        return {
            id,
            title: `Metric Analysis ${id + 1}`,
            type: types[id % types.length],
            data,
            color: colors[id % colors.length],
            color2: colors[(id + 1) % colors.length]
        }
    }

    const graphs = Array.from({ length: 10 }, (_, i) => generateChartData(i))

    if (!isMounted) return null

    return (
        <div className="w-full overflow-hidden py-10 relative border-t border-border/40 bg-white/[0.005]">
            <div className="absolute top-0 bottom-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute top-0 bottom-0 right-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />

            <motion.div
                className="flex gap-6 w-max"
                animate={{ x: "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 50
                }}
            >
                {/* Triple the array to ensure smooth looping even on wide screens */}
                {[...graphs, ...graphs, ...graphs].map((graph, idx) => (
                    <Card key={`${graph.id}-${idx}`} className="w-[280px] sm:w-[320px] shrink-0 bg-card/40 border-white/10 backdrop-blur-sm overflow-hidden hover:border-blue-500/30 transition-colors">
                        <CardHeader className="p-3 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: graph.color }} />
                                    {graph.title}
                                </span>
                                <span className="text-[10px] opacity-50 font-mono">ID: {String(graph.id + 100).substring(1)}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[160px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {graph.type === 'area' ? (
                                    <AreaChart data={graph.data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={graph.color} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={graph.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={graph.color}
                                            fillOpacity={1}
                                            fill={`url(#grad-${idx})`}
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={graph.data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                        <Bar
                                            dataKey="value"
                                            fill={graph.color}
                                            radius={[2, 2, 0, 0]}
                                            opacity={0.8}
                                            isAnimationActive={false}
                                        />
                                        <Bar
                                            dataKey="value2"
                                            fill={graph.color2}
                                            radius={[2, 2, 0, 0]}
                                            opacity={0.4}
                                            isAnimationActive={false}
                                        />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>
        </div>
    )
}
