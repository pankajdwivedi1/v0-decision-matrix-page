"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, Inbox, AlertCircle, RefreshCw, LogOut } from "lucide-react"
import { format } from "date-fns"

// Login Form Schema
const loginSchema = z.object({
    password: z.string().min(1, "Password is required"),
})

interface Message {
    id: string
    name: string
    email: string
    nationality: string
    message: string
    timestamp: string
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])

    // Store password in state to reuse for refreshes (basic session handling)
    const [sessionPassword, setSessionPassword] = useState("")

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            password: "",
        },
    })

    const fetchMessages = async (password: string) => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setMessages(data.messages)
                setIsAuthenticated(true)
                setSessionPassword(password)
                if (!isAuthenticated) toast.success("Login successful")
            } else {
                toast.error(data.error || "Authentication failed")
                if (isAuthenticated) setIsAuthenticated(false) // Logout if session invalid
            }
        } catch (error) {
            toast.error("Failed to connect to server")
        } finally {
            setLoading(false)
        }
    }

    const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
        fetchMessages(values.password)
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        setSessionPassword("")
        setMessages([])
        loginForm.reset()
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                            <Lock className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
                        <CardDescription className="text-center">
                            Enter your authentication credentials to view messages
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Dashboard"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="border-b bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <Inbox className="w-5 h-5" />
                        Admin Dashboard
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => fetchMessages(sessionPassword)} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Messages ({messages.length})</h1>

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Inbox className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">No messages found</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {messages.map((msg) => (
                            <Card key={msg.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-base font-semibold truncate leading-tight">
                                            {msg.name}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime())
                                                ? format(new Date(msg.timestamp), 'MMM d, yyyy')
                                                : 'Invalid Date'}
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs truncate">
                                        {msg.email} &bull; {msg.nationality}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm whitespace-pre-wrap">
                                    {msg.message}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
