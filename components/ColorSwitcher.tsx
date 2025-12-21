"use client"

import React, { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

const themes = [
    { id: 'white', bg: '#ffffff', text: '#000000', label: 'Default' },
    { id: 'gray', bg: '#a1a1aa', text: '#ffffff', label: 'Gray' },
    { id: 'peach', bg: '#f9b17a', text: '#000000', label: 'Peach' },
    { id: 'green', bg: '#10b981', text: '#ffffff', label: 'Green' },
    { id: 'brown', bg: '#c2410c', text: '#ffffff', label: 'Brown' },
    { id: 'darkblue', bg: '#1e3a8a', text: '#ffffff', label: 'Dark Blue' },
    { id: 'lightblue', bg: '#93c5fd', text: '#000000', label: 'Light Blue' },
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
        <div className="flex items-center gap-1.5 sm:gap-2 mr-2">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 shadow-sm transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        activeTheme === t.id ? "ring-2 ring-black scale-110" : ""
                    )}
                    style={{ backgroundColor: t.bg }}
                    title={t.label}
                />
            ))}
        </div>
    )
}
