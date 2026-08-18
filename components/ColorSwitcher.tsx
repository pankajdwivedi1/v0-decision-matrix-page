"use client"

import React, { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

const themes = [
    { id: 'white', bg: '#ffffff', text: '#000000', label: 'Pure White' },
    { id: 'alabaster', bg: '#faf7f2', text: '#1c1917', label: 'Warm Alabaster' },
    { id: 'arctic', bg: '#f0f7ff', text: '#0f172a', label: 'Arctic Frost' },
    { id: 'lavender', bg: '#f5f3ff', text: '#1e1b4b', label: 'Lavender Dream' },
    { id: 'jade', bg: '#f0fdf4', text: '#064e3b', label: 'Botanical Jade' },
    { id: 'blush', bg: '#fff1f5', text: '#4c0519', label: 'Abstract Blush' },
    { id: 'obsidian', bg: '#0f172a', text: '#ffffff', label: 'Cosmic Obsidian' },
    { id: 'royal', bg: '#1e1b4b', text: '#ffffff', label: 'Royal Velvet' },
]

export default function ColorSwitcher() {
    const [activeTheme, setActiveTheme] = useState('white')

    useEffect(() => {
        const saved = localStorage.getItem('app-page-theme')
        if (saved) {
            applyTheme(saved)
        }
    }, [])

    const applyTheme = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId)
        if (!theme) return

        document.documentElement.style.setProperty('--background', theme.bg)
        document.documentElement.style.setProperty('--page-bg-color', theme.bg)
        document.documentElement.style.setProperty('--page-text-color', theme.text)

        if (theme.text === '#ffffff') {
            document.documentElement.classList.add('theme-dark-text')
        } else {
            document.documentElement.classList.remove('theme-dark-text')
        }

        setActiveTheme(themeId)
        localStorage.setItem('app-page-theme', themeId)
    }

    return (
        <div 
            className="flex items-center gap-1 bg-slate-100/90 hover:bg-slate-200/70 transition-colors p-1 rounded-full border border-slate-200/80 shadow-xs" 
            title="Theme Palette"
        >
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={cn(
                        "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/15 shadow-xs transition-all duration-150 hover:scale-125 focus:outline-none",
                        activeTheme === t.id ? "ring-2 ring-offset-1 ring-blue-600 scale-110 z-10 shadow-sm" : "opacity-85 hover:opacity-100"
                    )}
                    style={{ backgroundColor: t.bg }}
                    title={t.label}
                    aria-label={t.label}
                />
            ))}
        </div>
    )
}
