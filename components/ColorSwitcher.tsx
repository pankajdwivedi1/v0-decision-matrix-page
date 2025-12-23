"use client"

import React, { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

const themes = [
    { id: 'white', bg: '#ffffff', text: '#000000', label: 'Default' },
    { id: 'charcoal', bg: '#1e293b', text: '#ffffff', label: 'Charcoal' },
    { id: 'peach', bg: '#fff7ed', text: '#000000', label: 'Soft Peach' },
    { id: 'green', bg: '#064e3b', text: '#ffffff', label: 'Deep Forest' },
    { id: 'brown', bg: '#3b0a01', text: '#ffffff', label: 'Rich Espresso' },
    { id: 'darkblue', bg: '#0f172a', text: '#ffffff', label: 'Midnight Blue' },
    { id: 'lightblue', bg: '#f0f9ff', text: '#000000', label: 'Sky Mist' },
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
        // Convert hex to oklch or just use hex directly for background
        // Since the app uses tailwind variables, we can just inject hex into the CSS variable
        // But tailwind 4 with oklch might be picky. Let's use hex in a custom property if needed.

        // Actually, we can just set the style on the root element
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
        <div className="flex items-center gap-0.5">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={cn(
                        "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none border border-gray-300 shadow-xs transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-500",
                        activeTheme === t.id ? "ring-1 ring-black scale-110" : ""
                    )}
                    style={{ backgroundColor: t.bg }}
                    title={t.label}
                />
            ))}
        </div>
    )
}
